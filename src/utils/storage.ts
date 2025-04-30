import { User, Item, Match, Notification } from '../types';
import { mockItems, mockMatches, mockNotifications, mockUsers } from './mockData';

// Helper to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Initialize storage with mock data if empty
const initializeStorage = (): void => {
  if (!isLocalStorageAvailable()) return;

  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
  
  if (!localStorage.getItem('items')) {
    localStorage.setItem('items', JSON.stringify(mockItems));
  }
  
  if (!localStorage.getItem('matches')) {
    localStorage.setItem('matches', JSON.stringify(mockMatches));
  }
  
  if (!localStorage.getItem('notifications')) {
    localStorage.setItem('notifications', JSON.stringify(mockNotifications));
  }

  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(null));
  }
};

// Generic storage functions for CRUD operations
const getAll = <T>(key: string): T[] => {
  if (!isLocalStorageAvailable()) return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const getById = <T extends { id: string }>(key: string, id: string): T | null => {
  if (!isLocalStorageAvailable()) return null;
  const items = getAll<T>(key);
  return items.find(item => item.id === id) || null;
};

const add = <T extends { id: string }>(key: string, item: T): T => {
  if (!isLocalStorageAvailable()) return item;
  const items = getAll<T>(key);
  localStorage.setItem(key, JSON.stringify([...items, item]));
  return item;
};

const update = <T extends { id: string }>(key: string, updatedItem: T): T => {
  if (!isLocalStorageAvailable()) return updatedItem;
  const items = getAll<T>(key);
  const updatedItems = items.map(item => 
    item.id === updatedItem.id ? updatedItem : item
  );
  localStorage.setItem(key, JSON.stringify(updatedItems));
  return updatedItem;
};

const remove = <T extends { id: string }>(key: string, id: string): boolean => {
  if (!isLocalStorageAvailable()) return false;
  const items = getAll<T>(key);
  const filteredItems = items.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(filteredItems));
  return true;
};

// Specific storage functions for entities
export const userStorage = {
  getAll: () => getAll<User>('users'),
  getById: (id: string) => getById<User>('users', id),
  add: (user: User) => add<User>('users', user),
  update: (user: User) => update<User>('users', user),
  remove: (id: string) => remove<User>('users', id),
  getByEmail: (email: string): User | null => {
    if (!isLocalStorageAvailable()) return null;
    const users = getAll<User>('users');
    return users.find(user => user.email === email) || null;
  },
};

export const itemStorage = {
  getAll: () => getAll<Item>('items'),
  getById: (id: string) => getById<Item>('items', id),
  add: (item: Item) => add<Item>('items', item),
  update: (item: Item) => update<Item>('items', item),
  remove: (id: string) => remove<Item>('items', id),
  getByUserId: (userId: string): Item[] => {
    if (!isLocalStorageAvailable()) return [];
    const items = getAll<Item>('items');
    return items.filter(item => item.reportedBy === userId);
  },
  getByType: (type: 'lost' | 'found'): Item[] => {
    if (!isLocalStorageAvailable()) return [];
    const items = getAll<Item>('items');
    return items.filter(item => item.type === type);
  },
};

export const matchStorage = {
  getAll: () => getAll<Match>('matches'),
  getById: (id: string) => getById<Match>('matches', id),
  add: (match: Match) => add<Match>('matches', match),
  update: (match: Match) => update<Match>('matches', match),
  remove: (id: string) => remove<Match>('matches', id),
  getByItemId: (itemId: string): Match[] => {
    if (!isLocalStorageAvailable()) return [];
    const matches = getAll<Match>('matches');
    return matches.filter(match => match.lostItem === itemId || match.foundItem === itemId);
  },
};

export const notificationStorage = {
  getAll: () => getAll<Notification>('notifications'),
  getById: (id: string) => getById<Notification>('notifications', id),
  add: (notification: Notification) => add<Notification>('notifications', notification),
  update: (notification: Notification) => update<Notification>('notifications', notification),
  remove: (id: string) => remove<Notification>('notifications', id),
  getByUserId: (userId: string): Notification[] => {
    if (!isLocalStorageAvailable()) return [];
    const notifications = getAll<Notification>('notifications');
    return notifications.filter(notification => notification.userId === userId);
  },
  markAsRead: (id: string): Notification | null => {
    if (!isLocalStorageAvailable()) return null;
    const notification = getById<Notification>('notifications', id);
    if (!notification) return null;
    
    const updatedNotification = { ...notification, read: true };
    return update<Notification>('notifications', updatedNotification);
  },
  markAllAsRead: (userId: string): boolean => {
    if (!isLocalStorageAvailable()) return false;
    const notifications = getAll<Notification>('notifications');
    const updatedNotifications = notifications.map(notification => 
      notification.userId === userId && !notification.read 
        ? { ...notification, read: true } 
        : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    return true;
  },
};

// Auth storage
export const authStorage = {
  setCurrentUser: (user: User | null): void => {
    if (!isLocalStorageAvailable()) return;
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  getCurrentUser: (): User | null => {
    if (!isLocalStorageAvailable()) return null;
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  clearCurrentUser: (): void => {
    if (!isLocalStorageAvailable()) return;
    localStorage.setItem('currentUser', JSON.stringify(null));
  },
};

// Initialize storage
initializeStorage();

export default {
  userStorage,
  itemStorage,
  matchStorage,
  notificationStorage,
  authStorage,
  initializeStorage,
};