import React, { useState, useEffect } from 'react';
import { GlassCard, SectionHeader, GradientButton, EmptyState, Modal, ImageUpload } from '../components';
import { getFeedPosts, likePost, unlikePost, createPost, uploadPostImage, subscribeToPostChanges, subscribeToPostLikeChanges } from '../lib/posts';
import type { PostWithUser } from '../types/db';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribePosts = subscribeToPostChanges(() => {
      loadPosts();
    });

    const unsubscribeLikes = subscribeToPostLikeChanges(() => {
      loadPosts();
    });

    return () => {
      unsubscribePosts();
      unsubscribeLikes();
    };
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await getFeedPosts();
    if (error) {
      setError(error);
    } else if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    const { error } = isLiked ? await unlikePost(postId) : await likePost(postId);
    if (error) {
      alert(`Failed to ${isLiked ? 'unlike' : 'like'} post: ${error}`);
    } else {
      // Optimistic update
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked_by_me: !isLiked, 
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1 
            }
          : post
      ));
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    setCreating(true);
    let imageUrl: string | null = null;

    // Upload image if selected
    if (selectedImage) {
      const { data, error } = await uploadPostImage(selectedImage);
      if (error) {
        alert(`Failed to upload image: ${error}`);
        setCreating(false);
        return;
      }
      imageUrl = data?.url || null;
    }

    // Create post
    const { error } = await createPost({
      type: selectedImage ? 'image' : 'text',
      content: newPostContent,
      image_url: imageUrl || undefined,
    });

    setCreating(false);

    if (error) {
      alert(`Failed to create post: ${error}`);
    } else {
      // Reset form and close modal
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateModal(false);
      // Refresh posts
      loadPosts();
    }
  };

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6">
        <SectionHeader 
          title="Feed" 
          subtitle="What's happening in the community"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6">
        <SectionHeader 
          title="Feed" 
          subtitle="What's happening in the community"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-4 py-6">
        <SectionHeader 
          title="Feed" 
          subtitle="What's happening in the community"
          action={
            <GradientButton size="sm" variant="primary" onClick={() => setShowCreateModal(true)}>
              + Post
            </GradientButton>
          }
        />

        {posts.length === 0 ? (
          <EmptyState 
            icon="📱"
            title="No posts yet"
            description="Be the first to share something with the community!"
            actionLabel="Create Post"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <GlassCard key={post.id} className="space-y-4">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-2xl">
                    🏀
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{post.user_display_name || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-400">{formatTimestamp(post.created_at)}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-base">{post.content}</p>

                {/* Image */}
                {post.type === 'image' && post.image_url && (
                  <div className="w-full rounded-xl overflow-hidden border border-white/10">
                    <img 
                      src={post.image_url} 
                      alt="Post content"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Challenge card */}
                {post.type === 'challenge' && post.challenge_id && (
                  <GlassCard className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Challenge Post</p>
                        <p className="font-bold">View Challenge Details</p>
                      </div>
                      <GradientButton size="sm" variant="accent">
                        View
                      </GradientButton>
                    </div>
                  </GlassCard>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                  <button 
                    onClick={() => handleLike(post.id, post.is_liked_by_me)}
                    className={`flex items-center gap-2 transition-colors ${
                      post.is_liked_by_me ? 'text-pink-500' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{post.is_liked_by_me ? '❤️' : '🤍'}</span>
                    <span className="text-sm">{post.likes_count}</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <span>💬</span>
                    <span className="text-sm">{post.comments_count}</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <span>🔄</span>
                    <span className="text-sm">{post.shares_count}</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewPostContent('');
          setSelectedImage(null);
          setImagePreview(null);
        }}
        title="Create Post"
      >
        <div className="space-y-4">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind?"
            disabled={creating}
            className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
            rows={4}
          />

          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            preview={imagePreview}
            disabled={creating}
          />

          <div className="flex gap-3">
            <GradientButton
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewPostContent('');
                setSelectedImage(null);
                setImagePreview(null);
              }}
              disabled={creating}
              className="flex-1"
            >
              Cancel
            </GradientButton>
            <GradientButton
              variant="primary"
              onClick={handleCreatePost}
              disabled={creating || !newPostContent.trim()}
              className="flex-1"
            >
              {creating ? 'Posting...' : 'Post'}
            </GradientButton>
          </div>
        </div>
      </Modal>
    </>
  );
};
