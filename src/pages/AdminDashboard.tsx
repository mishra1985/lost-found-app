import React, { useEffect, useState } from 'react';
import { useItems } from '../contexts/ItemContext';
import { useMatches } from '../contexts/MatchContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { BarChart, CircleUser, Package, Search, ClipboardCheck } from 'lucide-react';
import { userStorage } from '../utils/supabaseStorage';
import { User } from '../types';

const AdminDashboard: React.FC = () => {
  const { items } = useItems();
  const { matches } = useMatches();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const result = await userStorage.getAll();
      setUsers(result);
    };
    loadUsers();
  }, []);

  const lostItems = items.filter(item => item.type === 'lost');
  const foundItems = items.filter(item => item.type === 'found');
  const pendingItems = items.filter(item => item.status === 'pending');
  const matchedItems = items.filter(item => item.status === 'matched');

  const pendingMatches = matches.filter(match => match.status === 'pending');
  const approvedMatches = matches.filter(match => match.status === 'approved');
  const rejectedMatches = matches.filter(match => match.status === 'rejected');

  const matchSuccessRate = matches.length > 0
    ? (approvedMatches.length / matches.length * 100).toFixed(1)
    : '0';

  const itemsByCategory = items.reduce((acc, item) => {
    const cat = item.category ?? 'unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(itemsByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Overview of system statistics and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary-50 border border-primary-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-primary-800 text-sm font-medium">Total Users</p>
              <h3 className="mt-1 text-2xl font-semibold text-primary-900">{users.length}</h3>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <CircleUser className="h-6 w-6 text-primary-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-accent-800 text-sm font-medium">Total Items</p>
              <h3 className="mt-1 text-2xl font-semibold text-accent-900">{items.length}</h3>
            </div>
            <div className="p-3 bg-accent-100 rounded-full">
              <Package className="h-6 w-6 text-accent-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-success-800 text-sm font-medium">Matched Items</p>
              <h3 className="mt-1 text-2xl font-semibold text-success-900">{matchedItems.length}</h3>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <ClipboardCheck className="h-6 w-6 text-success-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-warning-50 border border-warning-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-warning-800 text-sm font-medium">Pending Matches</p>
              <h3 className="mt-1 text-2xl font-semibold text-warning-900">{pendingMatches.length}</h3>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <Search className="h-6 w-6 text-warning-700" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Statistics</h2>
          <div className="space-y-4">
            {[['Lost Items', lostItems.length, 'error'], ['Found Items', foundItems.length, 'primary'], ['Pending Items', pendingItems.length, 'warning'], ['Matched Items', matchedItems.length, 'success']].map(([label, count, variant]) => (
              <div key={label as string}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{label}</span>
                  <Badge variant={variant as any}>{count}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`bg-${variant}-500 h-2.5 rounded-full`}
                    style={{ width: `${items.length > 0 ? ((count as number) / items.length * 100).toFixed(1) : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Match Statistics</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[['Pending', pendingMatches.length, 'gray'], ['Approved', approvedMatches.length, 'success'], ['Rejected', rejectedMatches.length, 'error']].map(([label, count, variant]) => (
              <div key={label as string} className={`bg-${variant}-50 rounded-lg p-4 text-center`}>
                <div className={`text-2xl font-bold text-${variant}-600`}>{count}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Match Success Rate</div>
              <div className="text-xl font-bold text-gray-900">{matchSuccessRate}%</div>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart className="w-5 h-5 text-primary-500" />
              <span className="text-xs text-gray-500">Based on {matches.length} total matches</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Reported Categories</h2>
          <div className="space-y-4">
            {sortedCategories.map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 capitalize">{category}</span>
                  <Badge variant="gray">{count}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-accent-500 h-2.5 rounded-full"
                    style={{ width: `${Math.max((count / items.length * 100), 5).toFixed(1)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;