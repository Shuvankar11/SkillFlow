import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check, LogIn, Camera, Upload, Trash2, Key, Mail, User, Eye, EyeOff } from 'lucide-react';
import type { UserProfile } from '../types';
import { DEFAULT_AVATARS } from '../services/userService';
import { registerUserAccount, loginUserAccount } from '../services/apiService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (profile: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
  initialMode = 'login',
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login Form States
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState<'Learner' | 'Mentor' | 'Both'>('Both');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress uploaded photo to 250x250 max dimensions to guarantee fast Firebase writes (<30KB size)
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

  // Handle Photo File Upload (Convert & Compress to Base64)
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
      setCustomAvatarUrl('');
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setUploadedPhotoBase64(base64);
          setCustomAvatarUrl('');
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

  // Submit Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setErrorMsg('Please enter your email or username.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await loginUserAccount(loginInput.trim(), loginPassword);
      if (res.success && res.user) {
        onProfileCreated(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to log in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Signup Handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name (e.g. Shuvankar Roy).');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Please choose a username.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Please choose a password with at least 6 characters.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const finalAvatar = uploadedPhotoBase64 || customAvatarUrl.trim() || selectedAvatar;

    try {
      const res = await registerUserAccount({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: signupPassword,
        role,
        bio: bio.trim(),
        avatarUrl: finalAvatar,
      });

      if (res.success && res.user) {
        onProfileCreated(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Account registration error.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="relative w-full max-w-xl bg-[#090e1a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-y-auto max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mode Tabs (Log In vs Create Account) */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mb-6 font-tech">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Account</span>
            </button>
          </div>

          {/* Header Description */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white font-tech">
              {authMode === 'login' ? 'Welcome Back to SkillFlow' : 'Create Your SkillFlow Identity'}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {authMode === 'login'
                ? 'Log in with your email/username & password to manage your mentorship & linked Stellar wallets.'
                : 'Register an account with your email & custom photo. You can link any Stellar wallet to your account later!'}
            </p>
          </div>

          {/* FORM: LOG IN MODE */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Email Address or Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="name@example.com or @username"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium font-tech">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-shimmer w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-sm uppercase tracking-wider font-tech shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Verifying Password...' : 'Log In to Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-xs text-cyan-300 hover:text-cyan-200 font-tech font-bold"
                >
                  Don't have an account? Create one now →
                </button>
              </div>
            </form>
          )}

          {/* FORM: CREATE ACCOUNT / SIGNUP MODE */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shuvankar Roy"
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
                    placeholder="e.g. @shuvankar_dev"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 rounded-xl glass-input text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-3 rounded-xl glass-input text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Platform Account Role
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

              {/* Profile Photo Selector (Custom Upload + Presets) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Profile Photo (Custom Upload or Preset)
                </label>

                {/* Upload Box */}
                <div className="mb-2.5 p-3 rounded-2xl bg-slate-950 border border-cyan-500/30">
                  {uploadedPhotoBase64 ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={uploadedPhotoBase64}
                            alt="Custom Upload Preview"
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 p-1 bg-cyan-400 rounded-full text-slate-950">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-cyan-300 font-tech">
                            ✨ Custom Photo Selected
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {uploadedFileName || 'Custom image file'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeUploadedPhoto}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white font-tech">
                            Upload Custom Photo
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Pick any image photo from your computer
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-tech transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choose File
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Avatar Presets */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setSelectedAvatar(av);
                        setCustomAvatarUrl('');
                        setUploadedPhotoBase64(null);
                      }}
                      className={`relative rounded-full p-0.5 border-2 transition-all shrink-0 ${
                        selectedAvatar === av && !customAvatarUrl && !uploadedPhotoBase64
                          ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/30'
                          : 'border-slate-800 hover:border-slate-600 opacity-70'
                      }`}
                    >
                      <img
                        src={av}
                        alt="Avatar preset"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      {selectedAvatar === av && !customAvatarUrl && !uploadedPhotoBase64 && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Bio & Skill Focus
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell others what skills you specialize in or want to master..."
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
                className="btn-shimmer w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-tech shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Registering Account...' : 'Complete Account Registration'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                  }}
                  className="text-xs text-cyan-300 hover:text-cyan-200 font-tech font-bold"
                >
                  Already registered? Log In to your account →
                </button>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
