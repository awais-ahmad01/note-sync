
"use client";
import Link from "next/link";
import { Trash2, Users, Edit2, Eye, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ShareModal from "../components/shareModal";
import { getRelativeTime } from '../lib/getRealtiveTime';


const NoteCard = ({ note, showActions = false }) => {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (note && currentUser) {
      determineUserRole();
    }
  }, [note, currentUser]);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const determineUserRole = () => {
    if (!note || !currentUser) return;

    if (note.owner_id === currentUser.id) {
      setUserRole("owner");
      return;
    }

    
    if (note.role) {
      setUserRole(note.role);
      return;
    }


    setUserRole(null);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

   
    if (userRole !== "owner") {
      alert("Only the note owner can delete this note.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase.from("notes").delete().eq("id", note.id);

      if (error) {
        throw error;
      }

      router.refresh();
      console.log("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

   
    if (userRole !== "owner") {
      alert("Only the note owner can share this note.");
      return;
    }

    setIsShareModalOpen(true);
  };

  const getRoleBadge = () => {
    if (!userRole) return null;

    switch (userRole) {
      case "owner":
        return {
          bg: "bg-purple-500/20",
          text: "text-purple-400",
          label: "Owner",
          icon: Edit2,
        };
      case "editor":
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-400",
          label: "Can edit",
          icon: Edit2,
        };
      case "viewer":
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          label: "Can view",
          icon: Eye,
        };
      default:
        return null;
    }
  };

  const getAccessTypeBadge = () => {
    if (note?.isShared) {
      return {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        label: "Shared",
      };
    } else {
      return {
        bg: "bg-indigo-500/20",
        text: "text-indigo-400",
        label: "Private",
      };
    }
  };

  const canEdit = () => {
    return userRole === "owner" || userRole === "editor";
  };

  const canView = () => {
    return (
      userRole === "owner" || userRole === "editor" || userRole === "viewer"
    );
  };

  const roleBadge = getRoleBadge();
  const accessTypeBadge = getAccessTypeBadge();


  if (!canView() && !note?.isShared) {
    return null;
  }

  return (
    <>
      <div className="group relative">
        <Link
          href={canView() ? `/notes/${note.id}` : "#"}
          onClick={(e) => !canView() && e.preventDefault()}
        >
          <div
            className={`bg-[#252837] rounded-xl p-6 border transition-colors cursor-pointer ${
              canView()
                ? "border-gray-700 hover:border-gray-600"
                : "border-gray-800 opacity-60 cursor-not-allowed"
            } ${isDeleting ? "opacity-50" : ""}`}
          >
           
            {isDeleting && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}

            {showActions && userRole === "owner" && !isDeleting && (
              <div className="absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleShare}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white p-1.5 rounded-full shadow-lg z-10 transition-colors"
                  title="Share note"
                >
                  <Users className="w-3 h-3" />
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg z-10 transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}

          
            {showActions && userRole && userRole !== "owner" && !isDeleting && (
              <div className="absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {userRole === "editor" && (
                  <div
                    className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg z-10"
                    title="You can edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </div>
                )}
                {userRole === "viewer" && (
                  <div
                    className="bg-gray-500 text-white p-1.5 rounded-full shadow-lg z-10"
                    title="View only"
                  >
                    <Eye className="w-3 h-3" />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
              
                <span
                  className={`text-xs px-3 py-1 rounded-full ${accessTypeBadge.bg} ${accessTypeBadge.text}`}
                >
                  {accessTypeBadge.label}
                </span>
              
                {roleBadge && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${roleBadge.bg} ${roleBadge.text} flex items-center gap-1`}
                  >
                    {roleBadge.icon && <roleBadge.icon className="w-3 h-3" />}
                    {roleBadge.label}
                  </span>
                )}
              
                {!canView() && (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    No Access
                  </span>
                )}
              </div>
            </div>

          
            <h3
              className={`text-lg font-semibold mb-2 line-clamp-1 ${
                canView()
                  ? "text-white group-hover:text-indigo-300 transition-colors"
                  : "text-gray-500"
              }`}
            >
              {note?.title || "Untitled Note"}
              {!canView() && " (No Access)"}
            </h3>

          
            <p
              className={`text-sm mb-4 line-clamp-2 ${
                canView() ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {canView()
                ? note?.body || "No content"
                : "You do not have permission to view this note"}
            </p>

         
            <div className="flex items-center justify-between text-xs">
              <span className={canView() ? "text-gray-500" : "text-gray-600"}>
                Updated {getRelativeTime(note?.updated_at)}
              </span>

             
              {note?.isShared && note?.sharedBy && userRole !== "owner" && (
                <span className="text-gray-500">By {note.sharedBy}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {userRole === "owner" && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          noteTitle={note?.title || "Untitled Note"}
          noteId={note?.id}
        />
      )}
    </>
  );
};



export default NoteCard;