
"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  Save,
  Eye,
  Edit3,
  Lock,
  ArrowLeft,
  Paperclip,
  X,
  Download,
  Trash2,
} from "lucide-react";

const NoteEditorSkeleton = () => {
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-shrink-0 border-b border-[#E0E0E0] bg-white">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-[#E0E0E0] rounded animate-pulse"></div>
              <div className="h-6 bg-[#E0E0E0] rounded w-48 animate-pulse"></div>
              <div className="h-6 bg-[#E0E0E0] rounded w-20 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 bg-[#E0E0E0] rounded w-20 animate-pulse"></div>
              <div className="h-10 bg-[#E0E0E0] rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="mb-6">
            <div className="h-12 bg-[#E0E0E0] rounded animate-pulse"></div>
          </div>

          <div className="mb-6">
            <div className="space-y-3">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="h-4 bg-[#E0E0E0] rounded animate-pulse"
                  style={{
                    width: i % 3 === 0 ? "100%" : i % 3 === 1 ? "80%" : "60%",
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-[#E0E0E0] rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-[#E0E0E0] rounded w-32 animate-pulse"></div>
            </div>
            <div className="bg-[#F5F5F5] rounded p-8 border border-[#E0E0E0] text-center">
              <div className="w-12 h-12 bg-[#E0E0E0] rounded-full mx-auto mb-3 animate-pulse"></div>
              <div className="h-4 bg-[#E0E0E0] rounded w-64 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CursorIndicator = ({ email, color, position, textareaRef }) => {
  const [coordinates, setCoordinates] = useState({ top: 0, left: 0 });

  console.log("🎯 CursorIndicator render:", {
    email,
    color,
    position,
    hasTextarea: !!textareaRef.current,
  });

  useEffect(() => {
    if (!textareaRef.current) {
      console.log("⚠️ No textarea ref available");
      return;
    }

    console.log(
      "📍 Calculating position for:",
      email,
      "at position:",
      position
    );

    const textarea = textareaRef.current;
    const textBeforeCursor = textarea.value.substring(0, position);

    const mirror = document.createElement("div");
    const styles = window.getComputedStyle(textarea);

    [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
      "lineHeight",
      "padding",
      "border",
      "width",
      "wordWrap",
      "whiteSpace",
      "overflowWrap",
    ].forEach((prop) => {
      mirror.style[prop] = styles[prop];
    });

    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.top = "0";
    mirror.style.left = "0";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";

    mirror.textContent = textBeforeCursor;

    const cursorSpan = document.createElement("span");
    cursorSpan.textContent = "|";
    mirror.appendChild(cursorSpan);

    document.body.appendChild(mirror);

    const textareaRect = textarea.getBoundingClientRect();
    const cursorRect = cursorSpan.getBoundingClientRect();

    const calculatedCoords = {
      top: cursorRect.top - textareaRect.top + textarea.scrollTop,
      left: cursorRect.left - textareaRect.left,
    };

    console.log("✅ Calculated coordinates:", calculatedCoords, "for", email);
    setCoordinates(calculatedCoords);

    document.body.removeChild(mirror);
  }, [position, textareaRef, email]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${coordinates.top}px`,
        left: `${coordinates.left}px`,
        pointerEvents: "none",
        zIndex: 1000,
        transition: "all 0.1s ease-out",
      }}
    >
      <div
        style={{
          width: "2px",
          height: "20px",
          backgroundColor: color,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-24px",
            left: "4px",
            backgroundColor: color,
            color: "white",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "11px",
            whiteSpace: "nowrap",
            fontWeight: "500",
          }}
        >
          {email.split("@")[0]}
        </div>
      </div>
    </div>
  );
};

const NoteEditor = ({ noteId }) => {
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  console.log("Current User:", currentUser);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const [activeCursors, setActiveCursors] = useState({});
  const [cursorColors] = useState(() => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    return colors;
  });

  const getUserColor = (userId) => {
    const colors = cursorColors;
    const index =
      parseInt(userId.replace(/[^0-9]/g, "").slice(-2)) % colors.length;
    return colors[index];
  };
  const bodyRef = useRef(null);
  const cursorUpdateTimeout = useRef(null);
  const realtimeChannel = useRef(null);

  const router = useRouter();

  const isNewNote = !noteId;

  useEffect(() => {
    if (isNewNote) {
      setTitle("Untitled");
      setLoading(false);
    }
  }, [isNewNote]);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (isNewNote) {
      setUserRole("owner");
    } else if (noteId && currentUser) {
      fetchNoteAndPermissions();
      fetchAttachments();
    } else if (noteId && !currentUser) {
      setLoading(true);
    }
  }, [noteId, currentUser, isNewNote]);

  useEffect(() => {
    console.log("🖋️ Setting up cursor tracking...", {
      isNewNote,
      noteId,
      hasCurrentUser: !!currentUser,
      userRole,
    });

    if (isNewNote) {
      console.log("⏭️ Skipping - is new note");
      return;
    }

    if (!noteId) {
      console.log("⏭️ Skipping - no noteId");
      return;
    }

    if (!currentUser) {
      console.log("⏭️ Skipping - no currentUser yet");
      return;
    }

    if (!userRole) {
      console.log("⏭️ Skipping - no userRole yet");
      return;
    }

    if (userRole !== "owner" && userRole !== "editor") {
      console.log(
        "⏭️ User cannot edit, skipping cursor setup. Role:",
        userRole
      );
      return;
    }

    console.log(
      "✅ All requirements met! Setting up cursor tracking for note:",
      noteId
    );

    realtimeChannel.current = supabase
      .channel(`note-cursors-${noteId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cursor_positions",
          filter: `note_id=eq.${noteId}`,
        },
        (payload) => {
          console.log("📡 Received cursor update:", {
            eventType: payload.eventType,
            userId: payload.new?.user_id || payload.old?.user_id,
            email: payload.new?.user_email || payload.old?.user_email,
            position: payload.new?.cursor_position,
            currentUserId: currentUser.id,
          });

          if (payload.eventType === "DELETE") {
            console.log("🗑️ Removing cursor for user:", payload.old.user_id);
            setActiveCursors((prev) => {
              const updated = { ...prev };
              delete updated[payload.old.user_id];
              console.log("Updated cursors after delete:", updated);
              return updated;
            });
          } else {
            const cursorData = payload.new;

            if (cursorData.user_id === currentUser.id) {
              console.log("⏭️ Skipping own cursor");
              return;
            }

            console.log(
              "✅ Adding/updating cursor for user:",
              cursorData.user_email,
              "at position:",
              cursorData.cursor_position
            );

            setActiveCursors((prev) => {
              const updated = {
                ...prev,
                [cursorData.user_id]: {
                  email: cursorData.user_email,
                  position: cursorData.cursor_position,
                  lastUpdate: Date.now(),
                },
              };
              console.log("Updated cursors after insert/update:", updated);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("📻 Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to cursor updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Channel error - realtime updates may not work");
        }
      });

    const fetchExistingCursors = async () => {
      console.log("🔍 Fetching existing cursors for note:", noteId);

      const { data, error } = await supabase
        .from("cursor_positions")
        .select("*")
        .eq("note_id", noteId)
        .neq("user_id", currentUser.id);

      if (error) {
        console.error("❌ Error fetching existing cursors:", error);
        return;
      }

      if (data && data.length > 0) {
        console.log("📍 Found existing cursors:", data);
        const cursorsMap = {};
        data.forEach((cursor) => {
          cursorsMap[cursor.user_id] = {
            email: cursor.user_email,
            position: cursor.cursor_position,
            lastUpdate: Date.now(),
          };
        });
        setActiveCursors(cursorsMap);
      } else {
        console.log("👤 No other users editing this note yet");
      }
    };

    fetchExistingCursors();

    const cleanupInterval = setInterval(cleanupStaleCursors, 5000);

    return () => {
      console.log("🧹 Cleaning up cursor tracking");
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
      clearInterval(cleanupInterval);
      removeCursorPosition();
    };
  }, [noteId, currentUser, isNewNote, userRole]);

  // Add this useEffect after your cursor tracking useEffect
  useEffect(() => {
    console.log("👥 Active cursors updated:", activeCursors);
    console.log(
      "📊 Number of active cursors:",
      Object.keys(activeCursors).length
    );
  }, [activeCursors]);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (isNewNote) {
      setLoading(false);
    }
  };

  const fetchNoteAndPermissions = async () => {
    try {
      setLoading(true);

      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();

      if (noteError) throw noteError;
      if (!noteData) {
        router.push("/notes");
        return;
      }

      setNote(noteData);
      setTitle(noteData.title || "Untitled");
      setBody(noteData.body || "");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (noteData.owner_id === user.id) {
        setUserRole("owner");
      } else {
        const { data: share, error: shareError } = await supabase
          .from("note_shares")
          .select("role")
          .eq("note_id", noteId)
          .eq("user_id", user.id)
          .single();

        if (shareError || !share) {
          router.push("/notes");
          return;
        }

        setUserRole(share.role);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      router.push("/notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttachments = async () => {
    if (!noteId) return;

    try {
      const { data: attachmentsData, error } = await supabase
        .from("note_attachments")
        .select("*")
        .eq("note_id", noteId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const attachmentsWithUrls = await Promise.all(
        (attachmentsData || []).map(async (attachment) => {
          const { data: signedUrl } = await supabase.storage
            .from("note-attachments")
            .createSignedUrl(attachment.file_path, 3600);

          return {
            ...attachment,
            signedUrl: signedUrl?.signedUrl || null,
          };
        })
      );

      setAttachments(attachmentsWithUrls);
    } catch (error) {
      console.error("Error fetching attachments:", error);
    }
  };

  const handleFileUpload = async (event) => {
    if (!canEdit()) return;

    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (isNewNote) {
      setPendingFiles((prev) => [...prev, ...files]);
      event.target.value = "";
      return;
    }

    await uploadFiles(files);
    event.target.value = "";
  };

  const uploadFiles = async (files, targetNoteId = noteId) => {
    if (!canEdit() || !targetNoteId) return;

    setUploading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `${currentUser.id}/${targetNoteId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("note-attachments")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { error: dbError } = await supabase
          .from("note_attachments")
          .insert({
            note_id: targetNoteId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            created_by: currentUser.id,
          });

        if (dbError) {
          throw dbError;
        }
      }

      if (targetNoteId === noteId) {
        await fetchAttachments();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadPendingFiles = async (newNoteId) => {
    if (pendingFiles.length === 0) return;

    try {
      await uploadFiles(pendingFiles, newNoteId);
      setPendingFiles([]);
    } catch (error) {
      console.error("Error uploading pending files:", error);
      throw error;
    }
  };

  const handleDeleteAttachment = async (attachmentId, filePath) => {
    if (!canEdit()) return;

    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      const { error } = await supabase.rpc("delete_note_attachment", {
        attachment_id: attachmentId,
      });

      if (error) throw error;

      await fetchAttachments();
      alert("Attachment deleted successfully!");
    } catch (error) {
      console.error("Error deleting attachment:", error);
      alert("Failed to delete attachment: " + error.message);
    }
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const cleanupStaleCursors = () => {
    const now = Date.now();
    setActiveCursors((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((userId) => {
        if (now - updated[userId].lastUpdate > 10000) {
          delete updated[userId];
        }
      });
      return updated;
    });
  };

  const updateCursorPosition = async (position) => {
    if (!noteId || !currentUser || !canEdit()) return;

    console.log(
      "⬆️ Updating cursor position:",
      position,
      "for user:",
      currentUser.email
    );

    try {
      const { data, error } = await supabase
        .from("cursor_positions")
        .upsert(
          {
            note_id: noteId,
            user_id: currentUser.id,
            user_email: currentUser.email,
            cursor_position: position,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "note_id,user_id",
          }
        )
        .select();

      if (error) {
        console.error("❌ Error updating cursor:", error);
      } else {
        console.log("✅ Cursor updated successfully:", data);
      }
    } catch (error) {
      console.error("❌ Exception updating cursor position:", error);
    }
  };

  const handleCursorChange = (e) => {
    if (!canEdit() || isNewNote) return;

    const position = e.target.selectionStart;

    // Immediately update for the first cursor placement
    if (!cursorUpdateTimeout.current) {
      updateCursorPosition(position);
    }

    // Clear previous timeout
    if (cursorUpdateTimeout.current) {
      clearTimeout(cursorUpdateTimeout.current);
    }

    // Debounce subsequent updates
    cursorUpdateTimeout.current = setTimeout(() => {
      updateCursorPosition(position);
      cursorUpdateTimeout.current = null; // Reset after update
    }, 200);
  };

  const removeCursorPosition = async () => {
    if (!noteId || !currentUser) return;

    try {
      await supabase
        .from("cursor_positions")
        .delete()
        .eq("note_id", noteId)
        .eq("user_id", currentUser.id);
    } catch (error) {
      console.error("Error removing cursor position:", error);
    }
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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (isNewNote) {
        const { data, error } = await supabase.rpc("insert_note_rpc", {
          p_title: title.trim() || "Untitled Note",
          p_body: body,
        });

        if (error) throw error;

        let newNoteId;
        if (data && data.length > 0) {
          newNoteId = data[0].id;
        } else if (data && data.id) {
          newNoteId = data.id;
        } else {
          const { data: latestNote, error: fetchError } = await supabase
            .from("notes")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (fetchError)
            throw new Error("Note created but could not retrieve note ID");
          newNoteId = latestNote.id;
        }

        if (pendingFiles.length > 0) {
          await uploadPendingFiles(newNoteId);
        }

        alert("Note created successfully!");
        router.push("/notes");
      } else {
        const { error } = await supabase
          .from("notes")
          .update({
            title: title,
            body: body,
            updated_at: new Date().toISOString(),
          })
          .eq("id", noteId);

        if (error) throw error;

        await fetchNoteAndPermissions();
        alert("Note updated successfully!");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canEdit = () => {
    if (isNewNote) return true;
    return userRole === "owner" || userRole === "editor";
  };

  const canView = () => {
    if (isNewNote) return true;
    return (
      userRole === "owner" || userRole === "editor" || userRole === "viewer"
    );
  };

  const handleCancel = () => {
    router.push("/notes");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return <NoteEditorSkeleton />;
  }

  if (!isNewNote && !canView()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="w-12 h-12 text-[#999999] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#2E2E2E] mb-2">
            Access Denied
          </h3>
          <p className="text-[#666666]">
            You don't have permission to view this note.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-shrink-0 border-b border-[#E0E0E0] bg-white">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="text-[#666666] hover:text-[#2E2E2E] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-medium text-[#2E2E2E]">
                {isNewNote
                  ? "Create New Note"
                  : canEdit()
                  ? "Edit Note"
                  : "View Note"}
              </h1>

              {!isNewNote && (
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    userRole === "owner"
                      ? "bg-[#B22222] text-white"
                      : userRole === "editor"
                      ? "bg-[#4A90E2] text-white"
                      : "bg-[#999999] text-white"
                  }`}
                >
                  {userRole === "owner"
                    ? "Owner"
                    : userRole === "editor"
                    ? "Editor"
                    : "Viewer"}
                </span>
              )}

              {isNewNote && (
                <span className="px-3 py-1 rounded text-xs font-medium bg-[#50C878] text-white">
                  New Note
                </span>
              )}

              {!isNewNote && Object.keys(activeCursors).length > 0 && (
                <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-[#E8F5E9] rounded">
                  <div className="flex -space-x-2">
                    {Object.entries(activeCursors)
                      .slice(0, 3)
                      .map(([userId, data]) => (
                        <div
                          key={userId}
                          className="w-6 h-6 rounded-full bg-[#50C878] border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                          title={data.email}
                        >
                          {data.email.charAt(0).toUpperCase()}
                        </div>
                      ))}
                  </div>
                  <span className="text-xs text-[#388E3C] font-medium">
                    {Object.keys(activeCursors).length} editing
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="bg-white hover:bg-[#F5F5F5] text-[#666666] px-5 py-2 rounded transition-colors border border-[#E0E0E0]"
              >
                Cancel
              </button>

              {(isNewNote || canEdit()) && (
                <button
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="bg-[#B22222] hover:bg-[#8B0000] disabled:bg-[#999999] text-white px-6 py-2 rounded flex items-center gap-2 transition-colors"
                >
                  {saving || uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {saving && uploading
                        ? "Saving..."
                        : saving
                        ? "Saving..."
                        : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isNewNote ? "Create" : "Save"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isNewNote && !canEdit()}
              className="w-full bg-white text-[#2E2E2E] text-3xl font-bold rounded px-0 py-2 focus:outline-none border-0 disabled:opacity-50 disabled:cursor-not-allowed placeholder-[#999999]"
              placeholder="Note title..."
            />
          </div>

          <div className="mb-6 relative">
            {bodyRef.current &&
              Object.entries(activeCursors).map(([userId, cursorData]) => {
                console.log(
                  "🖊️ Rendering cursor for:",
                  cursorData.email,
                  "at position:",
                  cursorData.position
                );
                return (
                  <CursorIndicator
                    key={userId}
                    email={cursorData.email}
                    color={getUserColor(userId)}
                    position={cursorData.position}
                    textareaRef={bodyRef}
                  />
                );
              })}

            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyUp={handleCursorChange}
              onClick={handleCursorChange}
              onSelect={handleCursorChange} // ADD THIS LINE - captures all cursor movements
              disabled={!isNewNote && !canEdit()}
              rows={15}
              className="w-full bg-white text-[#2E2E2E] text-base rounded px-0 py-2 focus:outline-none border-0 resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-[#999999] leading-relaxed"
              placeholder="Start writing your note..."
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-[#666666] text-sm font-medium">
                Attachments
              </label>
              {canEdit() && (
                <div className="flex items-center gap-2">
                  <label className="bg-[#B22222] hover:bg-[#8B0000] text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2 transition-colors text-sm">
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
              <div className="bg-[#F5F5F5] rounded p-4 border border-[#E0E0E0] mb-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#B22222]"></div>
                  <p className="text-[#666666]">
                    {isNewNote
                      ? "Creating note and uploading files..."
                      : "Uploading files..."}
                  </p>
                </div>
              </div>
            )}

            {isNewNote && pendingFiles.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-[#666666] text-sm">
                  Files to be attached after note creation:
                </p>
                {pendingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-[#F5F5F5] rounded p-4 border border-[#E0E0E0] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Paperclip className="w-5 h-5 text-[#666666] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#2E2E2E] font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-[#999999] text-sm">
                          {formatFileSize(file.size)} •{" "}
                          {file.type || "Unknown type"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removePendingFile(index)}
                        className="text-[#B22222] hover:text-[#8B0000] p-2 transition-colors"
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
                    className="bg-[#F5F5F5] rounded p-4 border border-[#E0E0E0] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Paperclip className="w-5 h-5 text-[#666666] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#2E2E2E] font-medium truncate">
                          {attachment.file_name}
                        </p>
                        <p className="text-[#999999] text-sm">
                          {formatFileSize(attachment.file_size)} •{" "}
                          {attachment.mime_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {attachment.signedUrl && (
                        <a
                          href={attachment.signedUrl}
                          download={attachment.file_name}
                          className="text-[#50C878] hover:text-[#3DA863] p-2 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      {canEdit() && (
                        <button
                          onClick={() =>
                            handleDeleteAttachment(
                              attachment.id,
                              attachment.file_path
                            )
                          }
                          className="text-[#B22222] hover:text-[#8B0000] p-2 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isNewNote && (
                <div className="bg-[#F5F5F5] rounded p-8 border border-[#E0E0E0] text-center">
                  <Paperclip className="w-12 h-12 text-[#999999] mx-auto mb-3" />
                  <p className="text-[#666666] text-sm">
                    {canEdit()
                      ? "No attachments yet. Add files to this note."
                      : "No attachments for this note."}
                  </p>
                </div>
              )
            )}

            {isNewNote && pendingFiles.length === 0 && (
              <div className="bg-[#F5F5F5] rounded p-8 border border-[#E0E0E0] text-center">
                <Paperclip className="w-12 h-12 text-[#999999] mx-auto mb-3" />
                <p className="text-[#666666] text-sm">
                  Add files to attach to this note. They will be uploaded after
                  the note is created.
                </p>
              </div>
            )}
          </div>

          {!isNewNote && !canEdit() && (
            <div className="mt-6 p-4 bg-[#E3F2FD] border border-[#90CAF9] rounded">
              <div className="flex items-center gap-2 text-[#1976D2]">
                <Eye className="w-4 h-4" />
                <p className="text-sm">
                  You have view-only access to this note.
                </p>
              </div>
            </div>
          )}

          {isNewNote && (
            <div className="mt-6 p-4 bg-[#E8F5E9] border border-[#81C784] rounded">
              <div className="flex items-center gap-2 text-[#388E3C]">
                <Edit3 className="w-4 h-4" />
                <p className="text-sm">
                  Create a new note. You will be the owner and can share it with
                  others.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
