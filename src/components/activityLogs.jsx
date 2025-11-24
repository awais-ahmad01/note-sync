
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Activity, FileText, Share2, UserMinus, Clock, CheckCheck } from 'lucide-react';
import ActivityLogsLoading from './skeletons/activityLogsLoading';
import { useActivityLogs } from '../contexts/activityLogsContext';

const ActivityLogsContent = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [noteMap, setNoteMap] = useState({});
  const [lastReadAt, setLastReadAt] = useState(null);
  const { markAllAsRead, fetchUnreadCount } = useActivityLogs();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    fetchLogs();
    fetchLastReadTime();

    const subscription = supabase
      .channel('realtime-activity-logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_logs' },
        (payload) => {
          fetchLogs(); 
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [currentUser]);

  
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        handleMarkAsRead();
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [currentUser, logs]);

  const fetchLastReadTime = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('last_read_activity_at')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      setLastReadAt(data?.last_read_activity_at);
    } catch (err) {
      console.error('Error fetching last read time:', err);
    }
  };

  const handleMarkAsRead = async () => {
    await markAllAsRead();
    setLastReadAt(new Date().toISOString());
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_get_activity_logs_for_user', { _user_id: currentUser.id });
      if (error) throw error;
      setLogs(data || []);

      await fetchExtraData(data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExtraData = async (logsData) => {
    const userIds = [...new Set(logsData.flatMap(log => [log.actor_id, log.payload?.shared_with, log.payload?.removed_user].filter(Boolean)))];
    const noteIds = [...new Set(logsData.map(log => log.note_id).filter(Boolean))];

    if (userIds.length) {
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, email, name')
        .in('id', userIds);
      setUserMap(users?.reduce((acc, u) => ({ ...acc, [u.id]: u }), {}) || {});
    }

    if (noteIds.length) {
      const { data: notes } = await supabase
        .from('notes')
        .select('id, title')
        .in('id', noteIds);
      setNoteMap(notes?.reduce((acc, n) => ({ ...acc, [n.id]: n }), {}) || {});
    }
  };

  const isNewLog = (logCreatedAt) => {
    if (!lastReadAt || !logCreatedAt) return false;
    return new Date(logCreatedAt) > new Date(lastReadAt);
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'note_created':
        return <FileText className="w-4 h-4 text-[#50C878]" />;
      case 'note_updated':
        return <FileText className="w-4 h-4 text-[#4A90E2]" />;
      case 'note_shared':
        return <Share2 className="w-4 h-4 text-[#B22222]" />;
      case 'note_unshared':
        return <UserMinus className="w-4 h-4 text-[#B22222]" />;
      default:
        return <Activity className="w-4 h-4 text-[#999999]" />;
    }
  };

  const renderMessage = (log) => {
    const { action, payload, note_id, actor_id } = log;
    const noteTitle = noteMap[note_id]?.title || 'Unknown Note';
    const actor = userMap[actor_id]?.name || 'Someone';

    switch(action) {
      case 'note_created':
        return `You created note "${payload.title || noteTitle}"`;

      case 'note_updated':
        return `${actor} updated note "${payload.old_title || noteTitle}"`;

      case 'note_shared':
        if (payload.shared_with === currentUser?.id) {
          const sharer = userMap[actor_id]?.name || 'Someone';
          return `${sharer} shared note "${noteTitle}" with you`;
        }
        const sharedWithName = userMap[payload.shared_with]?.name || 'Someone';
        return `You shared note "${noteTitle}" with ${sharedWithName}`;

      case 'note_unshared':
        if (payload.removed_user === currentUser?.id) {
          return `Your access to note "${noteTitle}" was removed`;
        }
        const removedName = userMap[payload.removed_user]?.name || 'Someone';
        return `You removed ${removedName} from note "${noteTitle}"`;

      default:
        return action;
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'unknown time';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'unknown time';
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) return 'just now';
    else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <ActivityLogsLoading count={6} />;
  }

  const hasUnreadLogs = logs.some(log => isNewLog(log.created_at));

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#2E2E2E] mb-2">Activity Logs</h2>
          <p className="text-[#666666]">
            {logs.length > 0 
              ? `${logs.length} recent activit${logs.length === 1 ? 'y' : 'ies'}` 
              : 'No activity yet'}
          </p>
        </div>
        
        {hasUnreadLogs && (
          <button
            onClick={handleMarkAsRead}
            className="flex items-center gap-2 bg-[#B22222] hover:bg-[#8B0000] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => {
            const isNew = isNewLog(log.created_at);
            
            return (
              <div 
                key={log.id} 
                className={`rounded-xl p-6 border transition-all ${
                  isNew 
                    ? 'bg-[#FFF5F5] border-[#FFD0D0] shadow-sm' 
                    : 'bg-[#F5F5F5] border-[#E0E0E0] hover:border-[#D0D0D0]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isNew ? 'bg-[#B22222]/30' : 'bg-[#B22222]/20'
                  }`}>
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[#2E2E2E] text-sm leading-relaxed">
                        {renderMessage(log)}
                      </p>
                      
                      {isNew && (
                        <span className="flex-shrink-0 bg-[#B22222] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#999999]">
                      <Clock className="w-3 h-3" />
                      <span>{getRelativeTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-[#F5F5F5] rounded-xl p-8 border border-[#E0E0E0] max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#B22222]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-[#B22222]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2E2E2E] mb-2">No activity yet</h3>
            <p className="text-[#666666] text-sm">
              Your recent activities will appear here.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityLogsContent;