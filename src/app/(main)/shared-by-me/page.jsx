// import { Suspense } from "react";
// import NotesLoading from '../../../components/skeletons/notesLoading';
// import SharedByMeContent from "../../../components/sharedByMe";

// const SharedByMe = () => {
//   return (
//     <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
//       <div className="max-w-7xl mx-auto p-8">
//         <Suspense fallback={<NotesLoading count={6} />}>
//           <SharedByMeContent />
//         </Suspense>
//       </div>
//     </main>
//   );
// };

// export default SharedByMe;

import { Suspense } from "react";
import NotesLoading from '../../../components/skeletons/notesLoading';
import { Share2, Users } from 'lucide-react';

const SharedByMe = () => {
  return (
    <main className="flex-1 overflow-y-auto h-full bg-white">
      <div className="h-full flex items-center justify-center">
        {/* <Suspense fallback={<NotesLoading count={6} />}> */}
          <SharedByMeWelcome />
        {/* </Suspense> */}
      </div>
    </main>
  );
};

const SharedByMeWelcome = () => {
  return (
    <div className="text-center max-w-md mx-auto p-8">
      <div className="bg-[#F5F5F5] rounded-2xl p-8 border border-[#E0E0E0]">
        <div className="w-20 h-20 bg-[#50C878] rounded-full flex items-center justify-center mx-auto mb-6">
          <Share2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[#2E2E2E] mb-3">Notes Shared By You</h3>
        <p className="text-[#666666] text-sm mb-6 leading-relaxed">
          These are notes you've shared with others. Manage sharing permissions 
          and see your shared notes in the sidebar.
        </p>
        <div className="space-y-3 text-xs text-[#666666] text-left">
          <div className="flex items-center gap-3">
            <Share2 className="w-4 h-4" />
            <p>Notes you've shared with others</p>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4" />
            <p>Manage permissions from the note editor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedByMe;