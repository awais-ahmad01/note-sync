
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const ActivityLogsContext = createContext();

export const useActivityLogs = () => {
  const context = useContext(ActivityLogsContext);
  if (!context) {
    throw new Error('useActivityLogs must be used within ActivityLogsProvider');
  }
  return context;
};

export const ActivityLogsProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Initial fetch
    fetchUnreadCount();

    // Subscribe to real-time changes for logs where current user is the actor
    const actorSubscription = supabase
      .channel('activity-logs-actor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `actor_id=eq.${currentUser.id}`
        },
        (payload) => {
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Subscribe to note_shares for shared notes (to catch shared_with events)
    const shareSubscription = supabase
      .channel('activity-logs-shares')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        (payload) => {
          // Only increment if shared_with matches current user
          if (payload.new.payload?.shared_with === currentUser.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      actorSubscription.unsubscribe();
      shareSubscription.unsubscribe();
    };
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .rpc('get_unread_activity_count', { _user_id: currentUser.id });
      
      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ last_read_activity_at: new Date().toISOString() })
        .eq('id', currentUser.id);

      if (error) throw error;
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <ActivityLogsContext.Provider value={{ unreadCount, markAllAsRead, fetchUnreadCount }}>
      {children}
    </ActivityLogsContext.Provider>
  );
};