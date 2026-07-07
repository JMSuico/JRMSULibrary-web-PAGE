import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings, User, Lock, Globe, Clock, Save,
  Eye, EyeOff, CheckCircle, AlertCircle, Camera, Loader2, RefreshCw,
} from 'lucide-react';
import { settingsApi, SiteSettings } from '@/src/Endpoints/settingsApi';
import { userApi } from '@/src/Endpoints/userApi';
import { useToast } from '@/src/Hooks/useToast';
import type { AdminOutletContext } from '@/src/Pages/Admin/AdminLayout';

// ── Tab types ──────────────────────────────────────────────────────────────────
type Tab = 'site' | 'profile' | 'security';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'site',     label: 'Site Settings',  icon: <Globe size={16} /> },
  { id: 'profile',  label: 'My Profile',     icon: <User size={16} /> },
  { id: 'security', label: 'Security',       icon: <Lock size={16} /> },
];

// ── Reusable field components ──────────────────────────────────────────────────
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  id, value, onChange, placeholder, disabled, type = 'text',
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]/30 focus:border-[#002B7F] transition-all disabled:bg-gray-50 disabled:text-gray-400"
    />
  );
}

function PasswordInput({
  id, value, onChange, placeholder, disabled,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]/30 focus:border-[#002B7F] transition-all disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

// ── Subpage: Site Settings ─────────────────────────────────────────────────────
function SiteSettingsTab() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<SiteSettings>>({});

  const load = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getSettings();
      setSettings(data);
      setForm(data);
    } catch {
      showToast('Failed to load site settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key: keyof SiteSettings) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.updateSettings(form);
      showToast('Site settings saved successfully', 'success');
      await load();
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-[#002B7F]" size={32} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Library Info */}
      <SectionCard title="Library Information" subtitle="Basic details displayed across the website">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup label="Library Name">
            <Input id="lib-name" value={form.library_name ?? ''} onChange={set('library_name')} placeholder="e.g. JRMSU Katipunan Library" />
          </FieldGroup>
          <FieldGroup label="Contact Email">
            <Input id="lib-email" value={form.contact_email ?? ''} onChange={set('contact_email')} placeholder="email@jrmsu.edu.ph" type="email" />
          </FieldGroup>
        </div>
        <FieldGroup label="Address">
          <Input id="lib-address" value={form.address ?? ''} onChange={set('address')} placeholder="Katipunan, Zamboanga del Norte" />
        </FieldGroup>
        <FieldGroup label="Phone Number">
          <Input id="lib-phone" value={form.phone_number ?? ''} onChange={set('phone_number')} placeholder="+63..." />
        </FieldGroup>
      </SectionCard>

      {/* Opening Hours */}
      <SectionCard title="Opening Hours" subtitle="Displayed on the homepage status clock">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FieldGroup label="Mon – Fri">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400 shrink-0" />
              <Input id="hours-mf" value={form.opening_hours_mon_fri ?? ''} onChange={set('opening_hours_mon_fri')} placeholder="7:00 AM – 7:00 PM" />
            </div>
          </FieldGroup>
          <FieldGroup label="Saturday">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400 shrink-0" />
              <Input id="hours-sat" value={form.opening_hours_sat ?? ''} onChange={set('opening_hours_sat')} placeholder="Closed" />
            </div>
          </FieldGroup>
          <FieldGroup label="Sunday">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400 shrink-0" />
              <Input id="hours-sun" value={form.opening_hours_sun ?? ''} onChange={set('opening_hours_sun')} placeholder="Closed" />
            </div>
          </FieldGroup>
        </div>
      </SectionCard>

      {/* Display Options */}
      <SectionCard title="Display Options" subtitle="Controls the visual presentation of the library website">
        <FieldGroup label="Carousel Style">
          <select
            id="carousel-style"
            value={form.carousel_style ?? 'default'}
            onChange={(e) => setForm((prev) => ({ ...prev, carousel_style: e.target.value as 'default' | 'classic' }))}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]/30 focus:border-[#002B7F] transition-all cursor-pointer"
          >
            <option value="default">Default (Modern Cards)</option>
            <option value="classic">Classic (Slideshow)</option>
          </select>
        </FieldGroup>
        {settings?.updated_at && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
            <CheckCircle size={12} className="text-green-400" />
            Last saved: {new Date(settings.updated_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
      </SectionCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#002B7F] text-white text-sm font-semibold rounded-xl hover:bg-[#001655] transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ── Subpage: My Profile ────────────────────────────────────────────────────────
function ProfileTab() {
  const { user, setUser } = useOutletContext<AdminOutletContext>();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await userApi.updateProfile(form);
      setUser(updated);
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const updated = await userApi.uploadAvatar(user.id, fd);
      setUser(updated);
      showToast('Avatar updated', 'success');
    } catch {
      showToast('Failed to upload avatar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <SectionCard title="Profile Photo" subtitle="This avatar appears in the admin topbar">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full border-4 border-[#002B7F]/20 overflow-hidden bg-[#002B7F]/10 flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-[#002B7F]/50" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Change avatar"
            >
              <Camera size={18} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-400">@{user?.username}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-xs font-medium text-[#002B7F] hover:underline cursor-pointer"
            >
              Change photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
      </SectionCard>

      {/* Personal Info */}
      <SectionCard title="Personal Information" subtitle="Update your name, username and email">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup label="First Name">
            <Input id="first-name" value={form.first_name} onChange={set('first_name')} placeholder="First name" />
          </FieldGroup>
          <FieldGroup label="Last Name">
            <Input id="last-name" value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
          </FieldGroup>
          <FieldGroup label="Username">
            <Input id="username" value={form.username} onChange={set('username')} placeholder="username" />
          </FieldGroup>
          <FieldGroup label="Email Address">
            <Input id="email" value={form.email} onChange={set('email')} placeholder="email@example.com" type="email" />
          </FieldGroup>
        </div>
        <p className="text-xs text-gray-400 flex gap-1.5 items-center pt-1">
          <AlertCircle size={12} className="text-amber-400 shrink-0" />
          Member since: {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-PH', { dateStyle: 'medium' }) : '—'}
        </p>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#002B7F] text-white text-sm font-semibold rounded-xl hover:bg-[#001655] transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ── Subpage: Security ──────────────────────────────────────────────────────────
function SecurityTab() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): string | null => {
    if (!form.old_password) return 'Current password is required.';
    if (form.new_password.length < 8) return 'New password must be at least 8 characters.';
    if (form.new_password !== form.confirm_password) return 'New passwords do not match.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { showToast(err, 'error'); return; }
    try {
      setSaving(true);
      await userApi.changePassword({ old_password: form.old_password, new_password: form.new_password });
      showToast('Password changed successfully. Please log in again.', 'success');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (e: any) {
      showToast(e.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const passwordStrength = (pw: string) => {
    if (!pw) return { label: '', color: 'bg-gray-200', width: '0%' };
    const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-400', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-400', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = passwordStrength(form.new_password);

  return (
    <div className="space-y-6">
      <SectionCard title="Change Password" subtitle="Use a strong, unique password that you don't use elsewhere">
        <FieldGroup label="Current Password">
          <PasswordInput id="old-pw" value={form.old_password} onChange={set('old_password')} placeholder="Enter current password" />
        </FieldGroup>
        <FieldGroup label="New Password">
          <PasswordInput id="new-pw" value={form.new_password} onChange={set('new_password')} placeholder="At least 8 characters" />
          {form.new_password && (
            <div className="mt-2 space-y-1">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
              </div>
              <p className="text-xs text-gray-500">Strength: <span className="font-semibold">{strength.label}</span></p>
            </div>
          )}
        </FieldGroup>
        <FieldGroup label="Confirm New Password">
          <PasswordInput id="confirm-pw" value={form.confirm_password} onChange={set('confirm_password')} placeholder="Repeat new password" />
          {form.confirm_password && form.new_password !== form.confirm_password && (
            <p className="text-xs text-red-500 mt-1 flex gap-1 items-center"><AlertCircle size={11} /> Passwords do not match</p>
          )}
          {form.confirm_password && form.new_password === form.confirm_password && form.new_password.length > 0 && (
            <p className="text-xs text-green-600 mt-1 flex gap-1 items-center"><CheckCircle size={11} /> Passwords match</p>
          )}
        </FieldGroup>
        <ul className="text-xs text-gray-400 space-y-0.5 pt-1 list-inside list-disc">
          <li>At least 8 characters long</li>
          <li>Mix uppercase letters, numbers and symbols for best security</li>
          <li>Do not reuse old passwords</li>
        </ul>
      </SectionCard>

      <SectionCard title="Session Security" subtitle="Current session details">
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Session Active</p>
            <p className="text-xs text-green-600 mt-0.5">Your session is secured with an HttpOnly cookie. Auto-logout triggers after 5 minutes of inactivity.</p>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#002B7F] text-white text-sm font-semibold rounded-xl hover:bg-[#001655] transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('site');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#002B7F]/10 flex items-center justify-center">
          <Settings size={20} className="text-[#002B7F]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <p className="text-xs text-gray-500">Manage site configuration, your profile, and security preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-[#002B7F] text-[#002B7F] bg-[#002B7F]/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'site'     && <SiteSettingsTab />}
        {activeTab === 'profile'  && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}
