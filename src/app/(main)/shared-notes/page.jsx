
'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Bell } from 'lucide-react';
import Link from 'next/link';

const SharedNotes = () => {
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    getUser();
    
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time subscription...');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Current user:', user);
    if (error) {
      console.error('Error getting user:', error);
      return;
    }
    
    setUser(user);
    if (user) {
      console.log('Fetching shared notes for user ID:', user.id);
      await fetchSharedNotes(user.id);
      console.log('Setting up real-time subscription for user ID:', user.id);
      setupRealtimeSubscription(user.id);
    }
  };

  const fetchSharedNotes = async (userId) => {
    try {
      setLoading(true);
      
      console.log('Fetching shared notes for user:', userId);
      
    
      const { data: sharedNoteIds, error: sharesError } = await supabase
        .from('note_shares')
        .select('id, note_id, role, created_at')
        .eq('user_id', userId);

      if (sharesError) {
        console.error('Error fetching note shares:', sharesError);
        throw sharesError;
      }

      if (!sharedNoteIds || sharedNoteIds.length === 0) {
        setSharedNotes([]);
        setLoading(false);
        return;
      }

    
      const noteIds = sharedNoteIds.map(share => share.note_id);
      
     
      const { data: notesWithOwners, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          owner:user_profiles!fk_notes_owner_id(email, name)
        `)
        .in('id', noteIds)
        .order('updated_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        throw notesError;
      }

      
      const processedNotes = (notesWithOwners || []).map(note => {
        const shareInfo = sharedNoteIds.find(share => share.note_id === note.id);
        return {
          ...note,
          isShared: true,
          sharedBy: note.owner?.name || note.owner?.email || 'Unknown User',
          role: shareInfo?.role || 'viewer',
          updated: getRelativeTime(note.updated_at),
          sharedAt: shareInfo?.created_at,
          shareId: shareInfo?.id
        };
      });

      setSharedNotes(processedNotes);
      
    } catch (error) {
      console.error('Error fetching shared notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = (userId) => {
    console.log('🚀 Setting up real-time subscription for user:', userId);

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

   
    const channel = supabase
      .channel(`shared_notes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'note_shares',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('📥 New note shared!', payload);
          await handleNewShare(payload.new, userId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'note_shares',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🗑️ Note share removed!', payload);
          handleShareRemoval(payload.old);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'note_shares',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('✏️ Note share updated!', payload);
          await handleShareUpdate(payload.new, userId);
        }
      )
     
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          console.log('📝 Note content updated!', payload);
          handleNoteUpdate(payload.new);
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out');
        
          setTimeout(() => setupRealtimeSubscription(userId), 5000);
        }
      });

    channelRef.current = channel;
  };

  const handleNewShare = async (newShare, userId) => {
    try {
      console.log('Processing new share:', newShare);
      
       const existingNote = sharedNotes.find(note => note.id === newShare.note_id);
      if (existingNote) {
        console.log('Note already exists, skipping...');
        return;
      }

      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select(`
          *,
          owner:user_profiles!fk_notes_owner_id(email, name)
        `)
        .eq('id', newShare.note_id)
        .single();

      if (noteError || !noteData) {
        console.error('Error fetching note:', noteError);
        showNotification({
          type: 'share',
          message: 'Someone shared a note with you',
          timestamp: new Date()
        });
        return;
      }

      const newNote = {
        ...noteData,
        isShared: true,
        sharedBy: noteData.owner?.name || noteData.owner?.email || 'Unknown User',
        role: newShare.role || 'viewer',
        updated: getRelativeTime(noteData.updated_at),
        sharedAt: newShare.created_at,
        shareId: newShare.id
      };

      console.log('✅ Adding new note to state:', newNote.title);

      setSharedNotes(prev => [newNote, ...prev]);

      showNotification({
        type: 'share',
        message: `${noteData.owner?.name || 'Someone'} shared "${noteData.title}" with you`,
        noteId: noteData.id,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Error handling new share:', error);
    }
  };

  const handleShareRemoval = (removedShare) => {
    console.log('Removing note from shared list:', removedShare.note_id);
    
    setSharedNotes(prev => {
      const removedNote = prev.find(note => note.id === removedShare.note_id);
      const filtered = prev.filter(note => note.id !== removedShare.note_id);
      
      if (removedNote) {
        showNotification({
          type: 'removal',
          message: `"${removedNote.title}" is no longer shared with you`,
          timestamp: new Date()
        });
      }
      
      return filtered;
    });
  };

  const handleShareUpdate = async (updatedShare, userId) => {
    try {
      console.log('Updating share permissions:', updatedShare);
      
    
      const { data: noteData, error } = await supabase
        .from('notes')
        .select(`
          *,
          owner:user_profiles!fk_notes_owner_id(email, name)
        `)
        .eq('id', updatedShare.note_id)
        .single();

      if (error || !noteData) {
        console.error('Error fetching updated note:', error);
        return;
      }

      const updatedNote = {
        ...noteData,
        isShared: true,
        sharedBy: noteData.owner?.name || noteData.owner?.email || 'Unknown User',
        role: updatedShare.role,
        updated: getRelativeTime(noteData.updated_at),
        sharedAt: updatedShare.created_at,
        shareId: updatedShare.id
      };

      setSharedNotes(prev => 
        prev.map(note => 
          note.id === updatedShare.note_id ? updatedNote : note
        )
      );

      showNotification({
        type: 'update',
        message: `Your permissions for "${noteData.title}" were updated`,
        noteId: noteData.id,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Error handling share update:', error);
    }
  };

  const handleNoteUpdate = (updatedNote) => {
    console.log('Note content updated:', updatedNote.id);
    
    setSharedNotes(prev => 
      prev.map(note => {
        if (note.id === updatedNote.id) {
          return {
            ...note,
            ...updatedNote,
            updated: getRelativeTime(updatedNote.updated_at)
          };
        }
        return note;
      })
    );
  };

  const showNotification = (notification) => {
    const notificationWithId = {
      ...notification,
      id: Date.now() + Math.random()
    };
    
    setNotifications(prev => [notificationWithId, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationWithId.id));
    }, 5000);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading shared notes...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto min-h-screen">
  
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-emerald-500 text-white p-4 rounded-lg shadow-lg border border-emerald-400 animate-in slide-in-from-right duration-300"
          >
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-80 mt-1">
                  {getRelativeTime(notification.timestamp)}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-white hover:text-gray-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Shared With You</h2>
              <p className="text-gray-400">
                {sharedNotes.length > 0 
                  ? `You have ${sharedNotes.length} note${sharedNotes.length > 1 ? 's' : ''} shared with you` 
                  : 'No notes have been shared with you yet'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* {channelRef.current && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              )} */}
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-emerald-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {sharedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedNotes.map((note) => (
              <SharedNoteCard key={`${note.id}-${note.shareId}`} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-[#252837] rounded-xl p-8 border border-gray-700 max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No shared notes yet</h3>
              <p className="text-gray-400 text-sm">
                When someone shares a note with you, it will appear here automatically.
                {channelRef.current && (
                  <span className="block mt-2 text-green-400">✓ Real-time updates active</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const SharedNoteCard = ({ note }) => {
  return (
    <Link href={`/notes/${note.id}`}>
      <div className="bg-[#252837] rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full">
              Shared
            </span>
            <span className={`text-xs px-3 py-1 rounded-full ${
              note.role === 'editor' 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {note.role === 'editor' ? 'Can edit' : 'Can view'}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
          {note.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {note.body || 'No content yet...'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Shared by {note.sharedBy}</span>
          </div>
          <span>Updated {note.updated}</span>
        </div>
      </div>
    </Link>
  );
};

function getRelativeTime(dateString) {
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
}

export default SharedNotes;