import React, { useState } from 'react';
import { useItems } from '../contexts/ItemContext';
import { useMatches } from '../contexts/MatchContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import ItemCard from '../components/items/ItemCard';
import ItemDetail from '../components/items/ItemDetail';
import MatchCard from '../components/matches/MatchCard';
import { ArrowRight, Search, Package, MapPin } from 'lucide-react';
import { Item } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { userItems, items } = useItems();
  const { matches } = useMatches();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Recent items
  const recentItems = userItems
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Match logic
  const userItemIds = userItems.map(item => item.id);
  const relevantMatches = matches.filter(
    match => userItemIds.includes(match.lost_item) || userItemIds.includes(match.found_item)
  );

  const getMatchedItems = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { lostItem: null, foundItem: null };

    const lostItem = items.find(item => item.id === match.lost_item) || null;
    const foundItem = items.find(item => item.id === match.found_item) || null;
    return { lostItem, foundItem };
  };

  const matchedItems = userItems.filter(item => item.status === 'matched');
  const lostItemsCount = userItems.filter(item => item.type === 'lost').length;
  const foundItemsCount = userItems.filter(item => item.type === 'found').length;
  const matchedItemsCount = matchedItems.length;

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}</h1>
        <p className="mt-1 text-gray-600">Here's an overview of your lost and found items</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-primary-800 text-sm font-medium">Lost Items</p>
              <h3 className="mt-1 text-2xl font-semibold text-primary-900">{lostItemsCount}</h3>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Package className="h-6 w-6 text-primary-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-accent-800 text-sm font-medium">Found Items</p>
              <h3 className="mt-1 text-2xl font-semibold text-accent-900">{foundItemsCount}</h3>
            </div>
            <div className="p-3 bg-accent-100 rounded-full">
              <Search className="h-6 w-6 text-accent-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-success-800 text-sm font-medium">Matched Items</p>
              <h3 className="mt-1 text-2xl font-semibold text-success-900">{matchedItemsCount}</h3>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <MapPin className="h-6 w-6 text-success-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Items</h2>
          <button
            onClick={() => window.location.href = '/my-items'}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-6">You haven't reported any items yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentItems.map(item => (
              <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Matches */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Matches</h2>
        </div>

        {relevantMatches.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-6">No matches found for your items yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {relevantMatches
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 2)
              .map(match => {
                const { lostItem, foundItem } = getMatchedItems(match.id);
                if (!lostItem || !foundItem) return null;

                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    lostItem={lostItem}
                    foundItem={foundItem}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
