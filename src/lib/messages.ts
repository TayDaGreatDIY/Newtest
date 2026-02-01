import { supabase } from './supabaseClient';
import type { Message, MessageWithSender, ThreadWithDetails } from '../types/db';

// =====================================================
// MESSAGE THREADS
// =====================================================

/**
 * Get all message threads for the current user
 */
export async function getUserThreads() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('get_user_threads', {
      user_uuid: user.id,
    });

    if (error) throw error;
    return { data: (data || []) as ThreadWithDetails[], error: null };
  } catch (error) {
    console.error('Error fetching user threads:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get or create a thread with another user
 */
export async function getOrCreateThread(otherUserId: string) {
  try {
    const { data, error } = await supabase.rpc('get_or_create_thread', {
      other_user_id: otherUserId,
    });

    if (error) throw error;
    return { data: data as string, error: null }; // Returns thread ID
  } catch (error) {
    console.error('Error getting/creating thread:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Mark a thread as read
 */
export async function markThreadAsRead(threadId: string) {
  try {
    const { error } = await supabase.rpc('mark_thread_as_read', {
      thread_uuid: threadId,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking thread as read:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// =====================================================
// MESSAGES
// =====================================================

/**
 * Get messages in a thread
 */
export async function getThreadMessages(threadId: string, limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase.rpc('get_thread_messages', {
      thread_uuid: threadId,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) throw error;

    // Transform the data to match MessageWithSender interface
    const messages: MessageWithSender[] = (data || []).map((row: {
      message_id: string;
      thread_id: string;
      sender_id: string;
      content: string;
      created_at: string;
      sender_name: string | null;
    }) => ({
      id: row.message_id,
      thread_id: row.thread_id,
      sender_id: row.sender_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.created_at, // RPC doesn't return updated_at
      sender_name: row.sender_name,
    }));

    return { data: messages, error: null };
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send a message to a thread
 */
export async function sendMessage(threadId: string, content: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as Message, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Subscribe to real-time messages in a thread
 */
export function subscribeToThreadMessages(threadId: string, callback: (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}) => void) {
  const channel = supabase
    .channel(`messages-${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to real-time thread updates
 */
export function subscribeToThreadUpdates(callback: (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}) => void) {
  const channel = supabase
    .channel('thread-updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_threads' },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =====================================================
// USER SEARCH
// =====================================================

/**
 * Search for users by display name
 */
export async function searchUsers(query: string, limit = 20) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Search for users whose display name contains the query
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .neq('id', user.id) // Exclude current user
      .ilike('display_name', `%${query}%`)
      .limit(limit);

    if (error) throw error;

    return { 
      data: (data || []).map(profile => ({
        id: profile.id,
        display_name: profile.display_name || 'Anonymous User',
      })), 
      error: null 
    };
  } catch (error) {
    console.error('Error searching users:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get all users except current user
 */
export async function getAllUsers(limit = 100) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .neq('id', user.id)
      .order('display_name', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return { 
      data: (data || []).map(profile => ({
        id: profile.id,
        display_name: profile.display_name || 'Anonymous User',
      })), 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
