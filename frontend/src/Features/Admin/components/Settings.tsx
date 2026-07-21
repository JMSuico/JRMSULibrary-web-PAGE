import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Lock, Library, Save, CheckCircle, Layers, Archive, RotateCcw, RefreshCw, UserCircle, Camera, Eye, EyeOff } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from '@/src/Pages/Admin/AdminLayout';
import { settingsApi, SiteSettings } from '@/src/Endpoints/settingsApi';
import { userApi } from '@/src/Endpoints/userApi';
import { batchApi, AcquisitionBatch } from '@/src/Endpoints/batchApi';
import { reportApi, HistoricalReport } from '@/src/Endpoints/reportApi';
import { useToast } from '@/src/Hooks/useToast';

export function Settings() {
  const { user, setUser } = useOutletContext<AdminOutletContext>();
  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'carousel' | 'security' | 'archives'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [archivedBatches, setArchivedBatches] = useState<AcquisitionBatch[]>([]);
  const [archivedReports, setArchivedReports] = useState<HistoricalReport[]>([]);
  const [archivesLoading, setArchivesLoading] = useState(false);
  const [archiveType, setArchiveType] = useState<'batches'|'reports'>('batches');
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Sync state if context changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setUsername(user.username);
      if (!avatarFile) setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (firstName !== user.first_name) payload.first_name = firstName;
      if (lastName !== user.last_name) payload.last_name = lastName;
      if (email !== user.email) payload.email = email;
      if (username !== user.username) payload.username = username;

      let updatedUser = user;
      if (Object.keys(payload).length > 0) {
        updatedUser = await userApi.updateProfile(payload);
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        updatedUser = await userApi.uploadAvatar(user.id, formData);
        setAvatarFile(null);
      }

      setUser(updatedUser);
      setSavedStatus(true);
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
      setTimeout(() => setSavedStatus(false), 3000);
    } catch (err: any) {
      showToast(err.message || err.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const [formData, setFormData] = useState<SiteSettings>({
    library_name: '',
    address: '',
    contact_email: '',
    alternate_email: '',
    phone_number: '',
    opening_hours_mon_fri: '',
    opening_hours_sat: '',
    opening_hours_sun: '',
    carousel_style: 'default',
    background_image: ''
  } as any); // using as any since background_image might not be in the initial type yet

  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getSettings();
        setFormData(data as any);
        if ((data as any).background_image) {
          setBgImagePreview((data as any).background_image);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab !== 'archives') return;
    setArchivesLoading(true);
    
    Promise.all([
      batchApi.getAllBatches().then(data => setArchivedBatches(data.filter(b => b.status === 'archived'))).catch(() => showToast('Failed to load archived batches', 'error')),
      reportApi.getArchivedReports().then(data => setArchivedReports(data.results)).catch(() => showToast('Failed to load archived reports', 'error'))
    ]).finally(() => setArchivesLoading(false));
  }, [activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgImageFile(file);
    setBgImagePreview(URL.createObjectURL(file));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedStatus(false);
    
    if (activeTab === 'general' || activeTab === 'carousel') {
      try {
        let payload: any = formData;
        
        // If there's a background image file, we must use FormData
        if (bgImageFile) {
          const formDataObj = new FormData();
          Object.keys(formData).forEach(key => {
            if (key !== 'background_image' && (formData as any)[key] !== undefined && (formData as any)[key] !== null) {
              formDataObj.append(key, (formData as any)[key]);
            }
          });
          formDataObj.append('background_image', bgImageFile);
          payload = formDataObj;
        } else {
          payload = { ...formData };
          if (typeof payload.background_image === 'string') {
            delete payload.background_image;
          }
        }

        const updated = await settingsApi.updateSettings(payload);
        setFormData(updated as any);
        setBgImageFile(null);
        if ((updated as any).background_image) {
          setBgImagePreview((updated as any).background_image);
        }
        
        // Instantly update the cache so the landing page reflects it immediately
        if (updated.carousel_style) {
          localStorage.setItem('jrmsu_carousel_style_cache', updated.carousel_style);
        }

        setSavedStatus(true);
        setIsEditing(false);
        showToast('Settings saved successfully', 'success');
        setTimeout(() => setSavedStatus(false), 3000);
      } catch (err: any) {
        showToast(err.message || 'Failed to save settings', 'error');
      }
    } else if (activeTab === 'security') {
      if (passwords.newPass !== passwords.confirm) {
        showToast("New passwords don't match", 'error');
        setSaving(false);
        return;
      }
      try {
        await userApi.changePassword({
          old_password: passwords.current,
          new_password: passwords.newPass
        });
        setPasswords({ current: '', newPass: '', confirm: '' });
        setSavedStatus(true);
        setIsEditing(false);
        showToast('Password updated successfully', 'success');
        setTimeout(() => setSavedStatus(false), 3000);
      } catch (err: any) {
        showToast(err.message || 'Failed to update password', 'error');
      }
    }
    
    setSaving(false);
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 mt-1 focus:ring-2 focus:ring-navy focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <>
      <div className="admin-content__header flex justify-between items-end mb-6">
        <div>
          <h1 className="flex items-center gap-2"><SettingsIcon size={28} /> System Settings</h1>
          <p>Manage library configuration and security.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => { setActiveTab('profile'); setIsEditing(false); }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-blue-50 text-navy font-semibold border-l-4 border-navy' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <UserCircle size={18} />
              My Profile
            </button>
            <button
              onClick={() => { setActiveTab('general'); setIsEditing(false); }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer border-t border-gray-100 ${
                activeTab === 'general' ? 'bg-blue-50 text-navy font-semibold border-l-4 border-navy' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <Library size={18} />
              General Config
            </button>
            <button
              onClick={() => { setActiveTab('carousel'); setIsEditing(false); }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer border-t border-gray-100 ${
                activeTab === 'carousel' ? 'bg-blue-50 text-navy font-semibold border-l-4 border-navy' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <Layers size={18} />
              Carousel Customize
            </button>
            <button
              onClick={() => { setActiveTab('security'); setIsEditing(false); }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer border-t border-gray-100 ${
                activeTab === 'security' ? 'bg-blue-50 text-navy font-semibold border-l-4 border-navy' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <Lock size={18} />
              Security
            </button>
            <button
              onClick={() => { setActiveTab('archives'); setIsEditing(false); }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer border-t border-gray-100 ${
                activeTab === 'archives' ? 'bg-blue-50 text-navy font-semibold border-l-4 border-navy' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <Archive size={18} />
              Archive Batches
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'archives' ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in">
              <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col xl:flex-row justify-between xl:items-center gap-4 items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2"><Archive size={22} className="text-gray-500" /> Archives</h2>
                  <p className="text-sm text-gray-500">Manage archived batches and reports. Use Reopen to return items to active status.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setArchiveType('batches')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${archiveType === 'batches' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Batches
                  </button>
                  <button 
                    onClick={() => setArchiveType('reports')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${archiveType === 'reports' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Reports
                  </button>
                </div>
              </div>
              {archivesLoading ? (
                <div className="p-10 text-center text-gray-400 flex items-center justify-center gap-2"><RefreshCw size={20} className="animate-spin" /> Loading archives...</div>
              ) : archiveType === 'batches' ? (
                archivedBatches.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <Archive size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No archived batches found.</p>
                    <p className="text-sm mt-1">Batches you archive will appear here.</p>
                  </div>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Batch Name</th>
                          <th>Description</th>
                          <th>Books</th>
                          <th>Opened</th>
                          <th>Closed</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedBatches.map(batch => (
                          <tr key={batch.id}>
                            <td style={{ fontWeight: 500 }}>{batch.name}</td>
                            <td style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>{batch.description || <span className="text-gray-300 italic">No description</span>}</td>
                            <td>{batch.book_count || 0}</td>
                            <td style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>{new Date(batch.opened_at).toLocaleDateString()}</td>
                            <td style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>{batch.closed_at ? new Date(batch.closed_at).toLocaleDateString() : 'ΓÇö'}</td>
                            <td>
                              <div className="flex justify-end">
                                <button
                                  className="admin-btn admin-btn--secondary"
                                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  onClick={async () => {
                                    try {
                                      await batchApi.reopenBatch(batch.id);
                                      setArchivedBatches(prev => prev.filter(b => b.id !== batch.id));
                                      showToast('Batch reopened successfully', 'success');
                                    } catch (err: any) {
                                      showToast(err.message || 'Failed to reopen batch', 'error');
                                    }
                                  }}
                                >
                                  <RotateCcw size={14} /> Reopen
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                archivedReports.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <Archive size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No archived reports found.</p>
                    <p className="text-sm mt-1">Reports you archive will appear here.</p>
                  </div>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Date Range</th>
                          <th>Generated By</th>
                          <th>Generated At</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedReports.map(report => (
                          <tr key={report.id}>
                            <td className="font-medium text-gray-900">{report.title}</td>
                            <td><span className="bg-blue-50 text-navy px-2 py-1 rounded-md text-xs font-semibold uppercase">{report.report_type}</span></td>
                            <td>{report.date_range.replace('-', ' ').toUpperCase()}</td>
                            <td>{report.generated_by}</td>
                            <td>{new Date(report.generated_at).toLocaleString()}</td>
                            <td>
                              <div className="flex justify-end">
                                <button
                                  className="admin-btn admin-btn--secondary"
                                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  onClick={async () => {
                                    try {
                                      await reportApi.unarchiveReport(report.id);
                                      setArchivedReports(prev => prev.filter(r => r.id !== report.id));
                                      showToast('Report unarchived successfully', 'success');
                                    } catch (err: any) {
                                      showToast(err.message || 'Failed to unarchive report', 'error');
                                    }
                                  }}
                                >
                                  <RotateCcw size={14} /> Reopen
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">Loading settings...</div>
          ) : activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in">
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">My Profile</h2>
                  <p className="text-sm text-gray-500">Update your account credentials and avatar.</p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center text-2xl font-bold shadow-md overflow-hidden border-2 border-white ring-2 ring-gray-100">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      firstName?.[0]?.toUpperCase() || 'A'
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => isEditing && fileInputRef.current?.click()}
                    className={`absolute bottom-0 right-[-5px] w-6 h-6 text-white rounded-full flex items-center justify-center shadow border-2 border-white transition-colors ${isEditing ? 'bg-navy cursor-pointer hover:bg-navy-dark' : 'bg-gray-400 cursor-not-allowed opacity-50'}`}
                  >
                    <Camera size={12} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} disabled={!isEditing} required />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} disabled={!isEditing} required />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} disabled={!isEditing} required />
                  </div>
                  <div>
                    <label className={labelClass}>Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} disabled={!isEditing} required />
                  </div>
                </div>

                {/* Password change removed - now in Security tab */}
              </div>
              <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="admin-btn flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700 text-white border-none transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="admin-btn admin-btn--secondary flex items-center gap-2 px-6"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="admin-btn admin-btn--primary flex items-center gap-2 px-6"
                    >
                      {saving ? <RefreshCw className="animate-spin" size={18} /> : savedStatus ? <CheckCircle size={18} /> : <Save size={18} />}
                      {saving ? 'Saving...' : savedStatus ? 'Saved!' : 'Save Profile Changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {activeTab === 'general' ? 'Library Configuration' : activeTab === 'carousel' ? 'Carousel Customize' : 'Security Settings'}
                </h2>
                
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Library Name</label>
                        <input type="text" name="library_name" value={formData.library_name} onChange={handleChange} className={inputClass} required disabled={!isEditing} />
                      </div>
                      <div>
                        <label className={labelClass}>Contact Email</label>
                        <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className={inputClass} required disabled={!isEditing} />
                      </div>
                      <div>
                        <label className={labelClass}>Alternate Email</label>
                        <input type="email" name="alternate_email" value={formData.alternate_email || ''} onChange={handleChange} className={inputClass} disabled={!isEditing} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} required disabled={!isEditing} />
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className={inputClass} disabled={!isEditing} />
                      </div>
                    </div>
                    
                    <hr className="border-gray-100 my-6" />
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Opening Hours</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className={labelClass}>Monday - Friday</label>
                        <input type="text" name="opening_hours_mon_fri" value={formData.opening_hours_mon_fri} onChange={handleChange} className={inputClass} placeholder="e.g. 7:00 AM - 7:00 PM" required disabled={!isEditing} />
                      </div>
                      <div>
                        <label className={labelClass}>Saturday</label>
                        <select name="opening_hours_sat" value={formData.opening_hours_sat} onChange={handleChange as any} className={inputClass} required disabled={!isEditing}>
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Sunday</label>
                        <select name="opening_hours_sun" value={formData.opening_hours_sun} onChange={handleChange as any} className={inputClass} required disabled={!isEditing}>
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <hr className="border-gray-100 my-6" />
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Camera size={18} className="text-navy" /> Website Background
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="w-48 h-28 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {bgImagePreview ? (
                          <img
                            src={
                              !bgImagePreview ? '' :
                              (bgImagePreview.startsWith('http') || bgImagePreview.startsWith('blob:') || bgImagePreview.startsWith('data:') || bgImagePreview.startsWith('/media/'))
                                ? bgImagePreview
                                : `/media/${bgImagePreview}`
                            }
                            alt="Background Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-400 font-medium">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Upload New Background</label>
                        <input type="file" accept="image/*" onChange={handleBgImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-navy hover:file:bg-blue-100 transition-colors" disabled={!isEditing} />
                        <p className="text-xs text-gray-500 mt-2">Recommended resolution: 1920x1080. Max size: 5MB.</p>
                      </div>
                    </div>

                    <hr className="border-gray-100 my-6" />
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Lock size={18} className="text-emerald-600" /> Security Note
                    </h3>
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
                      <p><strong>Local AI Processing (Ollama):</strong> The system's AI assistant is powered by Ollama running completely locally on your secure server. No data is sent to external networks, ensuring 100% privacy and compliance with data security policies.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'carousel' && (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-500 mb-2">Choose the carousel display style for the <strong>Newly Acquired Books</strong> and <strong>Physical Setup</strong> sections of the public website.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Default 3D Option */}
                      <button
                        type="button"
                        onClick={() => isEditing && setFormData(p => ({ ...p, carousel_style: 'default' }))}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          formData.carousel_style === 'default'
                            ? 'border-navy bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-400'
                        } ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.carousel_style === 'default' ? 'border-navy' : 'border-gray-400'
                          }`}>
                            {formData.carousel_style === 'default' && <div className="w-2.5 h-2.5 rounded-full bg-navy" />}
                          </div>
                          <span className={`font-bold ${ formData.carousel_style === 'default' ? 'text-navy' : 'text-gray-700'}`}>Default (3D)</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 py-3 bg-white rounded-lg border border-gray-200">
                          <div className="w-8 h-10 bg-gray-200 rounded opacity-60 -rotate-6"></div>
                          <div className="w-12 h-14 bg-navy rounded shadow-lg z-10"></div>
                          <div className="w-8 h-10 bg-gray-200 rounded opacity-60 rotate-6"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Fan-out 3D perspective view with auto-advance.</p>
                      </button>

                      {/* Classic Option */}
                      <button
                        type="button"
                        onClick={() => isEditing && setFormData(p => ({ ...p, carousel_style: 'classic' }))}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          formData.carousel_style === 'classic'
                            ? 'border-navy bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-400'
                        } ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.carousel_style === 'classic' ? 'border-navy' : 'border-gray-400'
                          }`}>
                            {formData.carousel_style === 'classic' && <div className="w-2.5 h-2.5 rounded-full bg-navy" />}
                          </div>
                          <span className={`font-bold ${ formData.carousel_style === 'classic' ? 'text-navy' : 'text-gray-700'}`}>Classic (Horizontal)</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 py-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-400 text-lg">&#8592;</span>
                          <div className="w-8 h-12 bg-navy/30 rounded"></div>
                          <div className="w-8 h-12 bg-navy rounded shadow"></div>
                          <div className="w-8 h-12 bg-navy/30 rounded"></div>
                          <span className="text-gray-400 text-lg">&#8594;</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Flat scrollable row. Click-and-drag or use arrow buttons.</p>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6 max-w-md">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
                      <p className="text-sm text-gray-500">Leave fields blank if you don't want to change your password.</p>
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Password Requirements:</p>
                        <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
                          <li>At least 10 characters</li>
                          <li>At least 1 uppercase letter (A-Z)</li>
                          <li>At least 1 lowercase letter (a-z)</li>
                          <li>At least 1 number (0-9)</li>
                          <li>At least 1 special character (!@#$%^&*)</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Current Password <span className="text-xs text-gray-400 font-normal ml-2">(Required to set new password)</span></label>
                      <div className="relative flex items-center">
                        <input type={showCurrentPassword ? "text" : "password"} name="current" value={passwords.current} onChange={handlePasswordChange} className={inputClass} placeholder="Current Password" disabled={!isEditing} />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" aria-label="Toggle visibility">
                          {showCurrentPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>New Password <span className="text-xs text-gray-400 font-normal ml-2">(New password)</span></label>
                      <div className="relative flex items-center">
                        <input type={showNewPassword ? "text" : "password"} name="newPass" value={passwords.newPass} onChange={handlePasswordChange} className={inputClass} placeholder="New Password" disabled={!isEditing} />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" aria-label="Toggle visibility">
                          {showNewPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password <span className="text-xs text-gray-400 font-normal ml-2">(Repeat new password)</span></label>
                      <div className="relative flex items-center">
                        <input type={showConfirmPassword ? "text" : "password"} name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className={inputClass} placeholder="Confirm New Password" disabled={!isEditing} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" aria-label="Toggle visibility">
                          {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="admin-btn flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700 text-white border-none transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="admin-btn admin-btn--secondary flex items-center gap-2 px-6"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="admin-btn admin-btn--primary flex items-center gap-2 px-6"
                    >
                      {saving ? <RefreshCw className="animate-spin" size={18} /> : savedStatus ? <CheckCircle size={18} /> : <Save size={18} />}
                      {saving ? 'Saving...' : savedStatus ? 'Saved!' : 'Save Settings'}
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}


