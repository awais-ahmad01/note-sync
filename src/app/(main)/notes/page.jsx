
import { Suspense } from 'react';
import AllNotes from '../../../components/allNotes';
import NotesLoading from '../../../components/skeletons/notesLoading';

export default function NotesPage() {
  return (
    <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
      <div className="max-w-7xl mx-auto p-8">
        <Suspense fallback={
          <div>
         
            <div className="mb-8">
              <div className="h-8 bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-96 animate-pulse"></div>
            </div>
           
            <NotesLoading count={6} />
          </div>
        }>
          <AllNotes />
        </Suspense>
      </div>
    </main>
  );
}

