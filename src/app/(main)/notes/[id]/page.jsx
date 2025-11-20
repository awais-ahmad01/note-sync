
import { createServerClient } from "../../../../lib/supabaseServer";
import NoteEditor from "../../../../components/nodeEditor";

const NoteEditPage = async ({ params }) => {
  const supabase = await createServerClient();
  const { id } = await params;

  console.log("🔍 Server: Fetching note with ID:", id);

  
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("❌ Server: Error fetching note:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Note Not Found</h1>
          <p className="text-gray-400">The note you're looking for doesn't exist or you don't have permission to access it.</p>
        </div>
      </div>
    );
  }

 
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("❌ Server: User not authenticated");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please log in to access this note.</p>
        </div>
      </div>
    );
  }

  console.log("🔍 Server: Checking permissions for user:", user.id);


  let userRole = null;
  
  if (note.owner_id === user.id) {
    
    userRole = 'owner';
    console.log("👑 Server: User is owner of the note");
  } else {
   
    const { data: share, error: shareError } = await supabase
      .from('note_shares')
      .select('role')
      .eq('note_id', id)
      .eq('user_id', user.id)
      .single();

    if (shareError || !share) {
      console.log("🚫 Server: User doesn't have access to this note");
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400">You don't have permission to access this note.</p>
          </div>
        </div>
      );
    }

    userRole = share.role;
    console.log("🎯 Server: User role:", userRole);
  }


  const canView = userRole === 'owner' || userRole === 'editor' || userRole === 'viewer';
  
  if (!canView) {
    console.log("🚫 Server: User cannot view this note");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to view this note.</p>
        </div>
      </div>
    );
  }

  console.log("✅ Server: User has access, passing noteId to NoteEditor");

  // Pass only the noteId to NoteEditor (not the entire note)
  // NoteEditor will handle fetching and role-based editing permissions on the client side
  return <NoteEditor noteId={id} />;
};

export default NoteEditPage;