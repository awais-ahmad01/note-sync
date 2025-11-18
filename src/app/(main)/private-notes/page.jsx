'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Lock, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShareModal from '../../../components/shareModal';

const PrivateNotes = () => {
  const [privateNotes, setPrivateNotes] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (error) {
      console.error('Error getting user:', error);
      return;
    }

    setUser(user);
    if (user) {
      await fetchPrivateNotes(user.id);
      setupRealtimeSubscription(user.id);
    }
  };

  const fetchPrivateNotes = async (userId) => {
    try {
      setLoading(true);

    
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, title, body, updated_at, note_shares(id)')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        setPrivateNotes([]);
        return;
      }

     
      const privateOnly = notesData.filter(note => !note.note_shares || note.note_shares.length === 0);

      setPrivateNotes(privateOnly);
    } catch (error) {
      console.error('Error fetching private notes:', error);
      setPrivateNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = (userId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`private_notes_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `owner_id=eq.${userId}` },
        async (payload) => {
          console.log('Realtime private note change:', payload);
          await fetchPrivateNotes(userId);
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('Channel error:', err);
      });

    channelRef.current = channel;
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading private notes...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">My Private Notes</h2>
          <p className="text-gray-400">
            {privateNotes.length > 0
              ? `You have ${privateNotes.length} private note${privateNotes.length > 1 ? 's' : ''}`
              : 'You have no private notes yet'}
          </p>
        </div>

        {privateNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privateNotes.map((note) => (
              <PrivateNoteCard key={note.id} note={note} onRefresh={() => fetchPrivateNotes(user.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-[#252837] rounded-xl p-8 border border-gray-700 max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No private notes yet</h3>
              <p className="text-gray-400 text-sm">
                Your private notes will appear here. Share them to collaborate with others.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const PrivateNoteCard = ({ note, onRefresh }) => {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id);

      if (error) {
        throw error;
      }

      onRefresh();
      console.log('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div className="group relative">
        <Link href={`/notes/${note.id}`}>
          <div className="bg-[#252837] rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
         
            <div className="absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleShare}
                className="bg-indigo-500 hover:bg-indigo-600 text-white p-1.5 rounded-full shadow-lg z-10"
                title="Share note"
              >
                <Users className="w-3 h-3" />
              </button>
              
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg z-10"
                title="Delete note"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full">
                  Private
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
              {note.title}
            </h3>

            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {note.body || 'No content yet...'}
            </p>

            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span>Updated {getRelativeTime(note.updated_at)}</span>
            </div>
          </div>
        </Link>
      </div>

    
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        noteTitle={note.title || 'Untitled Note'}
        noteId={note.id}
      />
    </>
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

export default PrivateNotes;