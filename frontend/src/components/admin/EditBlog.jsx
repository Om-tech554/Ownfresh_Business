import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X, RefreshCw, Type, ImageIcon, Upload, CheckCircle2, PlusCircle, Trash2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// TIPTAP IMPORTS
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";

const EditBlog = ({ blog, onClose, onUpdated }) => {
  const [title, setTitle] = useState(blog.title);

  // Store content sections
  const [sections, setSections] = useState(
    blog.sections || [{ content: "" }]
  );

  // Store up to 4 new images
  const [newImages, setNewImages] = useState([null, null, null, null]);
  const [previews, setPreviews] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);

  // Set previews when images change
  useEffect(() => {
    const updated = newImages.map((img) => (img ? URL.createObjectURL(img) : null));
    setPreviews(updated);

    return () => updated.forEach((url) => url && URL.revokeObjectURL(url));
  }, [newImages]);

  // Tiptap Editor Factory
  const createEditor = (index, initialContent) =>
    useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link,
        Heading.configure({
          levels: [1, 2, 3],
        }),
      ],
      content: initialContent,
      onUpdate: ({ editor }) => {
        const updated = [...sections];
        updated[index].content = editor.getHTML();
        setSections(updated);
      },
    });

  // Create an array of editors for each section
  const editors = sections.map((section, index) =>
    createEditor(index, section.content)
  );

  // Add new section
  const addSection = () => {
    setSections([...sections, { content: "" }]);
  };

  // Remove section
  const removeSection = (index) => {
    if (sections.length === 1)
      return toast.error("At least one content block required.");

    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  // Toolbar Button UI
  const ToolbarButton = ({ command, icon, active }) => (
    <button
      onClick={command}
      type="button"
      className={`p-2 rounded hover:bg-slate-200 ${
        active ? "bg-slate-300" : ""
      }`}
    >
      {icon}
    </button>
  );

  // Update Handler
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("sections", JSON.stringify(sections));

      newImages.forEach((img, index) => {
        if (img) formData.append(`image${index + 1}`, img);
      });

      await axios.put(
        `http://localhost:8000/api/blog/update/${blog._id}`,
        formData,
        { withCredentials: true }
      );

      toast.success("Blog updated!", {
        style: { background: "#1e293b", color: "#fff", border: "1px solid #1E971D" },
      });

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 900);
    } catch (err) {
      toast.error("Failed to update blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <Toaster />
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-y-auto shadow-2xl max-h-[95vh] border">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b">
          <h2 className="text-xl font-bold text-slate-800">Edit SEO Blog</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-8">

          {/* TITLE */}
          <div>
            <label className="text-sm font-bold text-slate-700 flex gap-2">
              <Type className="w-4" /> Blog Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border bg-slate-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* SECTIONS */}
          <div>
            <label className="text-sm font-bold text-slate-700 flex gap-2">
              SEO Blog Content
            </label>

            {sections.map((sec, index) => (
              <div
                key={index}
                className="mt-4 border p-4 rounded-xl bg-slate-50 space-y-3"
              >
                {/* TIPTAP TOOLBAR */}
                <div className="flex gap-1 flex-wrap border-b pb-2">
                  <ToolbarButton
                    icon={<b>B</b>}
                    command={() => editors[index].chain().focus().toggleBold().run()}
                    active={editors[index]?.isActive("bold")}
                  />
                  <ToolbarButton
                    icon={<i>I</i>}
                    command={() => editors[index].chain().focus().toggleItalic().run()}
                    active={editors[index]?.isActive("italic")}
                  />
                  <ToolbarButton
                    icon={<u>U</u>}
                    command={() => editors[index].chain().focus().toggleUnderline().run()}
                    active={editors[index]?.isActive("underline")}
                  />

                  {/* Headings */}
                  {[1, 2, 3].map((lvl) => (
                    <ToolbarButton
                      key={lvl}
                      icon={<span>H{lvl}</span>}
                      command={() =>
                        editors[index].chain().focus().toggleHeading({ level: lvl }).run()
                      }
                      active={editors[index]?.isActive("heading", { level: lvl })}
                    />
                  ))}

                  {/* Lists */}
                  <ToolbarButton
                    icon={<span>• List</span>}
                    command={() =>
                      editors[index].chain().focus().toggleBulletList().run()
                    }
                    active={editors[index]?.isActive("bulletList")}
                  />

                  <ToolbarButton
                    icon={<span>1. List</span>}
                    command={() =>
                      editors[index].chain().focus().toggleOrderedList().run()
                    }
                    active={editors[index]?.isActive("orderedList")}
                  />
                </div>

                {/* TIPTAP EDITOR */}
                <EditorContent editor={editors[index]} className="bg-white p-3 rounded-lg border min-h-[150px]" />

                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="text-red-500 flex gap-2 text-xs"
                >
                  <Trash2 className="w-4" /> Delete Section
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addSection}
              className="mt-4 flex gap-2 text-[#1E971D] text-sm font-semibold"
            >
              <PlusCircle className="w-5" /> Add New Content Block
            </button>
          </div>

          {/* IMAGES */}
          <div>
            <label className="text-sm font-bold text-slate-700 flex gap-2">
              <ImageIcon className="w-4" /> Blog Images (4 MAX)
            </label>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div key={idx}>
                    <div className="h-32 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border">
                      {previews[idx] ? (
                        <img src={previews[idx]} className="w-full h-full object-cover" />
                      ) : blog[`image${idx + 1}`] ? (
                        <img
                          src={blog[`image${idx + 1}`]}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-xs text-slate-400">No Image</p>
                      )}
                    </div>

                    <label className="block mt-2 bg-slate-200 text-center py-2 rounded cursor-pointer">
                      Replace
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const updated = [...newImages];
                          updated[idx] = e.target.files[0];
                          setNewImages(updated);
                        }}
                      />
                    </label>
                  </div>
                ))}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border rounded-xl text-slate-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-slate-900 text-white py-3 rounded-xl flex gap-2 justify-center items-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#1E971D]" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditBlog;