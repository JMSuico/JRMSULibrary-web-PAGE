import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Search,
  Plus,
  ShieldAlert,
  Trash2,
  Pencil,
  CheckCircle,
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { userApi, User } from '@/src/Endpoints/userApi';
import { useToast } from '@/src/Hooks/useToast';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { Pagination } from '@/src/Components/Shared/Pagination';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [data, me] = await Promise.all([
        userApi.getAllUsers(),
        userApi.me()
      ]);
      setUsers(data);
      setCurrentUser(me);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useAutoRefresh(fetchUsers, 30000);

  const handleDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Admin User',
      message: 'Are you sure you want to remove this admin user? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await userApi.deleteUser(id);
          showToast('User deleted successfully', 'success');
          fetchUsers();
        } catch (err: any) {
          showToast(err.message || 'Failed to delete user', 'error');
        }
      }
    });
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const form = e.currentTarget;
    const data: Partial<User> & { password?: string } = {
      first_name: (form.querySelector('[name=first_name]') as HTMLInputElement).value,
      last_name: (form.querySelector('[name=last_name]') as HTMLInputElement).value,
      email: (form.querySelector('[name=email]') as HTMLInputElement).value,
      username: (form.querySelector('[name=username]') as HTMLInputElement).value,
      is_active: (form.querySelector('[name=is_active_checkbox]') as HTMLInputElement).checked,
    };

    const pwd = (form.querySelector('[name=password]') as HTMLInputElement).value;
    if (pwd) data.password = pwd;

    try {
      let savedUser;
      if (editingUser) {
        savedUser = await userApi.updateUser(editingUser.id, data);
      } else {
        savedUser = await userApi.createUser(data);
      }

      const avatarFile = (form.querySelector('[name=avatar]') as HTMLInputElement).files?.[0];
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await userApi.uploadAvatar(savedUser.id, formData);
      }

      showToast(`User ${editingUser ? 'updated' : 'created'} successfully`, 'success');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'An error occurred while saving user', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSearch = useDebounce(searchQuery, 400);

  const filtered = users.filter((u) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return u.first_name.toLowerCase().includes(q) || 
           u.last_name.toLowerCase().includes(q) || 
           u.email.toLowerCase().includes(q) || 
           u.username.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <>
      <div className="admin-content__header">
        <h1>User Management</h1>
        <p>Manage administrative accounts for the library portal.</p>
      </div>

      <div className="admin-metrics">
        <MetricCard
          label="Total Admins"
          value={users.length}
          icon={<Users size={22} />}
          variant="blue"
        />
        <MetricCard
          label="Active Accounts"
          value={users.filter(u => u.is_active).length}
          icon={<CheckCircle size={22} />}
          variant="green"
        />
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__search">
            <Search size={16} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-table-toolbar__actions">
            <button
              className="admin-btn admin-btn--primary cursor-pointer"
              onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            >
              <Plus size={16} />
              Add Admin
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-gray-900)' }}>
                      {user.first_name} {user.last_name}
                    </td>
                    <td>@{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <ShieldAlert size={14} className="text-blue-600" />
                        <span className="text-blue-700 font-medium text-xs">Admin</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${user.is_active ? 'admin-badge--success' : 'admin-badge--danger'}`}>
                        {user.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button 
                          className="admin-btn admin-btn--icon" 
                          aria-label={user.is_active ? "Suspend User" : "Activate User"}
                          title={user.id === currentUser?.id ? "Cannot suspend own account" : (user.is_active ? "Suspend User" : "Activate User")}
                          disabled={user.id === currentUser?.id}
                          style={{ opacity: user.id === currentUser?.id ? 0.3 : 1, cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer' }}
                          onClick={() => {
                            if (user.id === currentUser?.id) return;
                            setConfirmModal({
                              isOpen: true,
                              title: user.is_active ? 'Suspend User' : 'Activate User',
                              message: `Are you sure you want to ${user.is_active ? 'suspend' : 'activate'} this user?`,
                              onConfirm: async () => {
                                try {
                                  await userApi.updateUser(user.id, { is_active: !user.is_active });
                                  showToast(`User ${user.is_active ? 'suspended' : 'activated'} successfully`, 'success');
                                  fetchUsers();
                                } catch (e: any) {
                                  showToast(e.message || 'Error updating user status', 'error');
                                }
                              }
                            });
                          }}
                        >
                          <ShieldAlert size={15} className={user.is_active ? 'text-orange-500' : 'text-green-500'} />
                        </button>
                        <button 
                          className="admin-btn admin-btn--icon" 
                          aria-label="Edit"
                          title="Edit User"
                          onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          className="admin-btn admin-btn--icon" 
                          aria-label="Delete" 
                          title="Delete User"
                          style={{ color: 'var(--color-red-600)' }}
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filtered.length > itemsPerPage && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 ] flex items-center justify-center p-4 backdrop-blur-sm animate-modal-overlay z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-modal-card">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900">
                {editingUser ? 'Edit Admin User' : 'Create New Admin'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="user-form" onSubmit={handleSaveUser} className="space-y-4">
                
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden hover:border-navy transition-colors">
                    {editingUser?.avatar_url ? (
                      <img src={editingUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={24} className="text-gray-400" />
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-[10px] text-white font-bold text-center px-1">Upload<br/>Picture</span>
                      <input type="file" name="avatar" accept="image/*" className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            const img = e.currentTarget.parentElement?.previousElementSibling;
                            if (img && img.tagName === 'IMG') (img as HTMLImageElement).src = url;
                            else if (img) {
                              const newImg = document.createElement('img');
                              newImg.src = url;
                              newImg.className = "w-full h-full object-cover";
                              img.replaceWith(newImg);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Profile Picture (Optional)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                    <input required defaultValue={editingUser?.first_name} name="first_name" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                    <input required defaultValue={editingUser?.last_name} name="last_name" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input required defaultValue={editingUser?.email} name="email" type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                  <input required defaultValue={editingUser?.username} name="username" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password {editingUser && '(Leave blank to keep current)'}
                  </label>
                  <input 
                    required={!editingUser} 
                    name="password" 
                    type="password" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy" 
                    placeholder={editingUser ? '••••••••' : ''}
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="is_active_checkbox" 
                      defaultChecked={editingUser ? editingUser.is_active : true}
                      className="w-4 h-4 text-navy rounded focus:ring-navy"
                    />
                    <span className="text-sm font-medium text-gray-700">Account is Active</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 mt-auto">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="user-form"
                className="px-4 py-2 text-sm font-medium text-white bg-navy hover:bg-navy-dark rounded-lg shadow-sm transition"
              >
                {editingUser ? 'Update Admin' : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmModal 
        isOpen={!!confirmModal} 
        title={confirmModal?.title || ''} 
        message={confirmModal?.message || ''} 
        onConfirm={() => confirmModal?.onConfirm()} 
        onCancel={() => setConfirmModal(null)} 
      />
    </>
  );
}


