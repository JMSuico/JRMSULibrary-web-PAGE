// [Layer: Features/Admin/components] — ProfileEditModal.tsx
// Floating modal card for editing admin profile credentials

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Save, Loader2, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { userApi, User } from '@/src/Endpoints/userApi';

interface ProfileEditModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export function ProfileEditModal({ isOpen, user, onClose, onSave }: ProfileEditModalProps) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync fields if user prop changes
  useEffect(() => {
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setUsername(user.username);
    setAvatarPreview(user.avatar_url || null);
  }, [user]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      // 1. Update profile fields
      const profilePayload: Record<string, string> = {};
      if (firstName !== user.first_name) profilePayload.first_name = firstName;
      if (lastName !== user.last_name) profilePayload.last_name = lastName;
      if (email !== user.email) profilePayload.email = email;
      if (username !== user.username) profilePayload.username = username;

      let updatedUser = user;
      if (Object.keys(profilePayload).length > 0) {
        updatedUser = await userApi.updateProfile(profilePayload);
      }

      // 2. Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        updatedUser = await userApi.uploadAvatar(user.id, formData);
        setAvatarFile(null);
      }

      setSuccessMsg('Profile updated successfully');
      onSave(updatedUser);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setError(err.message || err.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return createPortal(
    <div
      className="fixed inset-0 ] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-modal-overlay z-[9999]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4 overflow-hidden animate-modal-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-navy to-navy-dark">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <UserIcon size={20} className="text-gold" /> Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-navy text-white flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden border-4 border-white ring-2 ring-gray-100">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  firstName?.[0]?.toUpperCase() || 'A'
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:bg-navy-dark transition-colors"
                aria-label="Upload avatar"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Click camera to upload a new photo</p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Email & Username */}
          <div className="space-y-3 mb-6">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 font-medium">
              {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-navy rounded-lg hover:bg-navy-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}


