// import { fetchNotesData } from './notesData';
// import NoteCard from './noteCard';

// const AllNotes = async () => {
//   const { allNotes, userNotes, sharedNotes, user } = await fetchNotesData();

//   if (!user) {
//     return (
//       <div className="text-center py-12">
//         <div className="bg-[#252837] rounded-xl p-8 border border-gray-700 max-w-md mx-auto">
//           <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
//           <p className="text-gray-400 text-sm">
//             Please log in to view your notes
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-white mb-2">All Notes</h2>
//         <p className="text-gray-400">
//           {allNotes.length > 0 
//             ? `You have ${allNotes.length} note${allNotes.length > 1 ? 's' : ''} (${userNotes.length} created, ${sharedNotes.length} shared with you)` 
//             : 'No notes yet'
//           }
//         </p>
//       </div>
      
//       {allNotes.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {allNotes.map((note) => (
//             <NoteCard 
//               key={note.id} 
//               note={note} 
            
//               initialUserRole={note.userRole}
//               showActions={note.userRole === 'owner'}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <div className="bg-[#252837] rounded-xl p-8 border border-gray-700 max-w-md mx-auto">
//             <h3 className="text-lg font-semibold text-white mb-2">No notes yet</h3>
//             <p className="text-gray-400 text-sm">
//               Create your first note to get started!
//             </p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AllNotes;



import { fetchNotesData } from './notesData';

const AllNotes = async () => {
  const { user } = await fetchNotesData();

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="bg-[#252837] rounded-xl p-8 border border-gray-700 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
          <p className="text-gray-400 text-sm">
            Please log in to view your notes
          </p>
        </div>
      </div>
    );
  }

  // This component is now just a fallback - the main notes list is in the layout sidebar
  return null;
};

export default AllNotes;