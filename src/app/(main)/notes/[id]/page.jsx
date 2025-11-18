
import { createServerClient } from "../../../../lib/supabaseServer";
import NoteEditor from "../../../../components/nodeEditor";

const NoteEditPage = async ({ params }) => {
  const supabase = await createServerClient();
  const { id } = await params;

  // Fetch the specific note
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching note:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Note Not Found</h1>
          <p className="text-gray-400">The note you're looking for doesn't exist or you don't have permission to access it.</p>
        </div>
      </div>
    );
  }

  // Check if user has permission to edit this note
  const { data: { user } } = await supabase.auth.getUser();
  
  const canEdit = note.owner_id === user.id || 
    await (async () => {
      const { data: share } = await supabase
        .from('note_shares')
        .select('role')
        .eq('note_id', id)
        .eq('user_id', user.id)
        .single();
      return share?.role === 'editor';
    })();

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to edit this note.</p>
        </div>
      </div>
    );
  }

  return <NoteEditor note={note} />;
};

export default NoteEditPage;