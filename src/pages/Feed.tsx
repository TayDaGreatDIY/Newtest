import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, GradientButton, EmptyState, Modal, ImageUpload, useToast } from '../components';
import { getFeedPosts, likePost, unlikePost, createPost, uploadPostImage, subscribeToPostChanges, subscribeToPostLikeChanges, repostPost, unrepostPost, getPostReposts } from '../lib/posts';
import type { PostWithUser, PostRepostWithUser } from '../types/db';

export const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRepostsModal, setShowRepostsModal] = useState(false);
  const [reposts, setReposts] = useState<PostRepostWithUser[]>([]);
  const [loadingReposts, setLoadingReposts] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getFeedPosts();
    if (error) {
      setError(error);
    } else if (data) {
      setPosts(data);
    }
    setLoading(false);
  }, []);

  // Load posts on mount
  // This is a legitimate use of calling setState in an effect - we're fetching initial data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPosts();
  }, [loadPosts]);

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
  }, [loadPosts]);

  const handleLike = async (postId: string, isLiked: boolean) => {
    const { error } = isLiked ? await unlikePost(postId) : await likePost(postId);
    if (error) {
      showToast(`Failed to ${isLiked ? 'unlike' : 'like'} post: ${error}`, 'error');
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

  const handleRepost = async (postId: string, isReposted: boolean) => {
    const { error } = isReposted ? await unrepostPost(postId) : await repostPost(postId);
    if (error) {
      showToast(`Failed to ${isReposted ? 'unrepost' : 'repost'} post: ${error}`, 'error');
    } else {
      // Optimistic update
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_reposted_by_me: !isReposted, 
              shares_count: isReposted ? post.shares_count - 1 : post.shares_count + 1 
            }
          : post
      ));
      showToast(isReposted ? 'Unreposted' : 'Reposted!', 'success');
    }
  };

  const handleShowReposts = async (postId: string) => {
    setShowRepostsModal(true);
    setLoadingReposts(true);
    const { data, error } = await getPostReposts(postId);
    setLoadingReposts(false);
    if (error) {
      showToast(`Failed to load reposts: ${error}`, 'error');
    } else if (data) {
      setReposts(data);
    }
  };

  const handleChallenge = () => {
    navigate('/app/challenges');
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      showToast('Please enter some content for your post', 'warning');
      return;
    }

    setCreating(true);
    let imageUrl: string | null = null;

    // Upload image if selected
    if (selectedImage) {
      const { data, error } = await uploadPostImage(selectedImage);
      if (error) {
        showToast(`Failed to upload image: ${error}`, 'error');
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
      showToast(`Failed to create post: ${error}`, 'error');
    } else {
      showToast('Post created successfully!', 'success');
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
            <GradientButton size="sm" variant="primary" onClick={() => navigate('/app/posts/new')}>
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
            onAction={() => navigate('/app/posts/new')}
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
                  <div 
                    className="flex-1 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => navigate(`/app/profile/${post.user_id}`)}
                    title="View profile"
                  >
                    <h3 className="font-bold">{post.user_display_name || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-400">{formatTimestamp(post.created_at)}</p>
                  </div>
                  <GradientButton 
                    size="sm" 
                    variant="accent"
                    onClick={handleChallenge}
                  >
                    Challenge
                  </GradientButton>
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
                      <GradientButton 
                        size="sm" 
                        variant="accent"
                        onClick={() => navigate(`/app/challenges/${post.challenge_id}`)}
                      >
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
                  
                  <button 
                    onClick={() => navigate(`/app/posts/${post.id}`)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <span>💬</span>
                    <span className="text-sm">{post.comments_count}</span>
                  </button>
                  
                  <button 
                    onClick={() => handleRepost(post.id, post.is_reposted_by_me)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleShowReposts(post.id);
                    }}
                    className={`flex items-center gap-2 transition-colors ${
                      post.is_reposted_by_me ? 'text-green-500' : 'text-gray-400 hover:text-white'
                    }`}
                    title="Click to repost, right-click to see who reposted"
                  >
                    <span>🔄</span>
                    <span className="text-sm">{post.shares_count}</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Reposts Modal */}
      <Modal
        isOpen={showRepostsModal}
        onClose={() => {
          setShowRepostsModal(false);
          setReposts([]);
        }}
        title="Reposted by"
      >
        {loadingReposts ? (
          <div className="text-center py-6 text-gray-400">Loading...</div>
        ) : reposts.length === 0 ? (
          <div className="text-center py-6 text-gray-400">No reposts yet</div>
        ) : (
          <div className="space-y-3">
            {reposts.map((repost) => (
              <div key={repost.id} className="flex items-center gap-3 p-3 rounded-lg glass">
                <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-xl">
                  🏀
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{repost.user_display_name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">{formatTimestamp(repost.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Create Post Modal - Kept for backward compatibility but redirects to /app/posts/new */}
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
