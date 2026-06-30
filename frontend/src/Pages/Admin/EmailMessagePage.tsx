import { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  CheckCircle,
  Clock,
  Reply,
  Inbox,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { ConfirmModal } from '@/src/Features/Admin/components/ConfirmModal';
import { contactApi, ContactMessage } from '@/src/Endpoints/contactApi';
import { useToast } from '@/src/Hooks/useToast';

export default function EmailMessagePage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EMAIL' | 'RESERVATION'>('ALL');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const [replyModal, setReplyModal] = useState<{ message: ContactMessage; body: string } | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [bulkReplyModal, setBulkReplyModal] = useState<{ body: string } | null>(null);
  const [isSendingBulkReply, setIsSendingBulkReply] = useState(false);
  
  const { showToast } = useToast();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await contactApi.getAllMessages();
      setMessages(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: number, newStatus: ContactMessage['status']) => {
    try {
      await contactApi.updateMessageStatus(id, newStatus);
      showToast(`Message marked as ${newStatus}`, 'success');
      fetchMessages();
      if (selectedIds.has(id)) {
        const newSet = new Set(selectedIds);
        newSet.delete(id);
        setSelectedIds(newSet);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update message status', 'error');
    }
  };

  const deleteMessage = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Message',
      message: 'Are you sure you want to permanently delete this message? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await contactApi.deleteMessage(id);
          showToast('Message deleted', 'success');
          fetchMessages();
          if (selectedIds.has(id)) {
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
          }
        } catch (err: any) {
          showToast(err.message || 'Failed to delete message', 'error');
        }
      }
    });
  };

  const handleBulkAction = async (action: ContactMessage['status'] | 'DELETE') => {
    if (selectedIds.size === 0) return;
    
    if (action === 'DELETE') {
      setConfirmModal({
        isOpen: true,
        title: 'Bulk Delete',
        message: `Are you sure you want to permanently delete ${selectedIds.size} messages?`,
        onConfirm: async () => {
          try {
            setLoading(true);
            await Promise.all(Array.from<number>(selectedIds).map(id => contactApi.deleteMessage(id)));
            showToast(`Bulk action completed for ${selectedIds.size} messages`, 'success');
            setSelectedIds(new Set());
            fetchMessages();
          } catch (err: any) {
            showToast(err.message || 'Failed to perform bulk action', 'error');
            setLoading(false);
          }
        }
      });
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all(
        Array.from<number>(selectedIds).map(id => contactApi.updateMessageStatus(id, action))
      );
      showToast(`Bulk action completed for ${selectedIds.size} messages`, 'success');
      setSelectedIds(new Set());
      fetchMessages();
    } catch (err: any) {
      showToast(err.message || 'Failed to perform bulk action', 'error');
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(m => m.id)));
    }
  };

  const toggleExpandedGroup = (email: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(email)) newSet.delete(email);
    else newSet.add(email);
    setExpandedGroups(newSet);
  };

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'ALL' || m.message_type === filterType;
    const matchesArchive = showArchived ? m.status === 'ARCHIVED' : m.status !== 'ARCHIVED';
    
    return matchesSearch && matchesType && matchesArchive;
  });

  const unreadCount = messages.filter(m => m.status === 'UNREAD').length;
  const reservationCount = messages.filter(m => m.message_type === 'RESERVATION').length;

  const groupedMessages = filtered.reduce((acc, msg) => {
    const key = msg.email;
    if (!acc[key]) acc[key] = { name: msg.name, email: msg.email, messages: [], unreadCount: 0, totalCount: 0 };
    acc[key].messages.push(msg);
    acc[key].totalCount += 1;
    if (msg.status === 'UNREAD') acc[key].unreadCount += 1;
    return acc;
  }, {} as Record<string, { name: string, email: string, messages: ContactMessage[], unreadCount: number, totalCount: number }>);
  
  const groupedArray = (Object.values(groupedMessages) as Array<{ name: string, email: string, messages: ContactMessage[], unreadCount: number, totalCount: number }>)
    .sort((a, b) => b.unreadCount - a.unreadCount);

  return (
    <>
      <div className="admin-content__header">
        <h1>Email & Reservations</h1>
        <p>Manage incoming messages from the Rizal AI Assistant. Messages from the same user are batched together.</p>
      </div>

      <div className="admin-metrics">
        <MetricCard
          label="Unread Messages"
          value={unreadCount}
          icon={<Inbox size={22} />}
          variant={unreadCount > 0 ? "orange" : "blue"}
        />
        <MetricCard
          label="Total Reservations"
          value={reservationCount}
          icon={<Clock size={22} />}
          variant="purple"
        />
        <MetricCard
          label="Total Handled"
          value={messages.length - unreadCount}
          icon={<CheckCircle size={22} />}
          variant="green"
        />
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__search">
            <Search size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-table-toolbar__actions">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <Filter size={16} className="text-gray-400 ml-2" />
              <select 
                className="bg-transparent border-none text-sm outline-none px-2 py-1 text-gray-700"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="EMAIL">Emails</option>
                <option value="RESERVATION">Reservations</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer border border-gray-200 px-3 py-1.5 rounded-lg bg-white">
              <input 
                type="checkbox" 
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Archived
            </label>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.size} message(s) selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => handleBulkAction('READ')} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50">Mark Read</button>
              <button onClick={() => handleBulkAction('ARCHIVED')} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50">Archive</button>
              <button onClick={() => setBulkReplyModal({ body: '' })} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 text-green-700">Reply All</button>
              {filterType === 'RESERVATION' && (
                <>
                  <button onClick={() => handleBulkAction('APPROVED')} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 text-green-700">Approve All</button>
                  <button onClick={() => handleBulkAction('DECLINED')} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 text-red-700">Decline All</button>
                </>
              )}
              <button onClick={() => handleBulkAction('DELETE')} className="text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded hover:bg-red-100">Delete</button>
            </div>
          </div>
        )}

        <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={filtered.length > 0 && selectedIds.size === filtered.length}
            onChange={toggleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select All</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading messages...</div>
        ) : groupedArray.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No messages found.</div>
        ) : (
          <div className="flex flex-col p-4 gap-4 bg-gray-50/50">
            {groupedArray.map((group) => (
              <div key={group.email} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" 
                  onClick={() => toggleExpandedGroup(group.email)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{group.name} <span className="text-gray-500 font-normal">({group.email})</span></h3>
                    <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                      {group.totalCount} message{group.totalCount > 1 ? 's' : ''} sent
                    </span>
                    {group.unreadCount > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-800 font-medium px-2 py-0.5 rounded-full">
                        {group.unreadCount} unread
                      </span>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    {expandedGroups.has(group.email) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                
                {expandedGroups.has(group.email) && (
                  <div className="flex flex-col">
                    {group.messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 transition-colors last:border-b-0 ${msg.status === 'UNREAD' ? 'bg-blue-50/30' : 'bg-white hover:bg-gray-50'}`}
                      >
                        <div className="flex items-start pt-1">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(msg.id)}
                            onChange={() => toggleSelection(msg.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${msg.message_type === 'RESERVATION' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {msg.message_type}
                            </span>
                            <h3 className={`text-sm ${msg.status === 'UNREAD' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {msg.subject || 'No Subject'}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{new Date(msg.created_at).toLocaleString()}</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-100 p-3 rounded-lg shadow-sm">{msg.message}</p>
                        </div>
                        
                        <div className="flex flex-col justify-start md:items-end gap-2 md:w-36 shrink-0">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md text-center
                            ${msg.status === 'UNREAD' ? 'bg-orange-100 text-orange-700' : 
                              msg.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              msg.status === 'DECLINED' ? 'bg-red-100 text-red-700' :
                              msg.status === 'ARCHIVED' ? 'bg-gray-200 text-gray-700' :
                              msg.status === 'READ' ? 'bg-gray-100 text-gray-700' : 
                              'bg-green-100 text-green-700'}`}
                          >
                            {msg.status}
                          </span>
                          
                          {msg.status === 'UNREAD' && (
                            <button 
                              onClick={() => updateStatus(msg.id, 'READ')}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 justify-center md:justify-end cursor-pointer"
                            >
                              <CheckCircle size={14} /> Mark as Read
                            </button>
                          )}
                          {msg.message_type === 'RESERVATION' && !['APPROVED', 'DECLINED', 'ARCHIVED'].includes(msg.status) && (
                            <div className="flex items-center gap-2 justify-center md:justify-end">
                              <button 
                                onClick={() => updateStatus(msg.id, 'APPROVED')}
                                className="text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-2 py-1 rounded cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => updateStatus(msg.id, 'DECLINED')}
                                className="text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-2 py-1 rounded cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {msg.status !== 'REPLIED' && !['ARCHIVED'].includes(msg.status) && (
                            <button 
                              onClick={() => setReplyModal({ message: msg, body: '' })}
                              className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1 justify-center md:justify-end cursor-pointer"
                            >
                              <Reply size={14} /> Reply via Email
                            </button>
                          )}
                          {msg.status !== 'ARCHIVED' && (
                            <button 
                              onClick={() => updateStatus(msg.id, 'ARCHIVED')}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 justify-center md:justify-end cursor-pointer mt-1"
                            >
                              Archive
                            </button>
                          )}
                          {msg.status === 'ARCHIVED' && (
                            <button 
                              onClick={() => deleteMessage(msg.id)}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 justify-center md:justify-end cursor-pointer mt-1"
                            >
                              Delete Forever
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!confirmModal} 
        title={confirmModal?.title || ''} 
        message={confirmModal?.message || ''} 
        onConfirm={() => confirmModal?.onConfirm()} 
        onCancel={() => setConfirmModal(null)} 
      />

      {/* SMTP Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isSendingReply && setReplyModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Reply size={20} /> Reply to {replyModal.message.name}
                </h2>
                <p className="text-green-100 text-sm mt-1">Sending via katipunan.library@jrmsu.edu.ph</p>
              </div>
              {!isSendingReply && (
                <button onClick={() => setReplyModal(null)} className="text-green-100 hover:text-white" aria-label="Close">&times;</button>
              )}
            </div>
            <div className="p-5">
              <div className="mb-3 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Original Message</p>
                <p className="font-medium text-gray-800">{replyModal.message.subject || 'No Subject'}</p>
                <p className="text-gray-600 text-xs mt-1 line-clamp-3">{replyModal.message.message}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Reply</label>
                <textarea
                  rows={6}
                  disabled={isSendingReply}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:opacity-60"
                  placeholder="Type your reply here..."
                  value={replyModal.body}
                  onChange={(e) => setReplyModal({ ...replyModal, body: e.target.value })}
                />
              </div>
              {isSendingReply && (
                <div className="flex items-center gap-3 mt-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <p>Sending email to <strong>{replyModal.message.email}</strong>... Please wait.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setReplyModal(null)}
                disabled={isSendingReply}
                className="admin-btn admin-btn--secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isSendingReply || !replyModal.body.trim()}
                className="admin-btn admin-btn--primary disabled:opacity-50 flex items-center gap-2"
                onClick={async () => {
                  if (!replyModal.body.trim()) return;
                  setIsSendingReply(true);
                  try {
                    const result = await contactApi.replyToMessage(replyModal.message.id, replyModal.body);
                    if (result.success) {
                      showToast(`Reply sent to ${replyModal.message.email}`, 'success');
                      setReplyModal(null);
                      fetchMessages();
                    } else {
                      showToast(result.detail || 'Failed to send reply', 'error');
                    }
                  } catch (err: any) {
                    showToast(err.message || 'SMTP error. Check email configuration.', 'error');
                  } finally {
                    setIsSendingReply(false);
                  }
                }}
              >
                {isSendingReply ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</>
                ) : (
                  <><Reply size={16} /> Send Reply</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMTP Reply Modal */}
      {bulkReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isSendingBulkReply && setBulkReplyModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Reply size={20} /> Reply to {selectedIds.size} Users
                </h2>
                <p className="text-blue-100 text-sm mt-1">Sending via katipunan.library@jrmsu.edu.ph</p>
              </div>
              {!isSendingBulkReply && (
                <button onClick={() => setBulkReplyModal(null)} className="text-blue-100 hover:text-white" aria-label="Close">&times;</button>
              )}
            </div>
            <div className="p-5">
              <div className="mb-3 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bulk Action</p>
                <p className="text-gray-600 text-sm">You are about to send the same reply to {selectedIds.size} selected messages.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Reply (Sent to all)</label>
                <textarea
                  rows={6}
                  disabled={isSendingBulkReply}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-60"
                  placeholder="Type your bulk reply here..."
                  value={bulkReplyModal.body}
                  onChange={(e) => setBulkReplyModal({ body: e.target.value })}
                />
              </div>
              {isSendingBulkReply && (
                <div className="flex items-center gap-3 mt-3 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <p>Sending emails... Please wait.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setBulkReplyModal(null)}
                disabled={isSendingBulkReply}
                className="admin-btn admin-btn--secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isSendingBulkReply || !bulkReplyModal.body.trim()}
                className="admin-btn admin-btn--primary disabled:opacity-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={async () => {
                  if (!bulkReplyModal.body.trim()) return;
                  setIsSendingBulkReply(true);
                  let successCount = 0;
                  let failCount = 0;
                  try {
                    const ids = Array.from<number>(selectedIds);
                    for (const id of ids) {
                      const result = await contactApi.replyToMessage(id, bulkReplyModal.body);
                      if (result.success) successCount++;
                      else failCount++;
                    }
                    showToast(`Sent ${successCount} replies. ${failCount > 0 ? failCount + ' failed.' : ''}`, successCount > 0 ? 'success' : 'error');
                    setBulkReplyModal(null);
                    setSelectedIds(new Set());
                    fetchMessages();
                  } catch (err: any) {
                    showToast(err.message || 'SMTP error during bulk send.', 'error');
                  } finally {
                    setIsSendingBulkReply(false);
                  }
                }}
              >
                {isSendingBulkReply ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</>
                ) : (
                  <><Reply size={16} /> Send {selectedIds.size} Replies</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
