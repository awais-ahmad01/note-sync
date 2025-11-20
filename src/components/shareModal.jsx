"use client";
import { X, Edit2, Eye, Check, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const ShareModal = ({ isOpen, onClose, noteTitle, noteId }) => {
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [noteOwnerId, setNoteOwnerId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("editor"); 
  const [editingRole, setEditingRole] = useState(null); 
  const [editingRoleValue, setEditingRoleValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleEmailChange = async (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.length < 2) return setSuggestions([]);

    try {
      const collabIds = collaborators.map((c) => c.id);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, email, name")
        .ilike("email", `%${value}%`)
        .not("id", "in", `(${collabIds.join(",")})`)
        .not("id", "eq", currentUser.id);

      if (error) throw error;

      setSuggestions(data);
    } catch (error) {
      console.log("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchNoteOwner();
      fetchCollaborators();
    }
  }, [isOpen, noteId]);

  const fetchNoteOwner = async () => {
    try {
      const { data: note, error } = await supabase
        .from("notes")
        .select("owner_id")
        .eq("id", noteId)
        .single();
      if (error) throw error;
      setNoteOwnerId(note.owner_id);
    } catch (error) {
      console.error("Error fetching note owner:", error);
    }
  };

  const fetchCollaborators = async () => {
    if (!noteId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

     
      const { data: shares, error: sharesError } = await supabase
        .from("note_shares")
        .select("id, note_id, user_id, role, created_at")
        .eq("note_id", noteId);

      if (sharesError) throw sharesError;

      const { data: note, error: noteError } = await supabase
        .from("notes")
        .select("owner_id")
        .eq("id", noteId)
        .single();
      if (noteError) throw noteError;

      const { data: ownerProfile } = await supabase
        .from("user_profiles")
        .select("id, email, name")
        .eq("id", note.owner_id)
        .single();

      const collabs = [];

      if (ownerProfile) {
        collabs.push({
          id: ownerProfile.id,
          name:
            ownerProfile.id === user.id
              ? "You"
              : ownerProfile.name || ownerProfile.email.split("@")[0],
          email: ownerProfile.email,
          role: "Owner",
          avatar:
            ownerProfile.name?.[0]?.toUpperCase() ||
            ownerProfile.email[0].toUpperCase(),
          color: "#8b5cf6",
          isOwner: true,
          canRemove: false,
          canEditRole: false,
        });
      }

      for (let share of shares || []) {
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("id, email, name")
          .eq("id", share.user_id)
          .single();

        if (userProfile) {
          collabs.push({
            id: userProfile.id,
            name: userProfile.name || userProfile.email.split("@")[0],
            email: userProfile.email,
            role: share.role,
            avatar:
              userProfile.name?.[0]?.toUpperCase() ||
              userProfile.email[0].toUpperCase(),
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            isOwner: false,
            canRemove: note.owner_id === user.id,
            canEditRole: note.owner_id === user.id,
            shareId: share.id, 
          });
        }
      }

      console.log("Fetched collaborators with share IDs:", collabs);
      setCollaborators(collabs);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  const handleAddCollaborator = async () => {
    if (!email.trim() || !noteId || !currentUser) return;

    setLoading(true);
    try {
      const { data: note, error: noteError } = await supabase
        .from("notes")
        .select("owner_id")
        .eq("id", noteId)
        .single();
      if (noteError) throw noteError;

      if (note.owner_id !== currentUser.id) {
        throw new Error("Only the note owner can share this note");
      }

      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("id, email, name")
        .eq("email", email.trim())
        .single();
      if (userError) throw new Error("User not found");

      if (userData.id === currentUser.id) {
        throw new Error("You cannot share a note with yourself");
      }

      const { data: existingShare } = await supabase
        .from("note_shares")
        .select("id")
        .eq("note_id", noteId)
        .eq("user_id", userData.id)
        .single();

      if (existingShare) throw new Error("Note already shared with this user");

      const { error: shareError } = await supabase.rpc(
        "rpc_create_note_share",
        {
          _note_id: noteId,
          _user_id: userData.id,
          _role: selectedRole,
        }
      );
      if (shareError) throw shareError;

      await fetchCollaborators();
      setEmail("");
      setSelectedRole("editor");
      alert("Note shared successfully!");
    } catch (error) {
      console.error("Error adding collaborator:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!noteId || !currentUser) return;
    try {
      const { data: note } = await supabase
        .from("notes")
        .select("owner_id")
        .eq("id", noteId)
        .single();
      if (!note) throw new Error("Note not found");

      const isOwner = note.owner_id === currentUser.id;
      const isSelf = userId === currentUser.id;
      if (!isOwner && !isSelf) throw new Error("No permission to remove");

      const { data: share } = await supabase
        .from("note_shares")
        .select("id")
        .eq("note_id", noteId)
        .eq("user_id", userId)
        .single();

      if (!share) throw new Error("Share not found");

      await supabase.rpc("rpc_delete_note_share_owner", {
        _share_id: share.id,
      });
      await fetchCollaborators();
      alert("Collaborator removed successfully!");
    } catch (error) {
      console.error("Error removing collaborator:", error);
      alert(error.message);
    }
  };

  const handleUpdateRole = async (shareId, newRole) => {
    console.log("handleUpdateRole called with:", { shareId, newRole });

    if (!shareId || !currentUser) {
      console.error("Missing shareId or currentUser:", {
        shareId,
        currentUser,
      });
      alert("Cannot update role: Missing required information");
      return;
    }

    try {
      const { data: note } = await supabase
        .from("notes")
        .select("owner_id")
        .eq("id", noteId)
        .single();

      if (note.owner_id !== currentUser.id) {
        throw new Error("Only the note owner can update roles");
      }

      console.log("Calling rpc_update_note_share with:", {
        _share_id: shareId,
        _role: newRole,
      });

      const { error } = await supabase.rpc("rpc_update_note_share", {
        _share_id: shareId,
        _role: newRole,
      });

      if (error) {
        console.error("RPC Error:", error);
        throw error;
      }

      console.log("Role updated successfully");
      await fetchCollaborators();
      setEditingRole(null);
      setEditingRoleValue("");
      alert("Role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role: " + error.message);
    }
  };

  const startEditingRole = (collabId, currentRole, shareId) => {
    console.log("Starting to edit role for:", {
      collabId,
      currentRole,
      shareId,
    });
    setEditingRole(collabId);
    setEditingRoleValue(currentRole);
  };

  const cancelEditingRole = () => {
    console.log("Canceling role edit");
    setEditingRole(null);
    setEditingRoleValue("");
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "editor":
        return "Can edit";
      case "viewer":
        return "Can view";
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-600 text-white";
      case "editor":
        return "bg-blue-600 text-white";
      case "viewer":
        return "bg-gray-600 text-gray-300";
      default:
        return "bg-gray-600 text-gray-300";
    }
  };

  const canShare = noteOwnerId && currentUser && noteOwnerId === currentUser.id;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#252837] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Share "{noteTitle}"</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {canShare ? (
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">
                Add people by email
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleAddCollaborator()
                  }
                  placeholder="Enter email address"
                  className="flex-1 bg-[#1a1d2e] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 placeholder-gray-500"
                  disabled={loading}
                />

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-[#1a1d2e] text-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700"
                >
                  <option value="editor">Can edit</option>
                  <option value="viewer">Can view</option>
                </select>

                <button
                  onClick={handleAddCollaborator}
                  disabled={loading || !email.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="bg-[#1a1d2e] mt-2 rounded-lg border border-gray-700">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="px-4 py-3 hover:bg-[#252837] cursor-pointer flex items-center gap-3"
                      onClick={() => {
                        setEmail(s.email);
                        setSuggestions([]);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                        {s.name?.[0]?.toUpperCase() || s.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm">
                          {s.name || s.email.split("@")[0]}
                        </p>
                        <p className="text-gray-400 text-xs">{s.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                Only the note owner can share this note with others.
              </p>
            </div>
          )}

          <div>
            <h3 className="text-gray-400 text-sm uppercase font-semibold mb-4 tracking-wider">
              People with Access ({collaborators.length})
            </h3>

            {collaborators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No collaborators yet
              </div>
            ) : (
              collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="bg-[#1a1d2e] rounded-lg p-4 mb-3 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                        style={{ backgroundColor: collab.color }}
                      >
                        {collab.avatar}
                      </div>
                      <div>
                        <p className="text-white font-medium">{collab.name}</p>
                        <p className="text-gray-400 text-sm">{collab.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingRole === collab.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingRoleValue}
                            onChange={(e) =>
                              setEditingRoleValue(e.target.value)
                            }
                            className="bg-[#1a1d2e] text-gray-200 rounded px-2 py-1 border border-gray-600 text-sm"
                          >
                            <option value="editor">Can edit</option>
                            <option value="viewer">Can view</option>
                          </select>
                          <button
                            onClick={() =>
                              handleUpdateRole(collab.shareId, editingRoleValue)
                            }
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Save role"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditingRole}
                            className="text-gray-400 hover:text-gray-300 p-1"
                            title="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${getRoleColor(
                              collab.role
                            )}`}
                          >
                            {getRoleDisplay(collab.role)}
                          </span>
                          {collab.canEditRole && collab.role !== "owner" && (
                            <button
                              onClick={() =>
                                startEditingRole(
                                  collab.id,
                                  collab.role,
                                  collab.shareId
                                )
                              }
                              className="text-blue-400 hover:text-blue-300 p-1"
                              title="Edit role"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {!collab.isOwner && collab.canRemove && (
                            <button
                              onClick={() =>
                                handleRemoveCollaborator(collab.id)
                              }
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Remove collaborator"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="bg-[#1a1d2e] hover:bg-[#252837] text-gray-300 px-6 py-2.5 rounded-lg transition-colors border border-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
