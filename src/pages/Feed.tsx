import React, { useState } from 'react';
import { GlassCard, SectionHeader, GradientButton, EmptyState } from '../components';
import { mockPosts, type Post } from '../data/mockPosts';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <SectionHeader 
        title="Feed" 
        subtitle="What's happening in the community"
        action={
          <GradientButton size="sm" variant="primary">
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
          onAction={() => console.log('Create post')}
        />
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <GlassCard key={post.id} className="space-y-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-2xl">
                  {post.author.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{post.author.name}</h3>
                  <p className="text-sm text-gray-400">{post.timestamp}</p>
                </div>
              </div>

              {/* Content */}
              <p className="text-base">{post.content}</p>

              {/* Image placeholder */}
              {post.type === 'image' && post.imageUrl && (
                <div className="w-full h-64 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="text-gray-400">📷 {post.imageUrl}</span>
                </div>
              )}

              {/* Challenge card */}
              {post.type === 'challenge' && post.challengeData && (
                <GlassCard className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Challenge Type</p>
                      <p className="font-bold">{post.challengeData.type}</p>
                    </div>
                    <GradientButton size="sm" variant="accent">
                      Accept
                    </GradientButton>
                  </div>
                </GlassCard>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    post.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{post.isLiked ? '❤️' : '🤍'}</span>
                  <span className="text-sm">{post.likes}</span>
                </button>
                
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <span>💬</span>
                  <span className="text-sm">{post.comments}</span>
                </button>
                
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <span>🔄</span>
                  <span className="text-sm">{post.shares}</span>
                </button>
                
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                  <span>⚔️</span>
                  <span className="text-sm">Challenge</span>
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
