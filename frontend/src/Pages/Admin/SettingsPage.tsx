import React, { useState, useEffect } from 'react';
import { Settings, Lock, Library, Save, CheckCircle } from 'lucide-react';
import { settingsApi, SiteSettings } from '@/src/Endpoints/settingsApi';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  
  const [formData, setFormData] = useState<SiteSettings>({
    library_name: '',
    address: '',
    contact_email: '',
    phone_number: '',
    opening_hours_mon_fri: '',
    opening_hours_sat: '',
    opening_hours_sun: ''
  });

  // Mock security data
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getSettings();
        setFormData(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedStatus(false);
    
    if (activeTab === 'general') {
      try {
        const updated = await settingsApi.updateSettings(formData);
        setFormData(updated);
        setSavedStatus(true);
        setTimeout(() => setSavedStatus(false), 3000);
      } catch (err) {
        console.error('Failed to save settings', err);
        alert('Failed to save settings. Please try again.');
      }
    } else {
      // Mock security save
      if (passwords.newPass !== passwords.confirm) {
        alert("New passwords don't match");
        setSaving(false);
        return;
      }
      setTimeout(() => {
        setPasswords({ current: '', newPass: '', confirm: '' });
        setSavedStatus(true);
        setTimeout(() => setSavedStatus(false), 3000);
      }, 1000);
    }
    
    setSaving(false);
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 mt-1 focus:ring-2 focus:ring-[#002B7F] focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <>
      <div className="admin-content__header flex justify-between items-end mb-6">
        <div>
          <h1 className="flex items-center gap-2"><Settings size={28} /> System Settings</h1>
          <p>Manage library configuration and security.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer ${
                activeTab === 'general' ? 'bg-blue-50 text-[#002B7F] font-semibold border-l-4 border-[#002B7F]' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <Library size={18} />
              General Config
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer border-t border-gray-100 ${
                activeTab === 'security' ? 'bg-blue-50 text-[#002B7F] font-semibold border-l-4 border-[#002B7F]' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <Lock size={18} />
              Security
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">Loading settings...</div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {activeTab === 'general' ? 'Library Configuration' : 'Security Settings'}
                </h2>
                
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Library Name</label>
                        <input type="text" name="library_name" value={formData.library_name} onChange={handleChange} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Contact Email</label>
                        <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className={inputClass} required />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                    
                    <hr className="border-gray-100 my-6" />
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Opening Hours</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className={labelClass}>Monday - Friday</label>
                        <input type="text" name="opening_hours_mon_fri" value={formData.opening_hours_mon_fri} onChange={handleChange} className={inputClass} placeholder="e.g. 7:00 AM - 7:00 PM" required />
                      </div>
                      <div>
                        <label className={labelClass}>Saturday</label>
                        <input type="text" name="opening_hours_sat" value={formData.opening_hours_sat} onChange={handleChange} className={inputClass} placeholder="e.g. Closed" required />
                      </div>
                      <div>
                        <label className={labelClass}>Sunday</label>
                        <input type="text" name="opening_hours_sun" value={formData.opening_hours_sun} onChange={handleChange} className={inputClass} placeholder="e.g. Closed" required />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <input type="password" name="newPass" value={passwords.newPass} onChange={handlePasswordChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className={inputClass} required />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 md:px-8 bg-gray-50 flex items-center justify-between">
                <div>
                  {savedStatus && (
                    <span className="flex items-center gap-2 text-green-600 text-sm font-semibold animate-in">
                      <CheckCircle size={16} /> Saved successfully
                    </span>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="admin-btn admin-btn--primary flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
