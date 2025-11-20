import { Suspense } from 'react';
import PrivateNotesContent from '../../../components/privateNotes';
import NotesLoading from '../../../components/skeletons/notesLoading';

const PrivateNotes = () => {
  return (
    <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
      <div className="max-w-7xl mx-auto p-8">
        <Suspense fallback={<NotesLoading count={6} />}>
          <PrivateNotesContent />
        </Suspense>
      </div>
    </main>
  );
};
export default PrivateNotes;