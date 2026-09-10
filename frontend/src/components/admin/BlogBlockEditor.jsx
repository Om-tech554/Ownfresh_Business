import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Link as LinkIcon, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4,
  ImageIcon, 
  Youtube, 
  AlertCircle, 
  BookOpen, 
  Code, 
  List as ListIcon, 
  FileText,
  Loader2, 
  ExternalLink,
  Check,
  X,
  RefreshCw,
  Minus
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import ImagePickerModal from "./ImagePickerModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

// Slash Command options
const COMMANDS = [
  { id: "h1", label: "Heading 1", type: "heading", level: 1, icon: Heading1, desc: "Large section heading" },
  { id: "h2", label: "Heading 2", type: "heading", level: 2, icon: Heading2, desc: "Medium section heading" },
  { id: "h3", label: "Heading 3", type: "heading", level: 3, icon: Heading3, desc: "Subsection heading" },
  { id: "paragraph", label: "Paragraph", type: "paragraph", icon: FileText, desc: "Plain body text" },
  { id: "bullet-list", label: "Bullet List", type: "list", style: "bullet", icon: ListIcon, desc: "Unordered bulleted list" },
  { id: "ordered-list", label: "Ordered List", type: "list", style: "ordered", icon: ListIcon, desc: "Numbered ordered list" },
  { id: "callout", label: "Callout Block", type: "callout", icon: AlertCircle, desc: "Highlighted info box" },
  { id: "image", label: "Image Block", type: "image", icon: ImageIcon, desc: "Upload or select from gallery" },
  { id: "bookmark", label: "Link Bookmark", type: "bookmark", icon: LinkIcon, desc: "SSRF-safe metadata bookmark" },
  { id: "toc", label: "Table of Contents", type: "toc", icon: BookOpen, desc: "Jump link index of headings" },
  { id: "embed", label: "Video Embed", type: "embed", icon: Youtube, desc: "YouTube or generic iframe video" },
  { id: "divider", label: "Divider", type: "divider", icon: Minus, desc: "Horizontal rule spacer" },
  { id: "html", label: "Custom HTML", type: "html", icon: Code, desc: "Raw HTML / Twig layout code" },
];

const BlogBlockEditor = ({ blocks, onChange }) => {
  const [activeBlockIndex, setActiveBlockIndex] = useState(null);
  const [slashMenu, setSlashMenu] = useState(null); // { blockId, filter: "" }
  const [slashSelectedIdx, setSlashSelectedIdx] = useState(0);
  const [textSelection, setTextSelection] = useState(null); // { range, text, x, y, blockId }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null); // { blockId, originalText, newText, actionName }
  const [pickerBlockId, setPickerBlockId] = useState(null);
  const [bookmarkFetchingId, setBookmarkFetchingId] = useState(null);

  const blockRefs = useRef({});
  const slashMenuRef = useRef(null);

  // Manage selection changes for floating toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setTextSelection(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setTextSelection(null);
        return;
      }

      // Check if selection is inside our block editor
      const anchorNode = selection.anchorNode;
      const element = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
      const blockEl = element.closest("[data-block-id]");
      if (!blockEl) {
        setTextSelection(null);
        return;
      }

      const blockId = blockEl.getAttribute("data-block-id");
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setTextSelection({
        range,
        text,
        blockId,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 46,
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  // Update a single block's data
  const updateBlockData = (id, newData) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return { ...b, data: { ...b.data, ...newData } };
      }
      return b;
    });
    onChange(updated);
  };

  // Add block at a specific position
  const insertBlockAt = (index, type = "paragraph", initialData = {}) => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data: {
        content: "",
        items: [""],
        level: 2,
        align: "center",
        width: "100%",
        type: "info",
        url: "",
        alt: "",
        caption: "",
        code: "",
        levels: ["h1", "h2", "h3"],
        ...initialData,
      },
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    onChange(newBlocks);
    
    // Focus new block
    setTimeout(() => {
      focusBlock(newBlock.id);
    }, 100);
  };

  const deleteBlock = (id) => {
    if (blocks.length === 1) {
      updateBlockData(id, { content: "" });
      return;
    }
    const filtered = blocks.filter((b) => b.id !== id);
    onChange(filtered);
  };

  const moveBlock = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    onChange(newBlocks);
  };

  const focusBlock = (id) => {
    const ref = blockRefs.current[id];
    if (ref) {
      ref.focus();
    }
  };

  // Inline formatting helper
  const applyInlineFormatting = (command, val = null) => {
    document.execCommand(command, false, val);
    setTextSelection(null);
  };

  // AI selected text helpers
  const handleAiTextAction = async (action) => {
    if (!textSelection) return;
    const { text, blockId } = textSelection;
    setAiLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/blog/ai/${action}`, { text }, { withCredentials: true });
      if (response.data.success) {
        setAiPreview({
          blockId,
          originalText: text,
          newText: response.data.result,
          actionName: action.toUpperCase(),
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "AI editing action failed");
    } finally {
      setAiLoading(false);
      setTextSelection(null);
    }
  };

  const confirmAiReplace = () => {
    if (!aiPreview) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(aiPreview.newText));
      
      // Update block state
      const blockEl = document.querySelector(`[data-block-id="${aiPreview.blockId}"] .editable-area`);
      if (blockEl) {
        const block = blocks.find(b => b.id === aiPreview.blockId);
        if (block) {
          if (block.type === "paragraph" || block.type === "heading" || block.type === "blockquote") {
            updateBlockData(aiPreview.blockId, { content: blockEl.innerHTML });
          }
        }
      }
    }
    setAiPreview(null);
    toast.success("AI text applied successfully");
  };

  // Keyboard navigation & slash trigger inside editable content
  const handleKeyDown = (e, block, index) => {
    const value = e.target.innerHTML || "";
    
    // Open Slash menu
    if (e.key === "/") {
      setSlashMenu({ blockId: block.id, filter: "" });
      setSlashSelectedIdx(0);
      return;
    }

    if (slashMenu && slashMenu.blockId === block.id) {
      const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(slashMenu.filter.toLowerCase()));

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashSelectedIdx((prev) => (prev + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashSelectedIdx((prev) => (prev - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[slashSelectedIdx];
        if (selected) {
          executeSlashCommand(block, selected, index);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashMenu(null);
        return;
      }
      if (e.key === "Backspace" && slashMenu.filter === "") {
        setSlashMenu(null);
        return;
      }
    }

    // Standard block shortcuts
    if (e.key === "Enter" && !e.shiftKey) {
      if (block.type === "paragraph" || block.type === "heading" || block.type === "blockquote") {
        e.preventDefault();
        insertBlockAt(index + 1, "paragraph");
      }
    }

    if (e.key === "Backspace" && value === "" && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(block.id);
      if (index > 0) {
        setTimeout(() => focusBlock(blocks[index - 1].id), 50);
      }
    }
  };

  const handleInput = (e, blockId, field = "content") => {
    let val = e.target.innerHTML;
    
    // Slash filter monitoring
    if (slashMenu && slashMenu.blockId === blockId) {
      const plainText = e.target.textContent || "";
      const slashIndex = plainText.lastIndexOf("/");
      if (slashIndex !== -1) {
        const filterText = plainText.substring(slashIndex + 1);
        setSlashMenu({ blockId, filter: filterText });
      } else {
        setSlashMenu(null);
      }
    }

    updateBlockData(blockId, { [field]: val });
  };

  const executeSlashCommand = (block, cmd, index) => {
    // Strip the "/" character
    const blockEl = blockRefs.current[block.id];
    if (blockEl) {
      let html = blockEl.innerHTML;
      if (html.endsWith("/")) {
        html = html.substring(0, html.length - 1);
      } else {
        const lastSlash = html.lastIndexOf("/");
        if (lastSlash !== -1) {
          html = html.substring(0, lastSlash);
        }
      }
      blockEl.innerHTML = html;
    }

    // Change current block or insert new
    if (cmd.type === "heading") {
      updateBlockData(block.id, { content: blockEl?.innerHTML || "", level: cmd.level });
      // mutate type
      const updated = blocks.map(b => b.id === block.id ? { ...b, type: "heading" } : b);
      onChange(updated);
    } else if (cmd.type === "list") {
      const updated = blocks.map(b => b.id === block.id ? { ...b, type: "list", data: { items: [blockEl?.innerHTML || ""], style: cmd.style } } : b);
      onChange(updated);
    } else if (cmd.type === "paragraph") {
      const updated = blocks.map(b => b.id === block.id ? { ...b, type: "paragraph", data: { content: blockEl?.innerHTML || "" } } : b);
      onChange(updated);
    } else {
      // For media, embeds, etc, substitute current empty paragraph block, or insert below
      const isEmpty = (blockEl?.innerHTML || "").trim() === "";
      if (isEmpty) {
        const updated = blocks.map(b => b.id === block.id ? { ...b, type: cmd.type, data: getEmptyDataForType(cmd.type) } : b);
        onChange(updated);
      } else {
        insertBlockAt(index + 1, cmd.type, getEmptyDataForType(cmd.type));
      }
    }

    setSlashMenu(null);
  };

  const getEmptyDataForType = (type) => {
    switch (type) {
      case "image": return { url: "", alt: "", caption: "", align: "center", width: "100%" };
      case "callout": return { type: "info", content: "Important callout message..." };
      case "bookmark": return { url: "", title: "", description: "", image: "", domain: "" };
      case "toc": return { levels: ["h1", "h2", "h3"] };
      case "embed": return { url: "", embedType: "youtube" };
      case "html": return { code: "<!-- Custom HTML -->" };
      case "divider": return {};
      default: return {};
    }
  };

  // SSRF Metadata Fetcher for Bookmarks
  const fetchBookmarkMeta = async (blockId, url) => {
    if (!url) return;
    setBookmarkFetchingId(blockId);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/blog/bookmark/metadata`, { url }, { withCredentials: true });
      if (res.data.success) {
        updateBlockData(blockId, {
          title: res.data.metadata.title,
          description: res.data.metadata.description,
          image: res.data.metadata.image,
          domain: res.data.metadata.domain,
          url: res.data.metadata.url
        });
        toast.success("Bookmark metadata loaded!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch webpage details");
    } finally {
      setBookmarkFetchingId(null);
    }
  };

  // Image upload handler
  const handleUploadImageBlock = async (blockId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    const loadingToast = toast.loading("Uploading image to Cloudinary...");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/blog/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      if (res.data.success) {
        updateBlockData(blockId, { url: res.data.imageUrl });
        toast.success("Image uploaded successfully", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Image upload failed: " + (error.response?.data?.message || error.message), { id: loadingToast });
    }
  };

  // Render specific layout inside block list
  const renderBlockInput = (block, index) => {
    switch (block.type) {
      case "paragraph":
        return (
          <div
            ref={(el) => (blockRefs.current[block.id] = el)}
            contentEditable
            suppressContentEditableWarning
            className="editable-area text-slate-800 leading-relaxed py-1 focus:outline-none min-h-[1.5em]"
            placeholder="Type '/' for commands..."
            onKeyDown={(e) => handleKeyDown(e, block, index)}
            onInput={(e) => handleInput(e, block.id)}
            onFocus={() => setActiveBlockIndex(index)}
            dangerouslySetInnerHTML={{ __html: block.data.content || "" }}
          />
        );

      case "heading":
        const HeadingTag = `h${block.data.level || 2}`;
        return (
          <HeadingTag
            ref={(el) => (blockRefs.current[block.id] = el)}
            contentEditable
            suppressContentEditableWarning
            className={`editable-area font-black text-slate-900 border-none outline-none focus:outline-none py-1 ${
              block.data.level === 1 ? "text-3xl" : block.data.level === 2 ? "text-2xl" : "text-xl"
            }`}
            placeholder={`Heading ${block.data.level}`}
            onKeyDown={(e) => handleKeyDown(e, block, index)}
            onInput={(e) => handleInput(e, block.id)}
            onFocus={() => setActiveBlockIndex(index)}
            dangerouslySetInnerHTML={{ __html: block.data.content || "" }}
          />
        );

      case "blockquote":
        return (
          <blockquote className="border-l-4 border-[#24672E] pl-4 italic text-slate-600 bg-slate-50 p-2.5 rounded-r-xl">
            <div
              ref={(el) => (blockRefs.current[block.id] = el)}
              contentEditable
              suppressContentEditableWarning
              className="editable-area focus:outline-none"
              placeholder="Blockquote statement..."
              onKeyDown={(e) => handleKeyDown(e, block, index)}
              onInput={(e) => handleInput(e, block.id)}
              onFocus={() => setActiveBlockIndex(index)}
              dangerouslySetInnerHTML={{ __html: block.data.content || "" }}
            />
          </blockquote>
        );

      case "list":
        return (
          <div className="pl-6">
            {block.data.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 py-0.5 relative group">
                <span className="text-slate-400 font-bold shrink-0 mt-0.5">
                  {block.data.style === "bullet" ? "•" : `${idx + 1}.`}
                </span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="editable-area flex-1 focus:outline-none text-slate-800"
                  placeholder="List item..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const newItems = [...block.data.items];
                      newItems.splice(idx + 1, 0, "");
                      updateBlockData(block.id, { items: newItems });
                      setTimeout(() => {
                        const els = document.querySelectorAll(`[data-block-id="${block.id}"] .editable-area`);
                        els[idx + 1]?.focus();
                      }, 50);
                    } else if (e.key === "Backspace" && item === "") {
                      e.preventDefault();
                      if (block.data.items.length === 1) {
                        // Mutate to paragraph
                        const updated = blocks.map(b => b.id === block.id ? { ...b, type: "paragraph", data: { content: "" } } : b);
                        onChange(updated);
                      } else {
                        const newItems = block.data.items.filter((_, i) => i !== idx);
                        updateBlockData(block.id, { items: newItems });
                        setTimeout(() => {
                          const els = document.querySelectorAll(`[data-block-id="${block.id}"] .editable-area`);
                          els[idx - 1]?.focus();
                        }, 50);
                      }
                    }
                  }}
                  onInput={(e) => {
                    const newItems = [...block.data.items];
                    newItems[idx] = e.target.innerHTML;
                    updateBlockData(block.id, { items: newItems });
                  }}
                  onFocus={() => setActiveBlockIndex(index)}
                  dangerouslySetInnerHTML={{ __html: item || "" }}
                />
              </div>
            ))}
          </div>
        );

      case "image":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-700" /> Image Block
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerBlockId(block.id)}
                  className="bg-emerald-50 text-[#24672E] px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                >
                  Gallery Library
                </button>
                <button
                  type="button"
                  onClick={() => updateBlockData(block.id, { url: "" })}
                  className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {block.data.url ? (
              <div className="flex flex-col items-center">
                <img
                  src={block.data.url}
                  alt={block.data.alt}
                  style={{ width: block.data.width || "100%", alignSelf: block.data.align || "center" }}
                  className="rounded-xl shadow-md max-h-96 object-contain"
                />

                <div className="grid grid-cols-2 gap-4 w-full mt-4 bg-white p-3 rounded-xl border border-slate-150">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Image Alt Text (SEO)</label>
                    <input
                      type="text"
                      className="border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-slate-400"
                      value={block.data.alt}
                      onChange={(e) => updateBlockData(block.id, { alt: e.target.value })}
                      placeholder="SEO tag Alt description..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Caption text</label>
                    <input
                      type="text"
                      className="border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-slate-400"
                      value={block.data.caption}
                      onChange={(e) => updateBlockData(block.id, { caption: e.target.value })}
                      placeholder="Display label below image..."
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Alignment</label>
                    <select
                      className="border border-slate-200 rounded-lg p-2 text-xs outline-none"
                      value={block.data.align}
                      onChange={(e) => updateBlockData(block.id, { align: e.target.value })}
                    >
                      <option value="center">Center</option>
                      <option value="left">Left Float</option>
                      <option value="right">Right Float</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Width (%)</label>
                    <input
                      type="text"
                      className="border border-slate-200 rounded-lg p-2 text-xs outline-none"
                      value={block.data.width}
                      onChange={(e) => updateBlockData(block.id, { width: e.target.value })}
                      placeholder="e.g. 100% or 50%"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-400 transition-colors">
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 font-bold mb-3">Drag & Drop image here, or upload file</p>
                <div className="flex gap-2">
                  <label className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadImageBlock(block.id, e.target.files[0])}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPickerBlockId(block.id)}
                    className="border border-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-slate-50"
                  >
                    Media Gallery
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case "callout":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Callout Alert Box
              </span>
              <select
                className="text-[10px] font-black uppercase border border-slate-200 rounded-lg p-1 outline-none cursor-pointer bg-white"
                value={block.data.type}
                onChange={(e) => updateBlockData(block.id, { type: e.target.value })}
              >
                <option value="info">Info (Blue)</option>
                <option value="tip">Tip (Green)</option>
                <option value="note">Note (Yellow)</option>
                <option value="warning">Warning (Red)</option>
              </select>
            </div>
            <div
              contentEditable
              suppressContentEditableWarning
              className="editable-area focus:outline-none text-slate-800 text-sm italic"
              placeholder="Enter highlighted message..."
              onInput={(e) => updateBlockData(block.id, { content: e.target.innerHTML })}
              dangerouslySetInnerHTML={{ __html: block.data.content || "" }}
            />
          </div>
        );

      case "bookmark":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-sky-600" /> Webpage Link Bookmark
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                placeholder="Enter URL to fetch (https://...)"
                defaultValue={block.data.url}
                onBlur={(e) => {
                  if (e.target.value !== block.data.url) {
                    fetchBookmarkMeta(block.id, e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fetchBookmarkMeta(block.id, e.target.value);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const inputVal = e.target.previousSibling.value;
                  fetchBookmarkMeta(block.id, inputVal);
                }}
                disabled={bookmarkFetchingId === block.id}
                className="bg-slate-900 text-white font-bold px-4 rounded-xl text-xs flex items-center gap-1 hover:bg-emerald-600 disabled:opacity-50"
              >
                {bookmarkFetchingId === block.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Fetch"}
              </button>
            </div>

            {block.data.title && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{block.data.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{block.data.description}</p>
                  <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 mt-2.5">
                    <ExternalLink className="w-3 h-3" /> {block.data.domain}
                  </span>
                </div>
                {block.data.image && (
                  <img src={block.data.image} alt={block.data.title} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                )}
              </div>
            )}
          </div>
        );

      case "toc":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#24672E]" /> Table of Contents Index
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Included Levels:</span>
              {["h1", "h2", "h3", "h4", "h5", "h6"].map((h) => (
                <label key={h} className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={block.data.levels.includes(h)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...block.data.levels, h]
                        : block.data.levels.filter(l => l !== h);
                      updateBlockData(block.id, { levels: updated });
                    }}
                    className="rounded text-[#24672E] focus:ring-[#24672E]"
                  />
                  {h.toUpperCase()}
                </label>
              ))}
            </div>

            <div className="border border-dashed border-slate-200 p-4 rounded-xl bg-white text-center text-xs text-slate-400 italic font-medium">
              [ Table of Contents Index - Automatically scanned and generated from article headings upon saving ]
            </div>
          </div>
        );

      case "embed":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-650" /> Video Frame Embed
              </span>
            </div>

            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
              placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=...)"
              value={block.data.url}
              onChange={(e) => updateBlockData(block.id, { url: e.target.value })}
            />

            {block.data.url && (
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow">
                <iframe
                  src={
                    block.data.url.includes("youtube.com/watch")
                      ? `https://www.youtube.com/embed/${new URL(block.data.url).searchParams.get("v")}`
                      : block.data.url.includes("youtu.be/")
                      ? `https://www.youtube.com/embed/${block.data.url.split("/").pop().split("?")[0]}`
                      : block.data.url
                  }
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        );

      case "divider":
        return (
          <div className="py-4 flex items-center justify-center relative group">
            <div className="w-full h-0.5 bg-slate-200" />
            <span className="absolute text-[8px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              Spacer Divider
            </span>
          </div>
        );

      case "html":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-700" /> Custom HTML / Twig Template
              </span>
            </div>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-900 text-slate-100 outline-none resize-y h-32 focus:border-purple-500 leading-relaxed font-mono"
              placeholder="<div class='custom-banner'>Insert HTML here</div>"
              value={block.data.code}
              onChange={(e) => updateBlockData(block.id, { code: e.target.value })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── FLOAT DIALOG FORMATTING & AI TOOLBAR ── */}
      {textSelection && (
        <div
          style={{ left: `${textSelection.x}px`, top: `${textSelection.y}px` }}
          className="absolute z-[1900] -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 flex items-center gap-1 animate-fade-in text-white"
        >
          <button
            type="button"
            onClick={() => applyInlineFormatting("bold")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200"
            title="Bold"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => applyInlineFormatting("italic")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200"
            title="Italic"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => applyInlineFormatting("underline")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200"
            title="Underline"
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onClick={() => applyInlineFormatting("strikeThrough")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200"
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt("Enter URL link destination:");
              if (url) applyInlineFormatting("createLink", url);
            }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200"
            title="Link"
          >
            <LinkIcon size={15} />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* AI Selection Presets */}
          <button
            type="button"
            onClick={() => handleAiTextAction("rewrite")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-455 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
            title="AI Rewrite selection"
          >
            <Sparkles size={13} className="text-[#FFDD00]" /> Rewrite
          </button>
          <button
            type="button"
            onClick={() => handleAiTextAction("improve")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-455 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
          >
            Improve
          </button>
          <button
            type="button"
            onClick={() => handleAiTextAction("expand")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-455 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
          >
            Expand
          </button>
          <button
            type="button"
            onClick={() => handleAiTextAction("shorten")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-455 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
          >
            Shorten
          </button>
        </div>
      )}

      {/* ── AI COMPILATION PREVIEW CARD MODAL ── */}
      {aiPreview && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAiPreview(null)} />
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]">
            <div className="bg-[#24672E] p-4 text-white flex justify-between items-center">
              <span className="font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-300" /> AI text actions: {aiPreview.actionName}
              </span>
              <button onClick={() => setAiPreview(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-grow bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Original Text Selection</span>
                <p className="text-xs bg-slate-100 p-3 rounded-xl text-slate-650 border border-slate-200/50">{aiPreview.originalText}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-black text-[#24672E] uppercase tracking-widest flex items-center gap-1">
                  Generated AI Optimization
                </span>
                <div className="text-xs bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-950 font-medium leading-relaxed">
                  {aiPreview.newText}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAiPreview(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Discard AI
              </button>
              <button
                type="button"
                onClick={confirmAiReplace}
                className="px-5 py-2 bg-[#24672E] text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Apply replacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI SPINNER OVERLAY ── */}
      {aiLoading && (
        <div className="fixed inset-0 z-[2300] bg-slate-900/30 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#24672E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Assistant writing...</span>
          </div>
        </div>
      )}

      {/* ── LIST OF EDITOR BLOCKS ── */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            data-block-id={block.id}
            className={`group relative flex items-start gap-4 p-2.5 rounded-2xl transition-all border ${
              activeBlockIndex === index 
                ? "bg-white border-slate-200 shadow-md shadow-slate-100/50" 
                : "border-transparent hover:bg-slate-50/70"
            }`}
          >
            {/* Sidebar controls for each block on hover */}
            <div className="absolute right-full mr-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white border border-slate-100 shadow-sm p-1 rounded-xl">
              <button
                type="button"
                onClick={() => insertBlockAt(index, "paragraph")}
                className="p-1 hover:bg-slate-100 rounded text-slate-500"
                title="Add block below"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, "up")}
                disabled={index === 0}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-20"
                title="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, "down")}
                disabled={index === blocks.length - 1}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-20"
                title="Move down"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => deleteBlock(block.id)}
                className="p-1 hover:bg-rose-50 rounded text-rose-500"
                title="Delete block"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Input component mapper */}
            <div className="flex-grow min-w-0">
              {renderBlockInput(block, index)}
            </div>

            {/* Floating Slash Dropdown menu */}
            {slashMenu && slashMenu.blockId === block.id && (
              <div
                ref={slashMenuRef}
                className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[2000] overflow-hidden animate-slide-up"
              >
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blocks Catalog</span>
                </div>
                <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                  {COMMANDS.filter((c) =>
                    c.label.toLowerCase().includes(slashMenu.filter.toLowerCase())
                  ).map((cmd, cIdx) => {
                    const CmdIcon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => executeSlashCommand(block, cmd, index)}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-colors ${
                          slashSelectedIdx === cIdx 
                            ? "bg-slate-900 text-white" 
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          slashSelectedIdx === cIdx ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <CmdIcon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight">{cmd.label}</p>
                          <p className={`text-[10px] mt-0.5 leading-none ${
                            slashSelectedIdx === cIdx ? "text-slate-300" : "text-slate-400"
                          }`}>
                            {cmd.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helper trigger block for appending item at page end */}
      <div className="flex justify-center pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => insertBlockAt(blocks.length, "paragraph")}
          className="flex items-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white px-5 py-2.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
        >
          <Plus size={14} /> Add Block at End
        </button>
      </div>

      {/* Image Picker modal instance for inline insert */}
      <ImagePickerModal
        isOpen={pickerBlockId !== null}
        onClose={() => setPickerBlockId(null)}
        onSelect={(url) => {
          if (pickerBlockId) {
            updateBlockData(pickerBlockId, { url });
          }
        }}
      />
    </div>
  );
};

export default BlogBlockEditor;
