// 'use client';
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useRouter } from 'next/navigation';
// import { Save, Eye, Edit3, Lock, ArrowLeft, Paperclip, X, Download, Trash2 } from 'lucide-react';

// const NoteEditor = ({ noteId }) => {
//   console.log("NoteEditor mounted with noteId:", noteId);
//   const [note, setNote] = useState(null);
//   const [title, setTitle] = useState('');
//   const [body, setBody] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [attachments, setAttachments] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [pendingFiles, setPendingFiles] = useState([]); // Files to upload after note creation
//   const router = useRouter();

//   const isNewNote = !noteId;

//   console.log("Current User:", currentUser);
//   console.log("Is New Note:", isNewNote);

//   useEffect(() => {
//     getUser();
//   }, []);

//   useEffect(() => {
//     console.log("Note ID or Current User changed:", noteId, currentUser);
    
//     if (isNewNote) {
//       setUserRole('owner');
//       setLoading(false);
//     } else if (noteId && currentUser) {
//       console.log("Fetching note and permissions for note ID:", noteId);
//       fetchNoteAndPermissions();
//       fetchAttachments();
//     }
//   }, [noteId, currentUser, isNewNote]);

//   const getUser = async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     setCurrentUser(user);
//     console.log("User set:", user?.id);
//   };

//   const fetchNoteAndPermissions = async () => {
//     try {
//       setLoading(true);
//       console.log("Fetching note:", noteId);
      
//       const { data: noteData, error: noteError } = await supabase
//         .from('notes')
//         .select('*')
//         .eq('id', noteId)
//         .single();

//       if (noteError) throw noteError;
//       if (!noteData) {
//         router.push('/notes');
//         return;
//       }

//       setNote(noteData);
//       setTitle(noteData.title || '');
//       setBody(noteData.body || '');

//       const { data: { user } } = await supabase.auth.getUser();
      
//       if (noteData.owner_id === user.id) {
//         setUserRole('owner');
//         console.log("User is owner");
//       } else {
//         const { data: share, error: shareError } = await supabase
//           .from('note_shares')
//           .select('role')
//           .eq('note_id', noteId)
//           .eq('user_id', user.id)
//           .single();

//         if (shareError || !share) {
//           router.push('/notes');
//           return;
//         }

//         setUserRole(share.role);
//         console.log("User role set to:", share.role);
//       }

//     } catch (error) {
//       console.error('Error fetching note:', error);
//       router.push('/notes');
//     } finally {
//       console.log("Finished fetching note and permissions");
//       setLoading(false);
//     }
//   };

//   const fetchAttachments = async () => {
//     if (!noteId) return;
    
//     try {
//       const { data: attachmentsData, error } = await supabase
//         .from('note_attachments')
//         .select('*')
//         .eq('note_id', noteId)
//         .order('created_at', { ascending: false });

//       if (error) throw error;


//       const attachmentsWithUrls = await Promise.all(
//         (attachmentsData || []).map(async (attachment) => {
//           const { data: signedUrl } = await supabase
//             .storage
//             .from('note-attachments')
//             .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

//           return {
//             ...attachment,
//             signedUrl: signedUrl?.signedUrl || null
//           };
//         })
//       );

//       setAttachments(attachmentsWithUrls);
//     } catch (error) {
//       console.error('Error fetching attachments:', error);
//     }
//   };

//   const handleFileUpload = async (event) => {
//     if (!canEdit()) return;

//     const files = Array.from(event.target.files);
//     if (files.length === 0) return;

   
//     if (isNewNote) {
//       setPendingFiles(prev => [...prev, ...files]);
//       event.target.value = '';
//       return;
//     }

   
//     await uploadFiles(files);
//     event.target.value = '';
//   };

//   const uploadFiles = async (files, targetNoteId = noteId) => {
//     if (!canEdit() || !targetNoteId) return;

//     setUploading(true);

//     try {
//       for (const file of files) {
//         const fileExt = file.name.split('.').pop();
//         const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
//         const filePath = `${currentUser.id}/${targetNoteId}/${fileName}`;

//         console.log("Uploading file:", file.name, "to path:", filePath);

       
//         const { error: uploadError } = await supabase.storage
//           .from('note-attachments')
//           .upload(filePath, file);

//         if (uploadError) {
//           console.error("Storage upload error:", uploadError);
//           throw uploadError;
//         }

//         const { error: dbError } = await supabase
//           .from('note_attachments')
//           .insert({
//             note_id: targetNoteId,
//             file_name: file.name,
//             file_path: filePath,
//             file_size: file.size,
//             mime_type: file.type,
//             created_by: currentUser.id
//           });

//         if (dbError) {
//           console.error("DB insert error:", dbError);
//           throw dbError;
//         }

//         console.log("File uploaded successfully:", file.name);
//       }

 
//       if (targetNoteId === noteId) {
//         await fetchAttachments();
//       }
      
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       throw error; 
//     } finally {
//       setUploading(false);
//     }
//   };

//   const uploadPendingFiles = async (newNoteId) => {
//     if (pendingFiles.length === 0) return;

//     console.log("Uploading pending files to new note:", newNoteId);
    
//     try {
//       await uploadFiles(pendingFiles, newNoteId);
//       setPendingFiles([]);
//       console.log("All pending files uploaded successfully");
//     } catch (error) {
//       console.error('Error uploading pending files:', error);
//       throw error;
//     }
//   };

//   const handleDeleteAttachment = async (attachmentId, filePath) => {
//     if (!canEdit()) return;

//     if (!confirm('Are you sure you want to delete this attachment?')) {
//       return;
//     }

//     try {
    
//       const { error } = await supabase.rpc('delete_note_attachment', {
//         attachment_id: attachmentId
//       });

//       if (error) throw error;

      
//       await fetchAttachments();
//       alert('Attachment deleted successfully!');
      
//     } catch (error) {
//       console.error('Error deleting attachment:', error);
//       alert('Failed to delete attachment: ' + error.message);
//     }
//   };

//   const removePendingFile = (index) => {
//     setPendingFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSave = async () => {
//     if (!title.trim() && !body.trim()) {
//       alert("Please add a title or content before saving.");
//       return;
//     }

//     if (!isNewNote && !canEdit()) {
//       alert("You don't have permission to edit this note.");
//       return;
//     }

//     try {
//       setSaving(true);
      
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("User not authenticated");

//       console.log("Saving note for user ID:", user.id);

//       if (isNewNote) {
        
//         const { data, error } = await supabase.rpc("insert_note_rpc", {
//           p_title: title.trim() || "Untitled Note",
//           p_body: body,
//         });

//         if (error) throw error;
        
//         console.log("Note created successfully:", data);
        
 
//         let newNoteId;
//         if (data && data.length > 0) {
//           newNoteId = data[0].id;
//         } else if (data && data.id) {
//           newNoteId = data.id;
//         } else {
        
//           const { data: latestNote, error: fetchError } = await supabase
//             .from('notes')
//             .select('id')
//             .eq('owner_id', user.id)
//             .order('created_at', { ascending: false })
//             .limit(1)
//             .single();
            
//           if (fetchError) throw new Error("Note created but could not retrieve note ID");
//           newNoteId = latestNote.id;
//         }
        
//         console.log("New note ID:", newNoteId);
        
      
//         if (pendingFiles.length > 0) {
//           console.log("Uploading", pendingFiles.length, "pending files to new note");
//           await uploadPendingFiles(newNoteId);
//         }
        
//         alert("Note created successfully!");
//         router.push('/notes');
        
//       } else {
      
//         const { error } = await supabase
//           .from('notes')
//           .update({
//             title: title,
//             body: body,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', noteId);

//         if (error) throw error;

//         await fetchNoteAndPermissions();
//         alert("Note updated successfully!");
//       }
      
//     } catch (error) {
//       console.error('Error saving note:', error);
//       alert('Failed to save note. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const canEdit = () => {
//     if (isNewNote) return true;
//     return userRole === 'owner' || userRole === 'editor';
//   };

//   const canView = () => {
//     if (isNewNote) return true;
//     return userRole === 'owner' || userRole === 'editor' || userRole === 'viewer';
//   };

//   const handleCancel = () => {
//     router.push('/notes');
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
//           <p className="text-gray-400">Loading note...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isNewNote && !canView()) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
//           <p className="text-gray-400">You don't have permission to view this note.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
    
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleCancel}
//             className="text-gray-400 hover:text-gray-300 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <h1 className="text-2xl font-bold text-white">
//             {isNewNote ? 'Create New Note' : (canEdit() ? 'Edit Note' : 'View Note')}
//           </h1>
          
//           {!isNewNote && (
//             <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//               userRole === 'owner' 
//                 ? 'bg-purple-600 text-white' 
//                 : userRole === 'editor'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-600 text-gray-300'
//             }`}>
//               {userRole === 'owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Viewer'}
//             </span>
//           )}
          
//           {isNewNote && (
//             <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white">
//               New Note
//             </span>
//           )}
//         </div>
        
//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleCancel}
//             className="bg-[#252837] hover:bg-[#2d3142] text-gray-300 px-5 py-2 rounded-lg transition-colors border border-gray-700"
//           >
//             Cancel
//           </button>
          
//           {(isNewNote || canEdit()) && (
//             <button
//               onClick={handleSave}
//               disabled={saving || uploading}
//               className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
//             >
//               {saving || uploading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   {saving && uploading ? 'Saving...' : saving ? 'Saving...' : 'Uploading...'}
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-4 h-4" />
//                   {isNewNote ? 'Create' : 'Save'}
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>

    
//       <div className="mb-6">
//         <label className="block text-gray-300 text-sm mb-2">Title</label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           disabled={!isNewNote && !canEdit()}
//           className="w-full bg-[#1a1d2e] text-white text-xl font-semibold rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           placeholder="Note title..."
//         />
//       </div>

//       <div className="mb-6">
//         <label className="block text-gray-300 text-sm mb-2">Content</label>
//         <textarea
//           value={body}
//           onChange={(e) => setBody(e.target.value)}
//           disabled={!isNewNote && !canEdit()}
//           rows={15}
//           className="w-full bg-[#1a1d2e] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
//           placeholder="Start writing your note..."
//         />
//       </div>

//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <label className="block text-gray-300 text-sm">Attachments</label>
//           {canEdit() && (
//             <div className="flex items-center gap-2">
//               <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
//                 <Paperclip className="w-4 h-4" />
//                 Add Files
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileUpload}
//                   disabled={uploading}
//                   className="hidden"
//                 />
//               </label>
//             </div>
//           )}
//         </div>

//         {uploading && (
//           <div className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 mb-4">
//             <div className="flex items-center gap-3">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
//               <p className="text-gray-300">
//                 {isNewNote ? 'Creating note and uploading files...' : 'Uploading files...'}
//               </p>
//             </div>
//           </div>
//         )}

      
//         {isNewNote && pendingFiles.length > 0 && (
//           <div className="space-y-3 mb-4">
//             <p className="text-gray-300 text-sm">Files to be attached after note creation:</p>
//             {pendingFiles.map((file, index) => (
//               <div
//                 key={index}
//                 className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-3 flex-1">
//                   <Paperclip className="w-5 h-5 text-gray-400 flex-shrink-0" />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-white font-medium truncate">
//                       {file.name}
//                     </p>
//                     <p className="text-gray-400 text-sm">
//                       {formatFileSize(file.size)} • {file.type || 'Unknown type'}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => removePendingFile(index)}
//                     className="text-red-400 hover:text-red-300 p-2 transition-colors"
//                     title="Remove file"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

  
//         {!isNewNote && attachments.length > 0 ? (
//           <div className="space-y-3">
//             {attachments.map((attachment) => (
//               <div
//                 key={attachment.id}
//                 className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-3 flex-1">
//                   <Paperclip className="w-5 h-5 text-gray-400 flex-shrink-0" />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-white font-medium truncate">
//                       {attachment.file_name}
//                     </p>
//                     <p className="text-gray-400 text-sm">
//                       {formatFileSize(attachment.file_size)} • {attachment.mime_type}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   {attachment.signedUrl && (
//                     <a
//                       href={attachment.signedUrl}
//                       download={attachment.file_name}
//                       className="text-green-400 hover:text-green-300 p-2 transition-colors"
//                       title="Download"
//                     >
//                       <Download className="w-4 h-4" />
//                     </a>
//                   )}
                  
//                   {canEdit() && (
//                     <button
//                       onClick={() => handleDeleteAttachment(attachment.id, attachment.file_path)}
//                       className="text-red-400 hover:text-red-300 p-2 transition-colors"
//                       title="Delete"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : !isNewNote && (
//           <div className="bg-[#1a1d2e] rounded-lg p-8 border border-gray-700 text-center">
//             <Paperclip className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//             <p className="text-gray-400 text-sm">
//               {canEdit() 
//                 ? 'No attachments yet. Add files to this note.' 
//                 : 'No attachments for this note.'
//               }
//             </p>
//           </div>
//         )}

       
//         {isNewNote && pendingFiles.length === 0 && (
//           <div className="bg-[#1a1d2e] rounded-lg p-8 border border-gray-700 text-center">
//             <Paperclip className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//             <p className="text-gray-400 text-sm">
//               Add files to attach to this note. They will be uploaded after the note is created.
//             </p>
//           </div>
//         )}
//       </div>

//       {!isNewNote && !canEdit() && (
//         <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
//           <div className="flex items-center gap-2 text-blue-400">
//             <Eye className="w-4 h-4" />
//             <p className="text-sm">You have view-only access to this note.</p>
//           </div>
//         </div>
//       )}

     
//       {isNewNote && (
//         <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
//           <div className="flex items-center gap-2 text-green-400">
//             <Edit3 className="w-4 h-4" />
//             <p className="text-sm">Create a new note. You will be the owner and can share it with others.</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NoteEditor;



// 'use client';
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useRouter } from 'next/navigation';
// import { Save, Eye, Edit3, Lock, ArrowLeft, Paperclip, X, Download, Trash2 } from 'lucide-react';

// const NoteEditor = ({ noteId }) => {
//   console.log("NoteEditor mounted with noteId:", noteId);
//   const [note, setNote] = useState(null);
//   const [title, setTitle] = useState('');
//   const [body, setBody] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [attachments, setAttachments] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [pendingFiles, setPendingFiles] = useState([]);
//   const router = useRouter();

//   const isNewNote = !noteId;

//   console.log("Current User:", currentUser);
//   console.log("Is New Note:", isNewNote);

//   useEffect(() => {
//     if (isNewNote) {
//       setTitle('Untitled');
//     }
//   }, [isNewNote]);

//   useEffect(() => {
//     getUser();
//   }, []);

//   useEffect(() => {
//     console.log("Note ID or Current User changed:", noteId, currentUser);
    
//     if (isNewNote) {
//       setUserRole('owner');
//       setLoading(false);
//     } else if (noteId && currentUser) {
//       console.log("Fetching note and permissions for note ID:", noteId);
//       fetchNoteAndPermissions();
//       fetchAttachments();
//     }
//   }, [noteId, currentUser, isNewNote]);

//   const getUser = async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     setCurrentUser(user);
//     console.log("User set:", user?.id);
//   };

//   const fetchNoteAndPermissions = async () => {
//     try {
//       setLoading(true);
//       console.log("Fetching note:", noteId);
      
//       const { data: noteData, error: noteError } = await supabase
//         .from('notes')
//         .select('*')
//         .eq('id', noteId)
//         .single();

//       if (noteError) throw noteError;
//       if (!noteData) {
//         router.push('/notes');
//         return;
//       }

//       setNote(noteData);
//       setTitle(noteData.title || 'Untitled');
//       setBody(noteData.body || '');

//       const { data: { user } } = await supabase.auth.getUser();
      
//       if (noteData.owner_id === user.id) {
//         setUserRole('owner');
//         console.log("User is owner");
//       } else {
//         const { data: share, error: shareError } = await supabase
//           .from('note_shares')
//           .select('role')
//           .eq('note_id', noteId)
//           .eq('user_id', user.id)
//           .single();

//         if (shareError || !share) {
//           router.push('/notes');
//           return;
//         }

//         setUserRole(share.role);
//         console.log("User role set to:", share.role);
//       }

//     } catch (error) {
//       console.error('Error fetching note:', error);
//       router.push('/notes');
//     } finally {
//       console.log("Finished fetching note and permissions");
//       setLoading(false);
//     }
//   };

//   const fetchAttachments = async () => {
//     if (!noteId) return;
    
//     try {
//       const { data: attachmentsData, error } = await supabase
//         .from('note_attachments')
//         .select('*')
//         .eq('note_id', noteId)
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       const attachmentsWithUrls = await Promise.all(
//         (attachmentsData || []).map(async (attachment) => {
//           const { data: signedUrl } = await supabase
//             .storage
//             .from('note-attachments')
//             .createSignedUrl(attachment.file_path, 3600);

//           return {
//             ...attachment,
//             signedUrl: signedUrl?.signedUrl || null
//           };
//         })
//       );

//       setAttachments(attachmentsWithUrls);
//     } catch (error) {
//       console.error('Error fetching attachments:', error);
//     }
//   };

//   const handleFileUpload = async (event) => {
//     if (!canEdit()) return;

//     const files = Array.from(event.target.files);
//     if (files.length === 0) return;

//     if (isNewNote) {
//       setPendingFiles(prev => [...prev, ...files]);
//       event.target.value = '';
//       return;
//     }

//     await uploadFiles(files);
//     event.target.value = '';
//   };

//   const uploadFiles = async (files, targetNoteId = noteId) => {
//     if (!canEdit() || !targetNoteId) return;

//     setUploading(true);

//     try {
//       for (const file of files) {
//         const fileExt = file.name.split('.').pop();
//         const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
//         const filePath = `${currentUser.id}/${targetNoteId}/${fileName}`;

//         console.log("Uploading file:", file.name, "to path:", filePath);

//         const { error: uploadError } = await supabase.storage
//           .from('note-attachments')
//           .upload(filePath, file);

//         if (uploadError) {
//           console.error("Storage upload error:", uploadError);
//           throw uploadError;
//         }

//         const { error: dbError } = await supabase
//           .from('note_attachments')
//           .insert({
//             note_id: targetNoteId,
//             file_name: file.name,
//             file_path: filePath,
//             file_size: file.size,
//             mime_type: file.type,
//             created_by: currentUser.id
//           });

//         if (dbError) {
//           console.error("DB insert error:", dbError);
//           throw dbError;
//         }

//         console.log("File uploaded successfully:", file.name);
//       }

//       if (targetNoteId === noteId) {
//         await fetchAttachments();
//       }
      
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       throw error; 
//     } finally {
//       setUploading(false);
//     }
//   };

//   const uploadPendingFiles = async (newNoteId) => {
//     if (pendingFiles.length === 0) return;

//     console.log("Uploading pending files to new note:", newNoteId);
    
//     try {
//       await uploadFiles(pendingFiles, newNoteId);
//       setPendingFiles([]);
//       console.log("All pending files uploaded successfully");
//     } catch (error) {
//       console.error('Error uploading pending files:', error);
//       throw error;
//     }
//   };

//   const handleDeleteAttachment = async (attachmentId, filePath) => {
//     if (!canEdit()) return;

//     if (!confirm('Are you sure you want to delete this attachment?')) {
//       return;
//     }

//     try {
//       const { error } = await supabase.rpc('delete_note_attachment', {
//         attachment_id: attachmentId
//       });

//       if (error) throw error;

//       await fetchAttachments();
//       alert('Attachment deleted successfully!');
      
//     } catch (error) {
//       console.error('Error deleting attachment:', error);
//       alert('Failed to delete attachment: ' + error.message);
//     }
//   };

//   const removePendingFile = (index) => {
//     setPendingFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSave = async () => {
//     if (!title.trim() && !body.trim()) {
//       alert("Please add a title or content before saving.");
//       return;
//     }

//     if (!isNewNote && !canEdit()) {
//       alert("You don't have permission to edit this note.");
//       return;
//     }

//     try {
//       setSaving(true);
      
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("User not authenticated");

//       console.log("Saving note for user ID:", user.id);

//       if (isNewNote) {
//         const { data, error } = await supabase.rpc("insert_note_rpc", {
//           p_title: title.trim() || "Untitled Note",
//           p_body: body,
//         });

//         if (error) throw error;
        
//         console.log("Note created successfully:", data);
        
//         let newNoteId;
//         if (data && data.length > 0) {
//           newNoteId = data[0].id;
//         } else if (data && data.id) {
//           newNoteId = data.id;
//         } else {
//           const { data: latestNote, error: fetchError } = await supabase
//             .from('notes')
//             .select('id')
//             .eq('owner_id', user.id)
//             .order('created_at', { ascending: false })
//             .limit(1)
//             .single();
            
//           if (fetchError) throw new Error("Note created but could not retrieve note ID");
//           newNoteId = latestNote.id;
//         }
        
//         console.log("New note ID:", newNoteId);
        
//         if (pendingFiles.length > 0) {
//           console.log("Uploading", pendingFiles.length, "pending files to new note");
//           await uploadPendingFiles(newNoteId);
//         }
        
//         alert("Note created successfully!");
//         router.push('/notes');
        
//       } else {
//         const { error } = await supabase
//           .from('notes')
//           .update({
//             title: title,
//             body: body,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', noteId);

//         if (error) throw error;

//         await fetchNoteAndPermissions();
//         alert("Note updated successfully!");
//       }
      
//     } catch (error) {
//       console.error('Error saving note:', error);
//       alert('Failed to save note. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const canEdit = () => {
//     if (isNewNote) return true;
//     return userRole === 'owner' || userRole === 'editor';
//   };

//   const canView = () => {
//     if (isNewNote) return true;
//     return userRole === 'owner' || userRole === 'editor' || userRole === 'viewer';
//   };

//   const handleCancel = () => {
//     router.push('/notes');
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
//           <p className="text-gray-400">Loading note...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isNewNote && !canView()) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
//           <p className="text-gray-400">You don't have permission to view this note.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full flex flex-col bg-[#1a1b23] overflow-hidden">
//       {/* Fixed Header */}
//       <div className="flex-shrink-0 border-b border-gray-800 bg-[#1a1b23]">
//         <div className="max-w-4xl mx-auto w-full p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleCancel}
//                 className="text-gray-400 hover:text-gray-300 transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
//               <h1 className="text-2xl font-bold text-white">
//                 {isNewNote ? 'Create New Note' : (canEdit() ? 'Edit Note' : 'View Note')}
//               </h1>
              
//               {!isNewNote && (
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                   userRole === 'owner' 
//                     ? 'bg-purple-600 text-white' 
//                     : userRole === 'editor'
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-600 text-gray-300'
//                 }`}>
//                   {userRole === 'owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Viewer'}
//                 </span>
//               )}
              
//               {isNewNote && (
//                 <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white">
//                   New Note
//                 </span>
//               )}
//             </div>
            
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleCancel}
//                 className="bg-[#252837] hover:bg-[#2d3142] text-gray-300 px-5 py-2 rounded-lg transition-colors border border-gray-700"
//               >
//                 Cancel
//               </button>
              
//               {(isNewNote || canEdit()) && (
//                 <button
//                   onClick={handleSave}
//                   disabled={saving || uploading}
//                   className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
//                 >
//                   {saving || uploading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       {saving && uploading ? 'Saving...' : saving ? 'Saving...' : 'Uploading...'}
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4" />
//                       {isNewNote ? 'Create' : 'Save'}
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Scrollable Content Area */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="max-w-4xl mx-auto w-full p-6">
//           {/* Title Input */}
//           <div className="mb-6">
//             <label className="block text-gray-300 text-sm mb-2">Title</label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               disabled={!isNewNote && !canEdit()}
//               className="w-full bg-[#1a1d2e] text-white text-xl font-semibold rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
//               placeholder="Note title..."
//             />
//           </div>

//           {/* Content Textarea */}
//           <div className="mb-6">
//             <label className="block text-gray-300 text-sm mb-2">Content</label>
//             <textarea
//               value={body}
//               onChange={(e) => setBody(e.target.value)}
//               disabled={!isNewNote && !canEdit()}
//               rows={15}
//               className="w-full bg-[#1a1d2e] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
//               placeholder="Start writing your note..."
//             />
//           </div>

//           {/* Attachments Section */}
//           <div className="mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <label className="block text-gray-300 text-sm">Attachments</label>
//               {canEdit() && (
//                 <div className="flex items-center gap-2">
//                   <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
//                     <Paperclip className="w-4 h-4" />
//                     Add Files
//                     <input
//                       type="file"
//                       multiple
//                       onChange={handleFileUpload}
//                       disabled={uploading}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//               )}
//             </div>

//             {uploading && (
//               <div className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
//                   <p className="text-gray-300">
//                     {isNewNote ? 'Creating note and uploading files...' : 'Uploading files...'}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {isNewNote && pendingFiles.length > 0 && (
//               <div className="space-y-3 mb-4">
//                 <p className="text-gray-300 text-sm">Files to be attached after note creation:</p>
//                 {pendingFiles.map((file, index) => (
//                   <div
//                     key={index}
//                     className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 flex items-center justify-between"
//                   >
//                     <div className="flex items-center gap-3 flex-1">
//                       <Paperclip className="w-5 h-5 text-gray-400 flex-shrink-0" />
//                       <div className="flex-1 min-w-0">
//                         <p className="text-white font-medium truncate">
//                           {file.name}
//                         </p>
//                         <p className="text-gray-400 text-sm">
//                           {formatFileSize(file.size)} • {file.type || 'Unknown type'}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => removePendingFile(index)}
//                         className="text-red-400 hover:text-red-300 p-2 transition-colors"
//                         title="Remove file"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {!isNewNote && attachments.length > 0 ? (
//               <div className="space-y-3">
//                 {attachments.map((attachment) => (
//                   <div
//                     key={attachment.id}
//                     className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 flex items-center justify-between"
//                   >
//                     <div className="flex items-center gap-3 flex-1">
//                       <Paperclip className="w-5 h-5 text-gray-400 flex-shrink-0" />
//                       <div className="flex-1 min-w-0">
//                         <p className="text-white font-medium truncate">
//                           {attachment.file_name}
//                         </p>
//                         <p className="text-gray-400 text-sm">
//                           {formatFileSize(attachment.file_size)} • {attachment.mime_type}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                       {attachment.signedUrl && (
//                         <a
//                           href={attachment.signedUrl}
//                           download={attachment.file_name}
//                           className="text-green-400 hover:text-green-300 p-2 transition-colors"
//                           title="Download"
//                         >
//                           <Download className="w-4 h-4" />
//                         </a>
//                       )}
                      
//                       {canEdit() && (
//                         <button
//                           onClick={() => handleDeleteAttachment(attachment.id, attachment.file_path)}
//                           className="text-red-400 hover:text-red-300 p-2 transition-colors"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : !isNewNote && (
//               <div className="bg-[#1a1d2e] rounded-lg p-8 border border-gray-700 text-center">
//                 <Paperclip className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//                 <p className="text-gray-400 text-sm">
//                   {canEdit() 
//                     ? 'No attachments yet. Add files to this note.' 
//                     : 'No attachments for this note.'
//                   }
//                 </p>
//               </div>
//             )}

//             {isNewNote && pendingFiles.length === 0 && (
//               <div className="bg-[#1a1d2e] rounded-lg p-8 border border-gray-700 text-center">
//                 <Paperclip className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//                 <p className="text-gray-400 text-sm">
//                   Add files to attach to this note. They will be uploaded after the note is created.
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Info Messages */}
//           {!isNewNote && !canEdit() && (
//             <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
//               <div className="flex items-center gap-2 text-blue-400">
//                 <Eye className="w-4 h-4" />
//                 <p className="text-sm">You have view-only access to this note.</p>
//               </div>
//             </div>
//           )}

//           {isNewNote && (
//             <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
//               <div className="flex items-center gap-2 text-green-400">
//                 <Edit3 className="w-4 h-4" />
//                 <p className="text-sm">Create a new note. You will be the owner and can share it with others.</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NoteEditor;



'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, Eye, Edit3, Lock, ArrowLeft, Paperclip, X, Download, Trash2 } from 'lucide-react';

const NoteEditor = ({ noteId }) => {
  console.log("NoteEditor mounted with noteId:", noteId);
  
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const router = useRouter();

  const isNewNote = !noteId;

  console.log("Current User:", currentUser);
  console.log("Is New Note:", isNewNote);

  useEffect(() => {
    if (isNewNote) {
      setTitle('Untitled');
    }
  }, [isNewNote]);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    console.log("Note ID or Current User changed:", noteId, currentUser);
    if (isNewNote) {
      setUserRole('owner');
      setLoading(false);
    } else if (noteId && currentUser) {
      console.log("Fetching note and permissions for note ID:", noteId);
      fetchNoteAndPermissions();
      fetchAttachments();
    }
  }, [noteId, currentUser, isNewNote]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    console.log("User set:", user?.id);
  };

  const fetchNoteAndPermissions = async () => {
    try {
      setLoading(true);
      console.log("Fetching note:", noteId);
      
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (noteError) throw noteError;

      if (!noteData) {
        router.push('/notes');
        return;
      }

      setNote(noteData);
      setTitle(noteData.title || 'Untitled');
      setBody(noteData.body || '');

      const { data: { user } } = await supabase.auth.getUser();

      if (noteData.owner_id === user.id) {
        setUserRole('owner');
        console.log("User is owner");
      } else {
        const { data: share, error: shareError } = await supabase
          .from('note_shares')
          .select('role')
          .eq('note_id', noteId)
          .eq('user_id', user.id)
          .single();

        if (shareError || !share) {
          router.push('/notes');
          return;
        }

        setUserRole(share.role);
        console.log("User role set to:", share.role);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      router.push('/notes');
    } finally {
      console.log("Finished fetching note and permissions");
      setLoading(false);
    }
  };

  const fetchAttachments = async () => {
    if (!noteId) return;

    try {
      const { data: attachmentsData, error } = await supabase
        .from('note_attachments')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const attachmentsWithUrls = await Promise.all(
        (attachmentsData || []).map(async (attachment) => {
          const { data: signedUrl } = await supabase
            .storage
            .from('note-attachments')
            .createSignedUrl(attachment.file_path, 3600);

          return {
            ...attachment,
            signedUrl: signedUrl?.signedUrl || null
          };
        })
      );

      setAttachments(attachmentsWithUrls);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleFileUpload = async (event) => {
    if (!canEdit()) return;

    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (isNewNote) {
      setPendingFiles(prev => [...prev, ...files]);
      event.target.value = '';
      return;
    }

    await uploadFiles(files);
    event.target.value = '';
  };

  const uploadFiles = async (files, targetNoteId = noteId) => {
    if (!canEdit() || !targetNoteId) return;

    setUploading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${currentUser.id}/${targetNoteId}/${fileName}`;

        console.log("Uploading file:", file.name, "to path:", filePath);

        const { error: uploadError } = await supabase.storage
          .from('note-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw uploadError;
        }

        const { error: dbError } = await supabase
          .from('note_attachments')
          .insert({
            note_id: targetNoteId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            created_by: currentUser.id
          });

        if (dbError) {
          console.error("DB insert error:", dbError);
          throw dbError;
        }

        console.log("File uploaded successfully:", file.name);
      }

      if (targetNoteId === noteId) {
        await fetchAttachments();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadPendingFiles = async (newNoteId) => {
    if (pendingFiles.length === 0) return;

    console.log("Uploading pending files to new note:", newNoteId);

    try {
      await uploadFiles(pendingFiles, newNoteId);
      setPendingFiles([]);
      console.log("All pending files uploaded successfully");
    } catch (error) {
      console.error('Error uploading pending files:', error);
      throw error;
    }
  };

  const handleDeleteAttachment = async (attachmentId, filePath) => {
    if (!canEdit()) return;

    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_note_attachment', {
        attachment_id: attachmentId
      });

      if (error) throw error;

      await fetchAttachments();
      alert('Attachment deleted successfully!');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Failed to delete attachment: ' + error.message);
    }
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      alert("Please add a title or content before saving.");
      return;
    }

    if (!isNewNote && !canEdit()) {
      alert("You don't have permission to edit this note.");
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      console.log("Saving note for user ID:", user.id);

      if (isNewNote) {
        const { data, error } = await supabase.rpc("insert_note_rpc", {
          p_title: title.trim() || "Untitled Note",
          p_body: body,
        });

        if (error) throw error;

        console.log("Note created successfully:", data);

        let newNoteId;
        if (data && data.length > 0) {
          newNoteId = data[0].id;
        } else if (data && data.id) {
          newNoteId = data.id;
        } else {
          const { data: latestNote, error: fetchError } = await supabase
            .from('notes')
            .select('id')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (fetchError) throw new Error("Note created but could not retrieve note ID");

          newNoteId = latestNote.id;
        }

        console.log("New note ID:", newNoteId);

        if (pendingFiles.length > 0) {
          console.log("Uploading", pendingFiles.length, "pending files to new note");
          await uploadPendingFiles(newNoteId);
        }

        alert("Note created successfully!");
        router.push('/notes');
      } else {
        const { error } = await supabase
          .from('notes')
          .update({
            title: title,
            body: body,
            updated_at: new Date().toISOString()
          })
          .eq('id', noteId);

        if (error) throw error;

        await fetchNoteAndPermissions();
        alert("Note updated successfully!");
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = () => {
    if (isNewNote) return true;
    return userRole === 'owner' || userRole === 'editor';
  };

  const canView = () => {
    if (isNewNote) return true;
    return userRole === 'owner' || userRole === 'editor' || userRole === 'viewer';
  };

  const handleCancel = () => {
    router.push('/notes');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1b23]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!isNewNote && !canView()) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1b23]">
        <div className="text-center max-w-md bg-[#252837] p-8 rounded-xl border border-gray-700">
          <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to view this note.</p>
          <button
            onClick={handleCancel}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1b23]">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-[#252837] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              {isNewNote ? 'Create New Note' : (canEdit() ? 'Edit Note' : 'View Note')}
            </h1>
            {!isNewNote && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                userRole === 'owner' 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : userRole === 'editor' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {userRole === 'owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Viewer'}
              </span>
            )}
            {isNewNote && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                New Note
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
            {(isNewNote || canEdit()) && (
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving || uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {saving && uploading ? 'Saving...' : saving ? 'Saving...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isNewNote ? 'Create' : 'Save'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isNewNote && !canEdit()}
              className="w-full bg-[#1a1d2e] text-white text-xl font-semibold rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Note title..."
            />
          </div>

          {/* Content Textarea */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm mb-2">Content</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={!isNewNote && !canEdit()}
              rows={15}
              className="w-full bg-[#1a1d2e] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-700 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Start writing your note..."
            />
          </div>

          {/* Attachments Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-gray-300 text-sm">Attachments</label>
              {canEdit() && (
                <div className="flex items-center gap-2">
                  <label className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
                    <Paperclip className="w-4 h-4" />
                    Add Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {uploading && (
              <div className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 mb-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
                  <p className="text-gray-300">
                    {isNewNote ? 'Creating note and uploading files...' : 'Uploading files...'}
                  </p>
                </div>
              </div>
            )}

            {isNewNote && pendingFiles.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-gray-300 text-sm">Files to be attached after note creation:</p>
                {pendingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Paperclip className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removePendingFile(index)}
                        className="text-red-400 hover:text-red-300 p-2 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isNewNote && attachments.length > 0 ? (
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="bg-[#1a1d2e] rounded-lg p-4 border border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Paperclip className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {attachment.file_name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatFileSize(attachment.file_size)} • {attachment.mime_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attachment.signedUrl && (
                        <a
                          href={attachment.signedUrl}
                          download={attachment.file_name}
                          className="text-green-400 hover:text-green-300 p-2 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {canEdit() && (
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id, attachment.file_path)}
                          className="text-red-400 hover:text-red-300 p-2 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !isNewNote && (
              <div className="bg-[#1a1d2e] rounded-lg p-8 border border-gray-700 text-center">
                <Paperclip className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  {canEdit()
                    ? 'No attachments yet. Add files to this note.'
                    : 'No attachments for this note.'
                  }
                </p>
              </div>
            )}

            {isNewNote && pendingFiles.length === 0 && (
              <div className="bg-[#1a1d2e] rounded-lg p-8 border border-gray-700 text-center">
                <Paperclip className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Add files to attach to this note. They will be uploaded after the note is created.
                </p>
              </div>
            )}
          </div>

          {/* Info Messages */}
          {!isNewNote && !canEdit() && (
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400">
                <Eye className="w-4 h-4" />
                <p className="text-sm">You have view-only access to this note.</p>
              </div>
            </div>
          )}

          {isNewNote && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <Edit3 className="w-4 h-4" />
                <p className="text-sm">Create a new note. You will be the owner and can share it with others.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;