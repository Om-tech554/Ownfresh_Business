import React, { useState } from "react";
import { Image as ImageIcon, Upload, Plus, AlignCenter, AlignLeft, AlignRight, Maximize2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ContentImageInserter
 * Placed on the LEFT side of the Blog Editor.
 * Allows blog writers to insert images against content with Alt Text, Captions, and Alignment.
 */
const ContentImageInserter = ({ editorRef, focusKeyword = "" }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [alignment, setAlignment] = useState("center"); // 'center' | 'left' | 'right' | 'full'
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setImageUrl(objectUrl);
    }
  };

  const insertImageIntoEditor = () => {
    const src = preview || imageUrl;
    if (!src) {
      toast.error("Please upload an image or provide an Image URL first!");
      return;
    }

    let alignStyles = "my-6 text-center";
    let imgStyles = "rounded-xl shadow-md max-w-full h-auto mx-auto";

    if (alignment === "left") {
      alignStyles = "my-4 float-left mr-6 max-w-xs text-left";
      imgStyles = "rounded-xl shadow-sm w-full h-auto";
    } else if (alignment === "right") {
      alignStyles = "my-4 float-right ml-6 max-w-xs text-right";
      imgStyles = "rounded-xl shadow-sm w-full h-auto";
    } else if (alignment === "full") {
      alignStyles = "my-6 w-full text-center";
      imgStyles = "rounded-2xl shadow-lg w-full h-auto object-cover";
    }

    const safeAlt = altText ? altText.replace(/"/g, "&quot;") : "Blog Content Image";
    const safeCaption = caption ? caption.trim() : "";

    const figureHtml = `
      <figure class="${alignStyles}">
        <img src="${src}" alt="${safeAlt}" class="${imgStyles}" />
        ${safeCaption ? `<figcaption class="text-xs text-gray-500 font-medium italic mt-2.5 px-2">${safeCaption}</figcaption>` : ""}
      </figure>
      <p><br/></p>
    `;

    if (editorRef?.current) {
      try {
        const jodit = editorRef.current;
        if (typeof jodit.selection?.insertHTML === "function") {
          jodit.selection.insertHTML(figureHtml);
        } else if (jodit.editor && typeof jodit.editor.selection?.insertHTML === "function") {
          jodit.editor.selection.insertHTML(figureHtml);
        } else if (typeof jodit.execCommand === "function") {
          jodit.execCommand("insertHTML", false, figureHtml);
        }
        toast.success("Image with caption inserted into content!");
        // Reset form
        setPreview("");
        setImageUrl("");
        setImageFile(null);
        setAltText("");
        setCaption("");
        setIsOpen(false);
      } catch (err) {
        console.error("Failed to insert image:", err);
        toast.error("Could not insert image into editor.");
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Add Image Against Content
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Insert styled inline images with SEO Alt Text & Captions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 bg-[#EFDB27] text-black px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] tracking-wider hover:bg-black hover:text-white transition-all"
        >
          <Plus className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-45" : ""}`} />
          {isOpen ? "Close Tool" : "Add Content Image"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Upload / Preview */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Upload Image or Paste URL
            </label>
            <label className="cursor-pointer group flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl hover:border-[#EFDB27] transition-all relative overflow-hidden min-h-36">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-32 object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-center gap-1.5 text-gray-400 group-hover:text-black">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Click to Upload Image
                  </span>
                </div>
              )}
            </label>

            <input
              type="text"
              placeholder="Or paste image URL (https://...)"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreview(e.target.value);
              }}
              className="w-full border-2 border-gray-100 rounded-xl p-2.5 text-xs font-medium focus:border-black outline-none transition-colors"
            />
          </div>

          {/* Column 2: Alt Text, Caption & Alignment */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Image Alt Text (SEO)
                </label>
                {focusKeyword && (
                  <button
                    type="button"
                    onClick={() => setAltText(focusKeyword)}
                    className="text-[9px] font-bold text-amber-600 hover:underline"
                  >
                    + Use Focus Keyword
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Describe image for search engines & screen readers..."
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-2.5 text-xs focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Image Caption (Displayed below image)
              </label>
              <input
                type="text"
                placeholder="Enter descriptive caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-2.5 text-xs focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Image Alignment in Article
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: "center", label: "Center", icon: AlignCenter },
                  { id: "left", label: "Left Float", icon: AlignLeft },
                  { id: "right", label: "Right Float", icon: AlignRight },
                  { id: "full", label: "Full Width", icon: Maximize2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAlignment(item.id)}
                      className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                        alignment === item.id
                          ? "bg-white text-black shadow-xs"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={insertImageIntoEditor}
              className="mt-1 w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Insert Image with Caption into Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentImageInserter;
