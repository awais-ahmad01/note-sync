// import { Suspense } from 'react';
// import PrivateNotesContent from '../../../components/privateNotes';
// import NotesLoading from '../../../components/skeletons/notesLoading';

// const PrivateNotes = () => {
//   return (
//     <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
//       <div className="max-w-7xl mx-auto p-8">
//         <Suspense fallback={<NotesLoading count={6} />}>
//           <PrivateNotesContent />
//         </Suspense>
//       </div>
//     </main>
//   );
// };
// export default PrivateNotes;



import { Suspense } from 'react';
import NotesLoading from '../../../components/skeletons/notesLoading';
import { Lock, Share2 } from 'lucide-react';

const PrivateNotes = () => {
  return (
    <main className="flex-1 overflow-y-auto h-full bg-[#1a1b23]">
      <div className="h-full flex items-center justify-center">
        <Suspense fallback={<NotesLoading count={6} />}>
          <PrivateNotesWelcome />
        </Suspense>
      </div>
    </main>
  );
};

const PrivateNotesWelcome = () => {
  return (
    <div className="text-center max-w-md mx-auto p-8">
      <div className="bg-[#252837] rounded-2xl p-8 border border-gray-700">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Private Notes</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Your private notes are shown in the sidebar. Select any note to view or edit it.
          Private notes are only visible to you unless you decide to share them.
        </p>
        <div className="space-y-3 text-xs text-gray-500 text-left">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4" />
            <p>Only you can see these notes</p>
          </div>
          <div className="flex items-center gap-3">
            <Share2 className="w-4 h-4" />
            <p>Share any note to collaborate with others</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateNotes;