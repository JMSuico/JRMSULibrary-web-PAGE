import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  CheckCircle,
  Clock,
  Reply,
  Inbox,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';
import { DragDropFileUpload } from '@/src/Components/Shared/DragDropFileUpload';
import { contactApi, ContactMessage } from '@/src/Endpoints/contactApi';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { useToast } from '@/src/Hooks/useToast';
import { useAutoRefresh } from '@/src/Hooks/useAutoRefresh';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { Pagination } from '@/src/Components/Shared/Pagination';

interface AttachmentUploaderProps {
  file: File;
  onComplete: (id: string) => void;
  onError: (err: string) => void;
  onRemove: () => void;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ file, onComplete, onError, onRemove }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'uploading' | 'completed' | 'error' | 'paused'>('uploading');

  useEffect(() => {
    let isCancelled = false;
    
    const startUpload = async () => {
      setStatus('uploading');
      try {
        const res = await contactApi.uploadAttachment(file, (p) => {
           if (!isCancelled) setProgress(p);
        });
        if (!isCancelled) {
           setProgress(100);
           setStatus('completed');
           onComplete(res.file_id);
        }
      } catch (err: any) {
        if (!isCancelled) {
           setStatus('error');
           onError(err.message);
        }
      }
    };
    
    if (navigator.onLine) {
      startUpload();
    } else {
      setStatus('paused');
    }

    const handleOffline = () => setStatus('paused');
    const handleOnline = () => {
       setStatus(prev => {
         if (prev === 'paused' || prev === 'error') {
           startUpload();
           return 'uploading';
         }
         return prev;
       });
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
       isCancelled = true;
       window.removeEventListener('offline', handleOffline);
       window.removeEventListener('online', handleOnline);
    };
  }, [file]);

  return (
    <div className="flex flex-col gap-1 mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 relative pr-6">
      <div className="flex justify-between text-gray-700">
        <span className="truncate max-w-[250px] font-medium">{file.name}</span>
        <span className="font-semibold">{status === 'uploading' ? `${progress}%` : status === 'completed' ? 'Done' : status === 'paused' ? 'Paused (Offline)' : 'Failed'}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${status === 'completed' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : status === 'paused' ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
      </div>
      <button onClick={onRemove} className="absolute right-2 top-2 text-gray-400 hover:text-red-500" aria-label="Remove attachment">&times;</button>
    </div>
  );
};

export function EmailMessage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EMAIL' | 'RESERVATION' | 'CREDENTIAL_REQUEST'>('ALL');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();
  const [replyModal, setReplyModal] = useState<{ message: ContactMessage; body: string; attachments: { file: File, id?: string }[] } | null>(null);
  const [bulkReplyModal, setBulkReplyModal] = useState<{ body: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<{ id: number, action: string } | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // Background Sends UI State
  const [backgroundSends, setBackgroundSends] = useState<{id: string, email: string, isError?: boolean, errorMessage?: string}[]>([]);
  
  // Advanced Queue State for Bulk Sending
  const [queueState, setQueueState] = useState<{
    isActive: boolean;
    isPaused: boolean; // True when offline
    pendingIds: number[];
    successIds: number[];
    failedIds: number[];
    currentId: number | null;
  }>({ isActive: false, isPaused: false, pendingIds: [], successIds: [], failedIds: [], currentId: null });

  // Listen for online/offline events to pause/resume queue
  useEffect(() => {
    const handleOffline = () => {
      setQueueState(prev => prev.isActive ? { ...prev, isPaused: true } : prev);
      showToast('Internet connection lost. Sending paused.', 'error');
    };
    const handleOnline = () => {
      setQueueState(prev => prev.isActive ? { ...prev, isPaused: false } : prev);
      showToast('Internet restored. Resuming sending...', 'success');
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Process the queue
  useEffect(() => {
    let mounted = true;
    const processQueue = async () => {
      if (!queueState.isActive || queueState.isPaused || queueState.currentId !== null || queueState.pendingIds.length === 0) return;
      
      const nextId = queueState.pendingIds[0];
      setQueueState(prev => ({ ...prev, currentId: nextId }));
      
      try {
        const result = await contactApi.replyToMessage(nextId, bulkReplyModal?.body || '');
        if (mounted) {
          setQueueState(prev => ({
            ...prev,
            currentId: null,
            pendingIds: prev.pendingIds.slice(1),
            successIds: result.success ? [...prev.successIds, nextId] : prev.successIds,
            failedIds: result.success ? prev.failedIds : [...prev.failedIds, nextId]
          }));
        }
      } catch (e) {
        if (mounted) {
          setQueueState(prev => ({
            ...prev,
            currentId: null,
            pendingIds: prev.pendingIds.slice(1),
            failedIds: [...prev.failedIds, nextId]
          }));
        }
      }
    };

    if (queueState.isActive && !queueState.isPaused && queueState.pendingIds.length > 0 && queueState.currentId === null) {
      processQueue();
    } else if (queueState.isActive && queueState.pendingIds.length === 0 && queueState.currentId === null) {
      // Queue finished
      showToast(`Bulk reply completed. ${queueState.successIds.length} sent, ${queueState.failedIds.length} failed.`, 'success');
      setQueueState({ isActive: false, isPaused: false, pendingIds: [], successIds: [], failedIds: [], currentId: null });
      setBulkReplyModal(null);
      setSelectedIds(new Set());
      fetchMessages();
    }
    
    return () => { mounted = false; };
  }, [queueState, bulkReplyModal]);
  
  const { showToast } = useToast();

  const fetchMessages = async () => {
    try {
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

  // Auto-refresh messages every 15 seconds
  useAutoRefresh(fetchMessages, 15000);

  const updateStatus = async (id: number, newStatus: ContactMessage['status']) => {
    setActionLoading({ id, action: newStatus });
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
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMessage = (id: number) => {
    const msgToDelete = messages.find(m => m.id === id);
    if (!msgToDelete) return;

    triggerDelete(
      msgToDelete.subject || `Message from ${msgToDelete.email}`,
      async () => {
        try {
          await contactApi.deleteMessage(id);
          if (selectedIds.has(id)) {
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
          }
        } catch (err: any) {
          setMessages(prev => [...prev, msgToDelete]);
          showToast(err.message || 'Failed to delete message', 'error');
        }
      },
      () => {
        setMessages(prev => [...prev, msgToDelete]);
        showToast('Message restoration undone', 'success');
      }
    );

    // Optimistic delete
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleBulkAction = async (action: ContactMessage['status'] | 'DELETE') => {
    if (selectedIds.size === 0) return;
    
    if (action === 'DELETE') {
      const msgsToDelete = messages.filter(m => selectedIds.has(m.id));
      if (msgsToDelete.length === 0) return;

      triggerDelete(
        `${msgsToDelete.length} messages`,
        async () => {
          try {
            await Promise.all(Array.from<number>(selectedIds).map(id => contactApi.deleteMessage(id)));
            setSelectedIds(new Set());
          } catch (err: any) {
            setMessages(prev => [...prev, ...msgsToDelete]);
            showToast(err.message || 'Failed to perform bulk delete', 'error');
          }
        },
        () => {
          setMessages(prev => [...prev, ...msgsToDelete]);
          showToast('Bulk deletion undone', 'success');
        }
      );

      // Optimistic bulk delete
      setMessages(prev => prev.filter(m => !selectedIds.has(m.id)));
    } else {
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

  const debouncedSearch = useDebounce(searchQuery, 400);

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(debouncedSearch.toLowerCase()));
    
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

  const totalPages = Math.ceil(groupedArray.length / itemsPerPage);
  const paginatedGroups = groupedArray.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, showArchived]);

  return (
    <div className="w-full flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Background Sends Banner */}
      {backgroundSends.length > 0 && (
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {backgroundSends.map(send => (
            <div key={send.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${send.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-700'}`}>
              {send.isError ? (
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-5 h-5 shrink-0 bg-red-100 text-red-600 rounded-full flex items-center justify-center">!</div>
                  <div className="text-sm font-medium">Failed to send to {send.email}: {send.errorMessage}</div>
                  <button onClick={() => setBackgroundSends(prev => prev.filter(s => s.id !== send.id))} className="text-gray-400 hover:text-red-500 ml-2">×</button>
                </div>
              ) : (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
                  <div className="text-sm font-medium">Sending reply to {send.email}...</div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Header Panel */}
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
            <Search size={16} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
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
                <option value="CREDENTIAL_REQUEST">Credential Requests</option>
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
          <div className="flex flex-col p-4 gap-4 bg-gray-50/50 flex-1 overflow-y-auto">
            {paginatedGroups.map((group) => (
              <div key={group.email} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden shrink-0">
                <div 
                  className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" 
                  onClick={() => toggleExpandedGroup(group.email)}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-semibold text-gray-900 break-all sm:break-normal">{group.name} <span className="text-gray-500 font-normal break-all">({group.email})</span></h3>
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {msg.message_type === 'RESERVATION' ? (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold font-mono">
                                      <Clock size={14} />
                                      RESERVATION
                                    </span>
                                  ) : msg.message_type === 'CREDENTIAL_REQUEST' ? (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs font-bold font-mono">
                                      <span className="material-symbols-outlined text-[14px]">key</span>
                                      CREDENTIAL REQ
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-bold font-mono">
                                      <Mail size={14} />
                                      EMAIL
                                    </span>
                                  )}
                            <h3 className={`text-sm break-words ${msg.status === 'UNREAD' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {msg.subject || 'No Subject'}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{new Date(msg.created_at).toLocaleString()}</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words bg-white border border-gray-100 p-3 rounded-lg shadow-sm">{msg.message}</p>
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
                                disabled={actionLoading?.id === msg.id}
                                className={`text-xs px-2 py-1 rounded transition-colors ${actionLoading?.id === msg.id && actionLoading?.action === 'APPROVED' ? 'bg-green-50 text-green-700/50 border border-green-200/50 cursor-not-allowed flex items-center gap-1' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer'} ${(actionLoading?.id === msg.id && actionLoading?.action !== 'APPROVED') ? 'opacity-50 pointer-events-none' : ''}`}
                              >
                                {actionLoading?.id === msg.id && actionLoading?.action === 'APPROVED' ? <><div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div> Approving...</> : 'Approve'}
                              </button>
                              <button 
                                onClick={() => updateStatus(msg.id, 'DECLINED')}
                                disabled={actionLoading?.id === msg.id}
                                className={`text-xs px-2 py-1 rounded transition-colors ${actionLoading?.id === msg.id && actionLoading?.action === 'DECLINED' ? 'bg-red-50 text-red-700/50 border border-red-200/50 cursor-not-allowed flex items-center gap-1' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 cursor-pointer'} ${(actionLoading?.id === msg.id && actionLoading?.action !== 'DECLINED') ? 'opacity-50 pointer-events-none' : ''}`}
                              >
                                {actionLoading?.id === msg.id && actionLoading?.action === 'DECLINED' ? <><div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> Declining...</> : 'Decline'}
                              </button>
                            </div>
                          )}
                          {msg.status !== 'REPLIED' && !['ARCHIVED'].includes(msg.status) && (
                            <button 
                              onClick={() => setReplyModal({ message: msg, body: '', attachments: [] })}
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
            
            {groupedArray.length > itemsPerPage && (
              <div className="mt-4 shrink-0">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={groupedArray.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* SMTP Reply Modal */}
      {replyModal && (
        <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={() => !isSendingReply && setReplyModal(null)}>
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


              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 mt-3">Attachments (Max 10MB each)</label>
                <DragDropFileUpload
                  accept="*/*"
                  multiple={true}
                  maxSizeMB={10}
                  onFilesSelected={(files) => {
                    const newFiles = files.map(f => ({ file: f }));
                    setReplyModal({ ...replyModal, attachments: [...replyModal.attachments, ...newFiles] });
                  }}
                  label="Click to attach files or drag and drop"
                  subLabel="Maximum file size: 10MB each"
                />
                <div className="mt-2 max-h-[150px] overflow-y-auto pr-1">
                  {replyModal.attachments.map((att: { file: File; id?: string }, idx: number) => (
                <AttachmentUploader 
                  key={`${att.file.name}-${idx}`} 
                  file={att.file} 
                  onComplete={(id) => {
                    setReplyModal(prev => {
                          if (!prev) return prev;
                          const updated = [...prev.attachments];
                          updated[idx] = { ...updated[idx], id };
                          return { ...prev, attachments: updated };
                        });
                      }}
                      onError={(err) => {
                        console.error(`Upload failed for ${att.file.name}: ${err}`);
                      }}
                      onRemove={() => {
                        setReplyModal(prev => {
                          if (!prev) return prev;
                          const updated = [...prev.attachments];
                          updated.splice(idx, 1);
                          return { ...prev, attachments: updated };
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setReplyModal(null)}
                className="admin-btn admin-btn--secondary"
              >
                Cancel
              </button>
              <button
                disabled={!replyModal.body.trim() || replyModal.attachments.some(a => !a.id)}
                className={`admin-btn admin-btn--primary flex items-center gap-2 ${(!replyModal.body.trim() || replyModal.attachments.some(a => !a.id)) ? 'opacity-50 cursor-not-allowed bg-gray-400 border-gray-400' : ''}`}
                onClick={async () => {
                  if (!replyModal.body.trim() || replyModal.attachments.some(a => !a.id)) return;
                  
                  const emailPayload = {
                    id: replyModal.message.id,
                    email: replyModal.message.email,
                    body: replyModal.body,
                    attachments: [...replyModal.attachments]
                  };
                  
                  setReplyModal(null);
                  
                  const sendId = Math.random().toString(36).substring(7);
                  setBackgroundSends(prev => [...prev, { id: sendId, email: emailPayload.email }]);
                  
                  try {
                    let result;
                    if (emailPayload.attachments.length > 0) {
                      const fileEntries = emailPayload.attachments.map(a => ({ id: a.id!, name: a.file.name }));
                      result = await contactApi.replyWithFiles(emailPayload.id, emailPayload.body, fileEntries, false);
                    } else {
                      result = await contactApi.replyToMessage(emailPayload.id, emailPayload.body, false);
                    }
                    
                    if (result.success) {
                      showToast(`Reply sent to ${emailPayload.email}`, 'success');
                      setBackgroundSends(prev => prev.filter(s => s.id !== sendId));
                      fetchMessages(); 
                    } else {
                      setBackgroundSends(prev => prev.map(s => s.id === sendId ? { ...s, isError: true, errorMessage: result.detail || 'Failed to send' } : s));
                    }
                  } catch (err: any) {
                    setBackgroundSends(prev => prev.map(s => s.id === sendId ? { ...s, isError: true, errorMessage: err.message || 'Network/SMTP Error' } : s));
                  }
                }}
              >
                <Reply size={16} /> Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkReplyModal && (
        <div className="fixed backdrop-blur-sm inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={() => !queueState.isActive && setBulkReplyModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Reply size={20} /> Reply to {selectedIds.size} Users
                </h2>
                <p className="text-blue-100 text-sm mt-1">Sequential Bulk Sending</p>
              </div>
              {!queueState.isActive && (
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
                  disabled={queueState.isActive}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-60"
                  placeholder="Type your bulk reply here..."
                  value={bulkReplyModal.body}
                  onChange={(e) => setBulkReplyModal({ body: e.target.value })}
                />
              </div>
              {queueState.isActive && (
                <div className={`flex items-center gap-3 mt-4 text-sm rounded-lg p-3 border ${queueState.isPaused ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {!queueState.isPaused && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>}
                  <div className="flex-1">
                    <p className="font-semibold">{queueState.isPaused ? 'Paused (Offline)' : 'Sending emails...'}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((queueState.successIds.length + queueState.failedIds.length) / selectedIds.size) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>{queueState.successIds.length + queueState.failedIds.length} / {selectedIds.size} Processed</span>
                      {queueState.failedIds.length > 0 && <span className="text-red-600">{queueState.failedIds.length} Failed</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (queueState.isActive) {
                    setQueueState({ isActive: false, isPaused: false, pendingIds: [], successIds: [], failedIds: [], currentId: null });
                  }
                  setBulkReplyModal(null);
                }}
                disabled={queueState.isActive}
                className="admin-btn admin-btn--secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={queueState.isActive || !bulkReplyModal.body.trim()}
                className="admin-btn admin-btn--primary disabled:opacity-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (!bulkReplyModal.body.trim()) return;
                  setQueueState({
                    isActive: true,
                    isPaused: !navigator.onLine,
                    pendingIds: Array.from(selectedIds),
                    successIds: [],
                    failedIds: [],
                    currentId: null
                  });
                }}
              >
                {queueState.isActive ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</>
                ) : (
                  <><Reply size={16} /> Send {selectedIds.size} Replies</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Undo Delete Toast */}
      {undoState && (
        <div className="fixed bottom-6 right-6 z-[60] bg-white rounded-lg shadow-xl border border-gray-100 p-4 w-80 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Item deleted</p>
              <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium text-gray-700">{undoState.itemName}</span> has been moved to the recycle bin.</p>
            </div>
            <button 
              onClick={() => cancelDelete()}
              className="text-sm font-bold text-navy hover:text-navy-dark px-2 py-1 bg-blue-50 rounded"
            >
              Undo
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500"
              style={{ 
                width: `${(undoState.timeLeft / 3000) * 100}%`,
                transition: 'width 100ms linear'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


