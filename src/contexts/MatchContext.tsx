import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { matchStorage, itemStorage, notificationStorage } from '../utils/supabaseStorage';
import { Match, MatchStatus, Item } from '../types';

interface MatchContextType {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  getMatchById: (id: string) => Match | null;
  getMatchesByItemId: (itemId: string) => Match[];
  getPendingMatches: () => Match[];
  updateMatchStatus: (matchId: string, status: MatchStatus, notes?: string) => Promise<Match | null>;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const all = await matchStorage.getAll();
        setMatches(all);
      } catch (err) {
        setError('Failed to load matches');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMatches();
  }, []);

  const getMatchById = (id: string): Match | null => {
    return matches.find(m => m.id === id) || null;
  };

  const getMatchesByItemId = (itemId: string): Match[] => {
    return matches.filter(m => m.lost_item === itemId || m.found_item === itemId);
  };

  const getPendingMatches = (): Match[] => {
    return matches.filter(match => match.status === 'pending');
  };

  const updateMatchStatus = async (
    matchId: string,
    status: MatchStatus,
    notes?: string
  ): Promise<Match | null> => {
    setIsLoading(true);
    try {
      const match = await matchStorage.getById(matchId);
      if (!match) throw new Error('Match not found');

      const updatedMatch: Match = {
        ...match,
        status,
        admin_notes: notes ?? null,
        created_at: match.created_at
      };

      const savedMatch = await matchStorage.update(updatedMatch);
      setMatches(prev => prev.map(m => m.id === savedMatch.id ? savedMatch : m));

      const lostItem = await itemStorage.getById(match.lost_item);
      const foundItem = await itemStorage.getById(match.found_item);

      if (status === 'approved' && lostItem && foundItem) {
        const now = new Date().toISOString();
        const updatedLost: Item = {
          ...lostItem,
          status: 'matched',
          matched_with: foundItem.id,
          updated_at: now,
        };
        const updatedFound: Item = {
          ...foundItem,
          status: 'matched',
          matched_with: lostItem.id,
          updated_at: now,
        };
        await itemStorage.update(updatedLost);
        await itemStorage.update(updatedFound);

        await notificationStorage.add({
          id: uuidv4(),
          user_id: lostItem.reported_by,
          item_id: lostItem.id,
          message: '✅ Your lost item has been matched!',
          type: 'status',
          read: false,
          created_at: now,
        });

        await notificationStorage.add({
          id: uuidv4(),
          user_id: foundItem.reported_by,
          item_id: foundItem.id,
          message: '✅ Your found item has been matched!',
          type: 'status',
          read: false,
          created_at: now,
        });
      }

      if (status === 'rejected') {
        const now = new Date().toISOString();

        if (lostItem) {
          await itemStorage.update({
            ...lostItem,
            status: 'not_matched',
            matched_with: null,
            updated_at: now,
          });
          await notificationStorage.add({
            id: uuidv4(),
            user_id: lostItem.reported_by,
            item_id: lostItem.id,
            message: '❌ A potential match for your lost item was rejected.',
            type: 'status',
            read: false,
            created_at: now,
          });
        }

        if (foundItem) {
          await itemStorage.update({
            ...foundItem,
            status: 'not_matched',
            matched_with: null,
            updated_at: now,
          });
          await notificationStorage.add({
            id: uuidv4(),
            user_id: foundItem.reported_by,
            item_id: foundItem.id,
            message: '❌ A potential match for your found item was rejected.',
            type: 'status',
            read: false,
            created_at: now,
          });
        }
      }

      return savedMatch;
    } catch (err: any) {
      setError(err.message || 'Failed to update match status');
      console.error('❌ updateMatchStatus error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value: MatchContextType = {
    matches,
    isLoading,
    error,
    getMatchById,
    getMatchesByItemId,
    getPendingMatches,
    updateMatchStatus,
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};

export const useMatches = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (!context) throw new Error('useMatches must be used within MatchProvider');
  return context;
};
