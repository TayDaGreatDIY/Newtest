import { supabase } from './supabaseClient';
import type { Post, PostWithUser, CreatePostInput, PostComment, PostCommentWithUser, PostRepostWithUser } from '../types/db';

// =====================================================
// POSTS
// =====================================================

/**
 * Get feed posts with pagination
 */
export async function getFeedPosts(limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase.rpc('get_feed_posts', {
      limit_count: limit,
      offset_count: offset,
    });

    if (error) throw error;

    // Transform the data to match PostWithUser interface
    const posts: PostWithUser[] = (data || []).map((row: {
      post_id: string;
      user_id: string;
      post_type: string;
      post_content: string;
      post_image_url: string | null;
      post_challenge_id: string | null;
      likes_count: number;
      comments_count: number;
      shares_count: number;
      created_at: string;
      user_display_name: string | null;
      is_liked_by_me: boolean;
      is_reposted_by_me: boolean;
    }) => ({
      id: row.post_id,
      user_id: row.user_id,
      type: row.post_type as 'text' | 'image' | 'challenge',
      content: row.post_content,
      image_url: row.post_image_url,
      challenge_id: row.post_challenge_id,
      likes_count: row.likes_count,
      comments_count: row.comments_count,
      shares_count: row.shares_count,
      created_at: row.created_at,
      updated_at: row.created_at, // RPC doesn't return updated_at
      user_display_name: row.user_display_name,
      is_liked_by_me: row.is_liked_by_me,
      is_reposted_by_me: row.is_reposted_by_me,
    }));

    return { data: posts, error: null };
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        type: input.type,
        content: input.content,
        image_url: input.image_url || null,
        challenge_id: input.challenge_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as Post, error: null };
  } catch (error) {
    console.error('Error creating post:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Like a post
 */
export async function likePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error liking post:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error unliking post:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string, limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (display_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const comments: PostCommentWithUser[] = (data || []).map((comment: {
      id: string;
      post_id: string;
      user_id: string;
      content: string;
      created_at: string;
      updated_at: string;
      profiles: { display_name: string | null } | null;
    }) => ({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user_display_name: comment.profiles?.display_name || null,
    }));

    return { data: comments, error: null };
  } catch (error) {
    console.error('Error fetching post comments:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Add a comment to a post
 */
export async function addPostComment(postId: string, content: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as PostComment, error: null };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadPostImage(file: File) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path);

    return { data: { path: data.path, url: publicUrl }, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Subscribe to real-time changes on posts
 */
export function subscribeToPostChanges(callback: (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}) => void) {
  const channel = supabase
    .channel('posts-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to real-time changes on post likes
 */
export function subscribeToPostLikeChanges(callback: (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}) => void) {
  const channel = supabase
    .channel('post-likes-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'post_likes' },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Repost a post
 */
export async function repostPost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('post_reposts')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error reposting post:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Unrepost a post
 */
export async function unrepostPost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('post_reposts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error unreposting post:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get users who reposted a post
 */
export async function getPostReposts(postId: string) {
  try {
    const { data, error } = await supabase
      .from('post_reposts')
      .select(`
        *,
        profiles:user_id (display_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reposts: PostRepostWithUser[] = (data || []).map((repost: {
      id: string;
      post_id: string;
      user_id: string;
      created_at: string;
      profiles: { display_name: string | null } | null;
    }) => ({
      id: repost.id,
      post_id: repost.post_id,
      user_id: repost.user_id,
      created_at: repost.created_at,
      user_display_name: repost.profiles?.display_name || null,
    }));

    return { data: reposts, error: null };
  } catch (error) {
    console.error('Error fetching post reposts:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (display_name)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;

    // Check if liked by current user
    const { data: { user } } = await supabase.auth.getUser();
    let isLikedByMe = false;
    let isRepostedByMe = false;

    if (user) {
      const { data: likeData } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      
      isLikedByMe = !!likeData;

      const { data: repostData } = await supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      
      isRepostedByMe = !!repostData;
    }

    const post: PostWithUser = {
      id: data.id,
      user_id: data.user_id,
      type: data.type,
      content: data.content,
      image_url: data.image_url,
      challenge_id: data.challenge_id,
      likes_count: data.likes_count,
      comments_count: data.comments_count,
      shares_count: data.shares_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_display_name: data.profiles?.display_name || null,
      is_liked_by_me: isLikedByMe,
      is_reposted_by_me: isRepostedByMe,
    };

    return { data: post, error: null };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

