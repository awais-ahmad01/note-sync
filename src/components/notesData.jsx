
import { createServerClient } from "../lib/supabaseServer";

export async function fetchNotesData() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { allNotes: [], userNotes: [], sharedNotes: [], user: null };
  }

  console.log("User:", user.id);

  const { data: userNotes, error: userNotesError } = await supabase
    .from('notes')
    .select('*, note_shares(id)')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });


  const { data: sharedNoteIds, error: sharesError } = await supabase
    .from('note_shares')
    .select('note_id, role')
    .eq('user_id', user.id);

  let sharedNotes = [];
  if (sharedNoteIds && sharedNoteIds.length > 0) {
    const noteIds = sharedNoteIds.map(share => share.note_id);
    const { data: sharedNotesData, error: sharedNotesError } = await supabase
      .from('notes')
      .select('*, note_shares(id), owner:user_profiles!fk_notes_owner_id(name, email)')
      .in('id', noteIds)
      .order('updated_at', { ascending: false });

    if (sharedNotesData) {
      sharedNotes = sharedNotesData.map(note => {
        const shareInfo = sharedNoteIds.find(share => share.note_id === note.id);
        return {
          ...note,
          isShared: true,
          sharedBy: note.owner?.name || note.owner?.email || 'Unknown User',
          role: shareInfo?.role || 'viewer',
          userRole: shareInfo?.role
        };
      });
    }
  }

  if (userNotesError) {
    console.error("Error fetching user notes:", userNotesError);
  }

  if (sharesError) {
    console.error("Error fetching shared notes:", sharesError);
  }

  const allNotes = [
    ...(userNotes || []).map(note => ({
      ...note,
      isShared: note.note_shares && note.note_shares.length > 0,
      userRole: 'owner'
    })),
    ...sharedNotes
  ];

  return { allNotes, userNotes: userNotes || [], sharedNotes, user };
}