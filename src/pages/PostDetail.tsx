import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, GradientButton, useToast, Modal } from '../components';
import { getPost, getPostComments, addPostComment, likePost, unlikePost, repostPost, unrepostPost, deletePost } from '../lib/posts';
import type { PostWithUser, PostCommentWithUser } from '../types/db';
import { useAuth } from '../lib/AuthContext';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [comments, setComments] = useState<PostCommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPostMenuModal, setShowPostMenuModal] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/app/feed');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const [postResult, commentsResult] = await Promise.all([
        getPost(id),
        getPostComments(id),
      ]);

      if (postResult.error) {
        setError(postResult.error);
      } else if (postResult.data) {
        setPost(postResult.data);
      }

      if (commentsResult.error) {
        showToast(`Failed to load comments: ${commentsResult.error}`, 'error');
      } else if (commentsResult.data) {
        setComments(commentsResult.data);
      }

      setLoading(false);
    };

    loadData();
  }, [id, navigate, showToast]);

  const handleLike = async () => {
    if (!post) return;
    
    const { error } = post.is_liked_by_me ? await unlikePost(post.id) : await likePost(post.id);
    if (error) {
      showToast(`Failed to ${post.is_liked_by_me ? 'unlike' : 'like'} post: ${error}`, 'error');
    } else {
      // Optimistic update
      setPost({
        ...post,
        is_liked_by_me: !post.is_liked_by_me,
        likes_count: post.is_liked_by_me ? post.likes_count - 1 : post.likes_count + 1,
      });
    }
  };

  const handleRepost = async () => {
    if (!post) return;
    
    const { error } = post.is_reposted_by_me ? await unrepostPost(post.id) : await repostPost(post.id);
    if (error) {
      showToast(`Failed to ${post.is_reposted_by_me ? 'unrepost' : 'repost'} post: ${error}`, 'error');
    } else {
      // Optimistic update
      setPost({
        ...post,
        is_reposted_by_me: !post.is_reposted_by_me,
        shares_count: post.is_reposted_by_me ? post.shares_count - 1 : post.shares_count + 1,
      });
      showToast(post.is_reposted_by_me ? 'Unreposted' : 'Reposted!', 'success');
    }
  };

  const handleAddComment = async () => {
    if (!post || !newComment.trim()) return;

    setSubmitting(true);
    const { data, error } = await addPostComment(post.id, newComment.trim());
    setSubmitting(false);

    if (error) {
      showToast(`Failed to add comment: ${error}`, 'error');
    } else if (data) {
      showToast('Comment added!', 'success');
      setNewComment('');
      // Refresh comments
      const { data: updatedComments } = await getPostComments(post.id);
      if (updatedComments) {
        setComments(updatedComments);
        setPost({ ...post, comments_count: post.comments_count + 1 });
      }
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    
    const { error } = await deletePost(post.id);
    if (error) {
      showToast(`Failed to delete post: ${error}`, 'error');
    } else {
      showToast('Post deleted successfully!', 'success');
      setShowPostMenuModal(false);
      // Navigate back to feed after deleting
      navigate('/app/feed');
    }
  };

  const handleReportPost = () => {
    showToast('Post reported. We will review it shortly.', 'success');
    setShowPostMenuModal(false);
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
        <SectionHeader title="Post" />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen px-4 py-6">
        <SectionHeader title="Post" />
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">Error: {error || 'Post not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 pb-24">
      <SectionHeader 
        title="Post" 
        action={
          <GradientButton size="sm" variant="secondary" onClick={() => navigate('/app/feed')}>
            ← Back
          </GradientButton>
        }
      />

      {/* Post Card */}
      <GlassCard className="space-y-4 mb-6">
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
          {/* Menu button (delete for owner, report for others) */}
          <button
            onClick={() => setShowPostMenuModal(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
            title={user?.id === post.user_id ? "Post options" : "Report post"}
          >
            <span className="text-xl">⋮</span>
          </button>
        </div>

        {/* Content */}
        <p className="text-base">{post.content}</p>

        {/* Image */}
        {post.type === 'image' && post.image_url && (
          <div className="w-full rounded-xl overflow-hidden border border-white/10">
            <img 
              src={post.image_url} 
              alt="Post content"
              className="w-full h-auto object-contain max-h-[600px]"
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
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              post.is_liked_by_me ? 'text-pink-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{post.is_liked_by_me ? '❤️' : '🤍'}</span>
            <span className="text-sm">{post.likes_count}</span>
          </button>
          
          <div className="flex items-center gap-2 text-purple-400">
            <span>💬</span>
            <span className="text-sm">{post.comments_count}</span>
          </div>
          
          <button 
            onClick={handleRepost}
            className={`flex items-center gap-2 transition-colors ${
              post.is_reposted_by_me ? 'text-green-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🔄</span>
            <span className="text-sm">{post.shares_count}</span>
          </button>
        </div>
      </GlassCard>

      {/* Add Comment Section */}
      <GlassCard className="mb-6">
        <h3 className="font-bold mb-3">Add a Comment</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          disabled={submitting}
          className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-3">
          <GradientButton
            variant="primary"
            onClick={handleAddComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </GradientButton>
        </div>
      </GlassCard>

      {/* Comments Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Comments ({comments.length})</h3>
        {comments.length === 0 ? (
          <GlassCard>
            <p className="text-gray-400 text-center py-6">No comments yet. Be the first to comment!</p>
          </GlassCard>
        ) : (
          comments.map((comment) => (
            <GlassCard key={comment.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-xl">
                  🏀
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{comment.user_display_name || 'Anonymous'}</h4>
                  <p className="text-xs text-gray-400">{formatTimestamp(comment.created_at)}</p>
                </div>
              </div>
              <p className="text-sm pl-12">{comment.content}</p>
            </GlassCard>
          ))
        )}
      </div>

      {/* Post Menu Modal */}
      <Modal
        isOpen={showPostMenuModal}
        onClose={() => setShowPostMenuModal(false)}
        title="Post Options"
      >
        <div className="space-y-2">
          {user?.id === post?.user_id ? (
            // Owner options
            <>
              <button
                onClick={handleDeletePost}
                className="w-full px-4 py-3 rounded-xl glass hover:bg-red-500/20 transition-colors text-left text-red-400 hover:text-red-300"
              >
                🗑️ Delete Post
              </button>
              <button
                onClick={() => {
                  showToast('Edit feature coming soon!', 'info');
                  setShowPostMenuModal(false);
                }}
                className="w-full px-4 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-left"
              >
                ✏️ Edit Post
              </button>
            </>
          ) : (
            // Non-owner options
            <>
              <button
                onClick={handleReportPost}
                className="w-full px-4 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-left"
              >
                🚨 Report Post
              </button>
              <button
                onClick={() => {
                  showToast('Privacy settings coming soon!', 'info');
                  setShowPostMenuModal(false);
                }}
                className="w-full px-4 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-left"
              >
                🔒 Privacy Settings
              </button>
              <button
                onClick={() => {
                  showToast('Hide post feature coming soon!', 'info');
                  setShowPostMenuModal(false);
                }}
                className="w-full px-4 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-left"
              >
                👁️ Hide Post
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
