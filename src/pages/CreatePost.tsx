import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, GradientButton, ImageUpload, useToast } from '../components';
import { createPost, uploadPostImage } from '../lib/posts';

export const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
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
      content: content.trim(),
      image_url: imageUrl || undefined,
    });

    setCreating(false);

    if (error) {
      showToast(`Failed to create post: ${error}`, 'error');
    } else {
      showToast('Post created successfully!', 'success');
      navigate('/app/feed');
    }
  };

  const handleCancel = () => {
    if (content.trim() || selectedImage) {
      if (window.confirm('Discard this post?')) {
        navigate('/app/feed');
      }
    } else {
      navigate('/app/feed');
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-24">
      <SectionHeader 
        title="Create Post" 
        subtitle="Share what's on your mind"
      />

      <GlassCard className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">What's happening?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, achievements, or challenges..."
            disabled={creating}
            className="w-full px-4 py-3 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
            rows={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Add an image (optional)</label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            preview={imagePreview}
            disabled={creating}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <GradientButton
            variant="secondary"
            onClick={handleCancel}
            disabled={creating}
            className="flex-1"
          >
            Cancel
          </GradientButton>
          <GradientButton
            variant="primary"
            onClick={handleCreatePost}
            disabled={creating || !content.trim()}
            className="flex-1"
          >
            {creating ? 'Posting...' : 'Post'}
          </GradientButton>
        </div>
      </GlassCard>

      {/* Tips Card */}
      <GlassCard className="mt-6">
        <h3 className="font-bold mb-2">💡 Tips for Great Posts</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Share your basketball achievements and progress</li>
          <li>• Post photos from your games and training</li>
          <li>• Challenge other players to compete</li>
          <li>• Ask questions and engage with the community</li>
          <li>• Be respectful and supportive</li>
        </ul>
      </GlassCard>
    </div>
  );
};
