import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { itemStorage, matchStorage, notificationStorage } from '../utils/supabaseStorage';
import { Item, ItemFormData, ItemType, User, Match } from '../types';
import { extractTextFeatures, extractImageFeatures, findPotentialMatches } from '../utils/aiMatching';

interface ItemContextType {
  items: Item[];
  userItems: Item[];
  isLoading: boolean;
  error: string | null;
  reportItem: (type: ItemType, data: ItemFormData, user: User) => Promise<Item>;
  getItemById: (id: string) => Promise<Item | null>;
  getLostItems: () => Item[];
  getFoundItems: () => Item[];
  updateItemStatus: (itemId: string, status: Item['status'], matchedItemId?: string) => Promise<Item | null>;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode; currentUser: User | null }> = ({
  children,
  currentUser,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const allItems = await itemStorage.getAll();
        setItems(allItems);
      } catch (err) {
        console.error('Failed to load items:', err);
        setError('Failed to load items');
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  useEffect(() => {
    if (!currentUser) return setUserItems([]);
    const filtered = items.filter(item => item.reported_by === currentUser.id);
    setUserItems(filtered);
  }, [currentUser, items]);

  const reportItem = async (type: ItemType, data: ItemFormData, user: User): Promise<Item> => {
    setIsLoading(true);
    setError(null);

    try {
      let image_url: string | null = null;
      let image_features: number[] | null = null;

      if (data.image) {
        image_url = URL.createObjectURL(data.image);
        image_features = await extractImageFeatures(data.image);
      }

      const text_features = extractTextFeatures(`${data.title} ${data.description}`);

      const newItem: Item = {
        id: uuidv4(),
        type,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        image_url,
        image_features,
        text_features,
        status: 'pending',
        reported_by: user.id,
        matched_with: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const savedItem = await itemStorage.add(newItem);
      const existingItems = await itemStorage.getAll();
      const potentialMatches = findPotentialMatches(savedItem, existingItems);

      console.log('🔍 Potential Matches Found:', potentialMatches);

      for (const match of potentialMatches.slice(0, 3)) {
        const isLostItemNew = savedItem.type === 'lost';

        const matchRecord: Match = {
          id: uuidv4(),
          lost_item: isLostItemNew ? savedItem.id : match.item.id,
          found_item: isLostItemNew ? match.item.id : savedItem.id,
          match_confidence: match.confidence,
          status: 'pending',
          admin_notes: null,
          created_at: new Date().toISOString(),
        };
        await matchStorage.add(matchRecord);

        const lostUser = isLostItemNew ? user.id : match.item.reported_by;
        const foundUser = isLostItemNew ? match.item.reported_by : user.id;

        await notificationStorage.add({
          id: uuidv4(),
          user_id: lostUser,
          item_id: isLostItemNew ? savedItem.id : match.item.id,
          message: '🟡 A potential match was found for your lost item.',
          type: 'match',
          read: false,
          created_at: new Date().toISOString(),
        });

        await notificationStorage.add({
          id: uuidv4(),
          user_id: foundUser,
          item_id: isLostItemNew ? match.item.id : savedItem.id,
          message: '🔍 Your found item might belong to someone.',
          type: 'match',
          read: false,
          created_at: new Date().toISOString(),
        });

        await notificationStorage.add({
          id: uuidv4(),
          user_id: 'b68cfe85-e162-4a09-8b88-5c585f6f3c60', // Admin ID
          item_id: null,
          message: '⚠️ New item match requires your review.',
          type: 'system',
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      setItems(prev => [...prev, savedItem]);
      if (user.id === currentUser?.id) setUserItems(prev => [...prev, savedItem]);

      return savedItem;

    } catch (err: any) {
      console.error('❌ Error in reportItem:', err);
      setError(err.message || 'Failed to report item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getItemById = async (id: string): Promise<Item | null> => {
    return await itemStorage.getById(id);
  };

  const updateItemStatus = async (
    itemId: string,
    status: Item['status'],
    matchedItemId?: string
  ): Promise<Item | null> => {
    setIsLoading(true);
    try {
      const item = await itemStorage.getById(itemId);
      if (!item) throw new Error('Item not found');

      const updatedItem: Item = {
        ...item,
        status,
        matched_with: matchedItemId || null,
        updated_at: new Date().toISOString(),
      };
      await itemStorage.update(updatedItem);

      // Also update the matched item, if any
      if (matchedItemId) {
        const matchedItem = await itemStorage.getById(matchedItemId);
        if (matchedItem) {
          const updatedMatchedItem: Item = {
            ...matchedItem,
            status,
            matched_with: itemId,
            updated_at: new Date().toISOString(),
          };
          await itemStorage.update(updatedMatchedItem);
        }
      }

      // Update local state
      setItems(prev => prev.map(i => i.id === itemId ? updatedItem : i));
      setUserItems(prev => prev.map(i => i.id === itemId ? updatedItem : i));

      return updatedItem;
    } catch (err: any) {
      console.error('❌ updateItemStatus error:', err);
      setError(err.message || 'Failed to update item status');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ItemContextType = {
    items,
    userItems,
    isLoading,
    error,
    reportItem,
    getItemById,
    getLostItems: () => items.filter(item => item.type === 'lost'),
    getFoundItems: () => items.filter(item => item.type === 'found'),
    updateItemStatus,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};

export const useItems = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (!context) throw new Error('useItems must be used within ItemProvider');
  return context;
};
