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
    const errorMessage = error instanceof Error ? error.message : 'Failed to load feed. Please try again.';
    return { data: null, error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to create post. Please try again.';
    return { data: null, error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete post. Please try again.';
    return { error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to like post. Please try again.';
    return { error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to unlike post. Please try again.';
    return { error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to load comments. Please try again.';
    return { data: null, error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to add comment. Please try again.';
    return { data: null, error: errorMessage };
  }
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadPostImage(file: File) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit. Please choose a smaller image.');
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      // Provide more specific error messages
      if (error.message.includes('row-level security')) {
        throw new Error('Permission denied. Please ensure the storage bucket is properly configured.');
      } else if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket not found. Please contact support.');
      }
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path);

    return { data: { path: data.path, url: publicUrl }, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
    return { data: null, error: errorMessage };
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

    // Check if post exists first
    const { data: postExists, error: checkError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking post existence:', checkError);
      throw new Error('Failed to verify post');
    }

    if (!postExists) {
      throw new Error('Post not found');
    }

    const { error } = await supabase
      .from('post_reposts')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (error) {
      // Check if it's a duplicate repost error
      if (error.code === '23505') {
        throw new Error('You have already reposted this post');
      }
      throw error;
    }
    return { error: null };
  } catch (error) {
    console.error('Error reposting post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to repost. Please try again.';
    return { error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to unrepost. Please try again.';
    return { error: errorMessage };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to load reposts. Please try again.';
    return { data: null, error: errorMessage };
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string) {
  try {
    // Use RPC function with SECURITY DEFINER to bypass RLS issues
    // This is the same pattern as getFeedPosts and fixes the "Failed to load post" error
    const { data, error } = await supabase.rpc('get_single_post', {
      post_uuid: postId,
    });

    if (error) throw error;
    
    // RPC returns an array, get the first item
    const postData = data && data.length > 0 ? data[0] : null;
    
    if (!postData) {
      throw new Error('Post not found');
    }

    // Transform the data to match PostWithUser interface
    const post: PostWithUser = {
      id: postData.post_id,
      user_id: postData.user_id,
      type: postData.post_type as 'text' | 'image' | 'challenge',
      content: postData.post_content,
      image_url: postData.post_image_url,
      challenge_id: postData.post_challenge_id,
      likes_count: postData.likes_count,
      comments_count: postData.comments_count,
      shares_count: postData.shares_count,
      created_at: postData.created_at,
      updated_at: postData.updated_at,
      user_display_name: postData.user_display_name,
      is_liked_by_me: postData.is_liked_by_me,
      is_reposted_by_me: postData.is_reposted_by_me,
    };

    return { data: post, error: null };
  } catch (error) {
    console.error('Error fetching post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load post. Please try again.';
    return { data: null, error: errorMessage };
  }
}

