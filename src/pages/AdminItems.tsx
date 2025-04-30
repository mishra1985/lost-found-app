import React, { useState } from 'react';
import { useItems } from '../contexts/ItemContext';
import ItemCard from '../components/items/ItemCard';
import ItemDetail from '../components/items/ItemDetail';
import Card from '../components/common/Card';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import { Search } from 'lucide-react';
import { Item, ItemCategory, ItemStatus, ItemType } from '../types';
import { itemCategories } from '../utils/mockData';

const AdminItems: React.FC = () => {
  const { items } = useItems();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'matched', label: 'Matched' },
    { value: 'completed', label: 'Completed' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'lost', label: 'Lost' },
    { value: 'found', label: 'Found' },
  ];

  const categoryOptionsWithAll = [
    { value: 'all', label: 'All Categories' },
    ...itemCategories,
  ];

  const filteredItems = items.filter(item => {
    // Apply type filter
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    
    // Apply status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    
    // Apply category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Items</h1>
        <p className="mt-1 text-gray-600">
          Browse and manage all reported items in the system
        </p>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search items by title, description, or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              fullWidth
            />
          </div>
          
          <Select
            options={typeOptions as any}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as ItemType | 'all')}
            fullWidth
          />
          
          <Select
            options={statusOptions as any}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as ItemStatus | 'all')}
            fullWidth
          />
          
          <Select
            options={categoryOptionsWithAll as any}
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value as ItemCategory | 'all')}
            fullWidth
            className="md:col-span-2"
          />
        </div>
      </Card>

      {sortedItems.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="text-gray-500 mb-2">No items found matching your filters.</p>
            <p className="text-gray-600">
              Try adjusting your search criteria to see more results.
            </p>
          </div>
        </Card>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Showing {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminItems;