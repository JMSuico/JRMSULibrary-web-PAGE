import { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  CheckCircle,
  Clock,
  Reply,
  Inbox,
  Filter,
} from 'lucide-react';
import { MetricCard } from '@/src/Features/Admin/components/MetricCard';

import { contactApi, ContactMessage } from '@/src/Endpoints/contactApi';
import { useToast } from '@/src/Hooks/useToast';

export default function EmailMessagePage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EMAIL' | 'RESERVATION'>('ALL');
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

  const updateStatus = async (id: number, newStatus: 'READ' | 'REPLIED') => {
    try {
      await contactApi.updateMessageStatus(id, newStatus);
      showToast(`Message marked as ${newStatus}`, 'success');
      fetchMessages();
    } catch (err: any) {
      showToast(err.message || 'Failed to update message status', 'error');
    }
  };

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'ALL' || m.message_type === filterType;
    return matchesSearch && matchesType;
  });

  const unreadCount = messages.filter(m => m.status === 'UNREAD').length;
  const reservationCount = messages.filter(m => m.message_type === 'RESERVATION').length;

  return (
    <>
      <div className="admin-content__header">
        <h1>Email & Reservations</h1>
        <p>Manage incoming messages from the Rizal AI Assistant.</p>
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
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading messages...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No messages found.</div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 transition-colors ${msg.status === 'UNREAD' ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${msg.message_type === 'RESERVATION' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {msg.message_type}
                    </span>
                    <h3 className={`text-sm ${msg.status === 'UNREAD' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {msg.subject || 'No Subject'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">From: <span className="font-medium text-gray-700">{msg.name}</span> ({msg.email}) &bull; {new Date(msg.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-100 p-3 rounded-lg">{msg.message}</p>
                </div>
                
                <div className="flex flex-col justify-start md:items-end gap-2 md:w-32 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md text-center
                    ${msg.status === 'UNREAD' ? 'bg-orange-100 text-orange-700' : 
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
                  {msg.status !== 'REPLIED' && (
                    <button 
                      onClick={() => {
                        window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject || 'Library Inquiry'}`;
                        updateStatus(msg.id, 'REPLIED');
                      }}
                      className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1 justify-center md:justify-end cursor-pointer"
                    >
                      <Reply size={14} /> Reply (Email)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
