'use client';
import Link from 'next/link';
import { Trash2, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ShareModal from '../components/shareModal';

const NoteCard = ({ note, showActions = false }) => {
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

      router.refresh();
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
           
           
            {showActions && (
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
            )}
            
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs px-3 py-1 rounded-full ${
                note.isShared 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {note?.isShared ? 'Shared' : 'Private'}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
              {note?.title || 'Untitled Note'}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {note?.body || 'No content'}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Updated {getRelativeTime(note?.updated_at)}</span>
            </div>
          </div>
        </Link>
      </div>

    
      {showActions && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          noteTitle={note?.title || 'Untitled Note'}
          noteId={note?.id}
        />
      )}
    </>
  );
};


function getRelativeTime(dateString) {
  const date = new Date(dateString);
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

export default NoteCard;