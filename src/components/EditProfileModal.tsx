import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Camera, Upload, Trash2, Edit3 } from 'lucide-react';
import type { UserProfile } from '../types';
import { DEFAULT_AVATARS } from '../services/userService';
import { updateUserProfile } from '../services/apiService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onProfileUpdated: (updatedUser: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'Learner' | 'Mentor' | 'Both'>('Both');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile values when modal opens
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setUsername(userProfile.username || '');
      setRole(userProfile.role || 'Both');
      setBio(userProfile.bio || '');
      setSelectedAvatar(userProfile.avatarUrl || DEFAULT_AVATARS[0]);
      setUploadedPhotoBase64(null);
      setUploadedFileName('');
      setErrorMsg('');
    }
  }, [userProfile, isOpen]);

  if (!isOpen || !userProfile) return null;

  // Compress uploaded DP photo to 250x250 max dimensions (<30KB size)
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedBase64);
        } else {
          reject(new Error('Canvas context error'));
        }
      };
      img.onerror = (err) => reject(err);
    });
  };

  // Handle Photo File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size is too large (max 10MB allowed).');
      return;
    }

    setErrorMsg('');
    setUploadedFileName(file.name);

    try {
      const compressedBase64 = await compressImageFile(file);
      setUploadedPhotoBase64(compressedBase64);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setUploadedPhotoBase64(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedPhoto = () => {
    setUploadedPhotoBase64(null);
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Please enter a username.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const finalAvatar = uploadedPhotoBase64 || selectedAvatar;
    const cleanUsername = username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`;

    try {
      const updatedUser = await updateUserProfile(userProfile.id, {
        fullName: fullName.trim(),
        username: cleanUsername,
        role,
        bio: bio.trim(),
        avatarUrl: finalAvatar,
      });

      if (updatedUser) {
        onProfileUpdated(updatedUser);
        onClose();
      } else {
        setErrorMsg('Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDpDisplay = uploadedPhotoBase64 || selectedAvatar;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#05070f]/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#090e1a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-y-auto max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg">
              <Edit3 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-tech">
                Edit Profile & Change DP
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Update your display picture, username & bio in Firebase Cloud.
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* Live DP Avatar Preview & Change Photo Controls */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col items-center text-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img
                  src={currentDpDisplay}
                  alt="Profile DP"
                  className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400 shadow-xl shadow-cyan-500/20 group-hover:opacity-80 transition-all"
                />
                <div className="absolute inset-0 rounded-full bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-7 h-7 text-cyan-300" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-cyan-300 font-tech">
                  {uploadedPhotoBase64 ? `✨ New Custom DP Selected (${uploadedFileName || 'Image'})` : 'Click DP photo or choose below to change'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-tech flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New DP Photo</span>
                </button>

                {uploadedPhotoBase64 && (
                  <button
                    type="button"
                    onClick={removeUploadedPhoto}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold font-tech flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Avatar Preset Options */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                Or Select From Preset Avatars
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedAvatar(av);
                      setUploadedPhotoBase64(null);
                    }}
                    className={`relative rounded-full p-0.5 border-2 transition-all shrink-0 ${
                      selectedAvatar === av && !uploadedPhotoBase64
                        ? 'border-cyan-400 scale-110 shadow-lg shadow-cyan-500/30'
                        : 'border-slate-800 hover:border-slate-600 opacity-70'
                    }`}
                  >
                    <img
                      src={av}
                      alt="Preset Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedAvatar === av && !uploadedPhotoBase64 && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

            {/* Platform Account Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                Platform Role
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 font-tech">
                <button
                  type="button"
                  onClick={() => setRole('Learner')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'Learner'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Learner
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Mentor')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'Mentor'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mentor
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Both')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'Both'
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mentor & Learner
                </button>
              </div>
            </div>

            {/* Bio & Skill Focus */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                Bio & Skill Focus
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium font-tech">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-shimmer w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-tech shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes in Firebase...' : 'Save Profile & DP Changes'}
            </button>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
