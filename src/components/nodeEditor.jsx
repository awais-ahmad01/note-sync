"use client";

import React, { useState } from "react";
import { CheckSquare } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

const NoteEditor = ({ note: initialNote = null }) => {
  const router = useRouter();

  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.body || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Please add a title or content before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log(await supabase.auth.getSession());

      if (userError || !user) throw new Error("User not authenticated");

      console.log("Saving note for user ID:", user.id);

      if (initialNote) {
        const { error } = await supabase
          .from("notes")
          .update({
            title: title.trim() || "Untitled Note",
            body: content,
            // updated_at: new Date().toISOString()
          })
          .eq("id", initialNote.id);
        // .eq("owner_id", user.id);
        if (error) throw error;
        alert("Note updated successfully!");
        router.push("/notes");
      } else {
        console.log("Creating note for user ID:", user.id);
        // const { data, error } = await supabase
        //   .from("notes")
        //   .insert([{
        //     title: title.trim() || "Untitled Note",
        //     body: content,
        //     owner_id: user.id // ✅ must exactly match auth.uid()
        //   }])
        //   .select(); // select() needed to get the created row back

        const { data, error } = await supabase.rpc("insert_note_rpc", {
          p_title: title.trim() || "Untitled Note",
          p_body: content,
        });

        if (error) throw error;
        alert("Note created successfully!");
        router.push("/notes");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f1118]">
      <div className="bg-[#1a1d2e] border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {initialNote ? "Editing Note" : "New Note"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="bg-[#252837] hover:bg-[#2d3142] text-gray-300 px-5 py-2.5 rounded-lg transition-colors border border-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckSquare className="w-5 h-5" />
              {isSaving ? "Saving..." : initialNote ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-4xl font-bold text-white mb-6 focus:outline-none placeholder-gray-600"
            placeholder="Untitled Note"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[500px] bg-transparent text-gray-300 text-lg leading-relaxed focus:outline-none placeholder-gray-600 resize-none"
            placeholder="Start typing..."
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
