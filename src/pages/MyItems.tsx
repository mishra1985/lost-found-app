import React, { useState } from 'react';
import { useItems } from '../contexts/ItemContext';
import ItemCard from '../components/items/ItemCard';
import ItemDetail from '../components/items/ItemDetail';
import Card from '../components/common/Card';
import { ItemType, Item } from '../types';

const MyItems: React.FC = () => {
  const { userItems } = useItems();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [filter, setFilter] = useState<ItemType | 'all'>('all');

  const filteredItems = userItems.filter(item => 
    filter === 'all' || item.type === filter
  );

  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
        <p className="mt-1 text-gray-600">
          Manage and track all your reported items
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                ${filter === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              All Items ({userItems.length})
            </button>
            <button
              onClick={() => setFilter('lost')}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                ${filter === 'lost'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Lost Items ({userItems.filter(item => item.type === 'lost').length})
            </button>
            <button
              onClick={() => setFilter('found')}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                ${filter === 'found'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Found Items ({userItems.filter(item => item.type === 'found').length})
            </button>
          </nav>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven't reported any {filter !== 'all' ? filter : ''} items yet.</p>
            <p className="text-gray-600">
              Use the "Report Lost Item" or "Report Found Item" options to add items.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;