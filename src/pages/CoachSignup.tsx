import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, GradientButton, ImageUpload } from '../components';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const CoachSignup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [role, setRole] = useState<'coach' | 'trainer' | 'both'>('coach');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [calendlyLink, setCalendlyLink] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');
  const [certificationType, setCertificationType] = useState<'resume' | 'certification' | 'reference' | 'other'>('certification');
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [certificationPreview, setCertificationPreview] = useState<string | null>(null);
  const [uploadedCertifications, setUploadedCertifications] = useState<Array<{ url: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);

  const handleCertificationUpload = async () => {
    if (!certificationFile || !user) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = certificationFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, certificationFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);

      setUploadedCertifications([
        ...uploadedCertifications,
        { url: publicUrl, name: certificationFile.name }
      ]);
      setCertificationFile(null);
      setCertificationPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload certification');
    } finally {
      setUploading(false);
    }
  };

  const handleCertificationSelect = (file: File, preview: string) => {
    setCertificationFile(file);
    setCertificationPreview(preview);
  };

  const handleCertificationRemove = () => {
    setCertificationFile(null);
    setCertificationPreview(null);
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const removeCertification = (index: number) => {
    setUploadedCertifications(uploadedCertifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to become a coach or trainer');
      return;
    }

    if (uploadedCertifications.length === 0) {
      setError('Please upload at least one certification document');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create coach/trainer profile
      const { data: coachData, error: coachError } = await supabase
        .from('coaches_trainers')
        .insert({
          user_id: user.id,
          role,
          bio: bio || null,
          specialties,
          calendly_link: calendlyLink || null,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          location: location || null,
          is_verified: false,
          is_active: true
        })
        .select()
        .single();

      if (coachError) throw coachError;

      // Upload certifications
      const certificationPromises = uploadedCertifications.map((cert) => {
        return supabase.from('coach_certifications').insert({
          coach_id: coachData.id,
          certification_type: certificationType,
          document_url: cert.url,
          document_name: cert.name,
          verified: false
        });
      });

      await Promise.all(certificationPromises);

      // Navigate to profile
      navigate(`/app/coaches/${coachData.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/coaches')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
          Become a Coach or Trainer
        </h1>
        <p className="text-gray-400 text-sm">
          Join our community of certified coaches and trainers
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600' : 'bg-gray-600'}`}>
          1
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`}>
          2
        </div>
        <div className={`w-16 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600' : 'bg-gray-600'}`}>
          3
        </div>
      </div>

      {/* Error */}
      {error && (
        <GlassCard className="mb-6 bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </GlassCard>
      )}

      {/* Step 1: Role and Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <GlassCard>
            <SectionHeader title="Select Your Role" className="mb-4" />
            <div className="space-y-3">
              <button
                onClick={() => setRole('coach')}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  role === 'coach' ? 'bg-purple-600' : 'glass hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏀</span>
                  <div>
                    <p className="font-bold">Coach</p>
                    <p className="text-sm text-gray-400">Guide players in strategy and game skills</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setRole('trainer')}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  role === 'trainer' ? 'bg-purple-600' : 'glass hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💪</span>
                  <div>
                    <p className="font-bold">Trainer</p>
                    <p className="text-sm text-gray-400">Focus on fitness and physical conditioning</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setRole('both')}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  role === 'both' ? 'bg-purple-600' : 'glass hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="font-bold">Both Coach & Trainer</p>
                    <p className="text-sm text-gray-400">Offer comprehensive training services</p>
                  </div>
                </div>
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Basic Information" className="mb-4" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell athletes about yourself..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="5"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="50"
                    step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <GradientButton variant="primary" fullWidth onClick={() => setStep(2)}>
            Continue
          </GradientButton>
        </div>
      )}

      {/* Step 2: Specialties and Calendar */}
      {step === 2 && (
        <div className="space-y-6">
          <GlassCard>
            <SectionHeader title="Specialties" className="mb-4" />
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                  placeholder="e.g., Shooting, Defense, Conditioning..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={addSpecialty}
                  className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Add
                </button>
              </div>

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/30 text-purple-300"
                    >
                      <span className="text-sm">{specialty}</span>
                      <button
                        onClick={() => removeSpecialty(specialty)}
                        className="text-xs hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Calendly Integration" className="mb-4" />
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Add your Calendly link so athletes can easily schedule sessions with you
              </p>
              <input
                type="url"
                value={calendlyLink}
                onChange={(e) => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/your-username"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </GlassCard>

          <div className="flex gap-3">
            <GradientButton variant="secondary" fullWidth onClick={() => setStep(1)}>
              Back
            </GradientButton>
            <GradientButton variant="primary" fullWidth onClick={() => setStep(3)}>
              Continue
            </GradientButton>
          </div>
        </div>
      )}

      {/* Step 3: Credentials */}
      {step === 3 && (
        <div className="space-y-6">
          <GlassCard>
            <SectionHeader title="Upload Credentials" className="mb-4" />
            <p className="text-sm text-gray-400 mb-4">
              Upload your resume, certifications, or references to verify your credentials
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Document Type</label>
                <select
                  value={certificationType}
                  onChange={(e) => setCertificationType(e.target.value as 'resume' | 'certification' | 'reference' | 'other')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="certification">Certification</option>
                  <option value="resume">Resume</option>
                  <option value="reference">Reference</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <ImageUpload
                onImageSelect={handleCertificationSelect}
                onImageRemove={handleCertificationRemove}
                preview={certificationPreview}
              />

              {certificationFile && !uploading && (
                <GradientButton
                  variant="secondary"
                  fullWidth
                  onClick={handleCertificationUpload}
                >
                  Upload Document
                </GradientButton>
              )}

              {uploading && (
                <div className="text-center text-gray-400 py-2">
                  Uploading...
                </div>
              )}

              {uploadedCertifications.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Documents ({uploadedCertifications.length})</p>
                  <div className="space-y-2">
                    {uploadedCertifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 glass rounded-lg">
                        <span className="text-xs">📄</span>
                        <span className="text-xs text-gray-400 flex-1 truncate">{cert.name}</span>
                        <button
                          onClick={() => removeCertification(idx)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="flex gap-3">
            <GradientButton variant="secondary" fullWidth onClick={() => setStep(2)}>
              Back
            </GradientButton>
            <GradientButton
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={loading || uploadedCertifications.length === 0}
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  );
};
