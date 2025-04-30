// supabaseStorage.ts
import { supabase } from './supabaseClient';
import { User, Item, Match, Notification } from '../types';

// === USERS ===
export const userStorage = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('❌ getAll users failed:', error);
    return data || [];
  },
  getById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) console.error('❌ getById failed:', error);
    return data || null;
  },
  getByEmail: async (email: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) console.error('❌ getByEmail failed:', error);
    return data || null;
  },
  add: async (user: User): Promise<User> => {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) {
      console.error('❌ Failed to insert user into users table:', error);
      throw error;
    }
    return data!;
  },
  update: async (user: User): Promise<User> => {
    const { data, error } = await supabase.from('users').update(user).eq('id', user.id).select().single();
    if (error) throw error;
    return data!;
  },
  remove: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    return !error;
  },
};

// === ITEMS ===
export const itemStorage = {
  getAll: async (): Promise<Item[]> => {
    const { data, error } = await supabase.from('items').select('*');
    if (error) console.error('❌ getAll items failed:', error);
    return data || [];
  },
  getById: async (id: string): Promise<Item | null> => {
    const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
    if (error) console.error('❌ getById item failed:', error);
    return data || null;
  },
  getByUserId: async (user_id: string): Promise<Item[]> => {
    const { data, error } = await supabase.from('items').select('*').eq('reported_by', user_id);
    if (error) console.error('❌ getByUserId items failed:', error);
    return data || [];
  },
  getByType: async (type: 'lost' | 'found'): Promise<Item[]> => {
    const { data, error } = await supabase.from('items').select('*').eq('type', type);
    if (error) console.error('❌ getByType items failed:', error);
    return data || [];
  },
  add: async (item: Item): Promise<Item> => {
    const { data, error } = await supabase.from('items').insert(item).select().single();
    if (error) throw error;
    return data!;
  },
  update: async (item: Item): Promise<Item> => {
    const { data, error } = await supabase.from('items').update(item).eq('id', item.id).select().single();
    if (error) throw error;
    return data!;
  },
  remove: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    return !error;
  },
};

// === MATCHES ===
export const matchStorage = {
  getAll: async (): Promise<Match[]> => {
    const { data, error } = await supabase.from('matches').select('*');
    if (error) console.error('❌ getAll matches failed:', error);
    return data || [];
  },
  getById: async (id: string): Promise<Match | null> => {
    const { data, error } = await supabase.from('matches').select('*').eq('id', id).single();
    if (error) console.error('❌ getById match failed:', error);
    return data || null;
  },
  getByItemId: async (itemId: string): Promise<Match[]> => {
    const { data, error } = await supabase.from('matches').select('*')
      .or(`lost_item.eq.${itemId},found_item.eq.${itemId}`);
    if (error) console.error('❌ getByItemId matches failed:', error);
    return data || [];
  },
  add: async (match: Match): Promise<Match> => {
    const { data, error } = await supabase.from('matches').insert(match).select().single();
    if (error) {
      console.error('❌ Error inserting match:', error);
      return null;
    }
    return data!;
    
  },
  update: async (match: Match): Promise<Match> => {
    const { data, error } = await supabase.from('matches').update(match).eq('id', match.id).select().single();
    if (error) throw error;
    return data!;
  },
  remove: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('matches').delete().eq('id', id);
    return !error;
  },
  
};

// === NOTIFICATIONS ===
export const notificationStorage = {
  getAll: async (): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*');
    if (error) console.error('❌ getAll notifications failed:', error);
    return data || [];
  },
  getById: async (id: string): Promise<Notification | null> => {
    const { data, error } = await supabase.from('notifications').select('*').eq('id', id).single();
    if (error) console.error('❌ getById notification failed:', error);
    return data || null;
  },
  getByUserId: async (user_id: string): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user_id);
    if (error) console.error('❌ getByUserId notifications failed:', error);
    return data || [];
  },
  add: async (notification: Notification): Promise<Notification> => {
    const { data, error } = await supabase.from('notifications').insert(notification).select().single();
    if (error) throw error;
    return data!;
  },
  update: async (notification: Notification): Promise<Notification> => {
    const { data, error } = await supabase.from('notifications').update(notification).eq('id', notification.id).select().single();
    if (error) throw error;
    return data!;
  },
  remove: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    return !error;
  },
  markAsRead: async (id: string): Promise<Notification | null> => {
    const { data, error } = await supabase.from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) console.error('❌ markAsRead failed:', error);
    return data || null;
  },
  markAllAsRead: async (user_id: string): Promise<boolean> => {
    const { error } = await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', user_id)
      .eq('read', false);
    if (error) console.error('❌ markAllAsRead failed:', error);
    return !error;
  },
};

// === AUTH ===
export const authStorage = {
  getCurrentUser: async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('❌ Error fetching current user:', error);
      return null;
    }
    return data?.user || null;
  },
  clearCurrentUser: async (): Promise<void> => {
    await supabase.auth.signOut();
  },
};
