import NoteCard from "../../../components/noteCard";
import { createServerClient } from "../../../lib/supabaseServer";

const MainContent = async() => {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center">
            <p className="text-gray-400">Please log in to view your notes</p>
          </div>
        </div>
      </main>
    );
  }

  console.log("User:", user.id);

  const { data, error } = await supabase
    .from('notes')
    .select('*, note_shares(id)')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
  } else {
    console.log("Fetched notes:", data);
  }

  
  const processedNotes = data?.map(note => ({
    ...note,
    isShared: note.note_shares && note.note_shares.length > 0
  })) || [];

  return (
    <main className="flex-1 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">All Notes</h2>
          {/* <p className="text-gray-400">Your personal notes</p> */}
        </div>
        
        {processedNotes && processedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedNotes.map((note) => (
              <NoteCard key={note.id} note={note} showActions={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-[#252837] rounded-xl p-8 border border-gray-700 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">No notes yet</h3>
              <p className="text-gray-400 text-sm">
                Create your first note to get started!
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;