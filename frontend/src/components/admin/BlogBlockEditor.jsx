import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Sliders,
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
  Minus,
  Upload
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import ImagePickerModal from "./ImagePickerModal";
import BlogImageSlider from "../BlogImageSlider";
import { parsePasteToBlocks, formatInlineMarkdown } from "../../utils/HtmlBlockConverter";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

// Available slash block commands
const COMMANDS = [
  { id: "paragraph", label: "Paragraph", type: "paragraph", icon: FileText, desc: "Plain body text" },
  { id: "h1", label: "Heading 1", type: "heading", level: 1, icon: Heading1, desc: "Large section heading" },
  { id: "h2", label: "Heading 2", type: "heading", level: 2, icon: Heading2, desc: "Medium section heading" },
  { id: "h3", label: "Heading 3", type: "heading", level: 3, icon: Heading3, desc: "Subsection heading" },
  { id: "bullet-list", label: "Bullet List", type: "list", style: "bullet", icon: ListIcon, desc: "Unordered bulleted list" },
  { id: "ordered-list", label: "Ordered List", type: "list", style: "ordered", icon: ListIcon, desc: "Numbered ordered list" },
  { id: "slider", label: "Image Slider / Carousel", type: "slider", icon: Sliders, desc: "Interactive multi-image slider" },
  { id: "image", label: "Single Image", type: "image", icon: ImageIcon, desc: "Upload or pick single photo" },
  { id: "callout", label: "Callout Box", type: "callout", icon: AlertCircle, desc: "Highlighted info / warning box" },
  { id: "bookmark", label: "Link Bookmark", type: "bookmark", icon: LinkIcon, desc: "Webpage preview card" },
  { id: "toc", label: "Table of Contents", type: "toc", icon: BookOpen, desc: "Jump link index of headings" },
  { id: "embed", label: "Video Embed", type: "embed", icon: Youtube, desc: "YouTube or generic video embed" },
  { id: "divider", label: "Divider Line", type: "divider", icon: Minus, desc: "Horizontal rule spacer" },
  { id: "html", label: "Custom HTML", type: "html", icon: Code, desc: "Raw HTML snippet" },
];

/**
 * Stable, uncontrolled ContentEditable sub-component
 * Prevents cursor jumps and selection collapses in React.
 */
const EditableContent = ({
  html = "",
  onUpdate,
  onKeyDown,
  onFocus,
  onPasteBlocks,
  placeholder = "Write something...",
  className = "",
  tagName = "div",
  blockId
}) => {
  const elRef = useRef(null);
  const isComposingRef = useRef(false);

  // Sync initial or externally updated HTML without destroying caret during typing
  useEffect(() => {
    if (elRef.current && document.activeElement !== elRef.current) {
      if (elRef.current.innerHTML !== (html || "")) {
        elRef.current.innerHTML = html || "";
      }
    }
  }, [html, blockId]);

  const handleInput = () => {
    if (elRef.current && onUpdate && !isComposingRef.current) {
      onUpdate(elRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const htmlData = e.clipboardData.getData("text/html");
    const plainText = e.clipboardData.getData("text/plain");

    if (onPasteBlocks) {
      const handled = onPasteBlocks(htmlData, plainText);
      if (handled) return;
    }

    // Inline insertion for single short text
    const formatted = formatInlineMarkdown(plainText);
    document.execCommand("insertHTML", false, formatted);
    handleInput();
  };

  const Tag = tagName;

  return (
    <Tag
      ref={elRef}
      contentEditable
      suppressContentEditableWarning
      className={`editable-area focus:outline-none select-text cursor-text ${className}`}
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onPaste={handlePaste}
      onCompositionStart={() => { isComposingRef.current = true; }}
      onCompositionEnd={() => {
        isComposingRef.current = false;
        handleInput();
      }}
    />
  );
};

const BlogBlockEditor = ({ blocks, onChange }) => {
  const [activeBlockIndex, setActiveBlockIndex] = useState(null);
  const [slashMenu, setSlashMenu] = useState(null); // { blockId, filter: "", rect: {} }
  const [slashSelectedIdx, setSlashSelectedIdx] = useState(0);
  const [textSelection, setTextSelection] = useState(null); // { text, x, y, blockId }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null); // { blockId, originalText, newText, actionName }
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteRawContent, setPasteRawContent] = useState("");
  
  // Image picker states
  const [pickerConfig, setPickerConfig] = useState(null); // { blockId, type: 'single' | 'slider', sliderIndex?: number }
  const [bookmarkFetchingId, setBookmarkFetchingId] = useState(null);

  const editorContainerRef = useRef(null);

  // Selection detection on mouseup and keyup (avoids destructive re-renders while dragging)
  const handleCheckSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setTextSelection(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      setTextSelection(null);
      return;
    }

    const anchorNode = selection.anchorNode;
    const element = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
    const blockEl = element?.closest("[data-block-id]");
    if (!blockEl) {
      setTextSelection(null);
      return;
    }

    const blockId = blockEl.getAttribute("data-block-id");
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setTextSelection(null);
      return;
    }

    setTextSelection({
      text,
      blockId,
      x: rect.left + window.scrollX + rect.width / 2,
      y: Math.max(10, rect.top + window.scrollY - 46),
    });
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
        images: [],
        levels: ["h1", "h2", "h3"],
        ...initialData,
      },
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    onChange(newBlocks);
  };

  const deleteBlock = (id) => {
    if (blocks.length <= 1) {
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

  // Inline formatting helper
  const applyInlineFormatting = (command, val = null) => {
    document.execCommand(command, false, val);
    handleCheckSelection();
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
      
      const blockEl = document.querySelector(`[data-block-id="${aiPreview.blockId}"] .editable-area`);
      if (blockEl) {
        updateBlockData(aiPreview.blockId, { content: blockEl.innerHTML });
      }
    }
    setAiPreview(null);
    toast.success("AI text applied successfully");
  };

  // Smart multi-block paste handler for content from ChatGPT, Google Docs, Notion, or Markdown
  const handlePasteBlocks = (index, htmlData, plainText) => {
    const hasHtmlBlocks = htmlData && (htmlData.match(/<(p|h1|h2|h3|h4|h5|h6|ul|ol|blockquote|li|table|hr)/gi)?.length > 1 || htmlData.includes("<br><br>"));
    const hasMarkdownBlocks = plainText && (
      /^(#{1,6}\s+|[-*+]\s+|\d+[\.)]\s+|>)/m.test(plainText) ||
      plainText.includes("\n\n") ||
      plainText.split("\n").filter(l => l.trim().length > 0).length > 1
    );

    if (hasHtmlBlocks || hasMarkdownBlocks) {
      const newBlocks = parsePasteToBlocks(htmlData, plainText);
      if (newBlocks && newBlocks.length > 0) {
        const currentBlock = blocks[index];
        const isEmpty = !currentBlock || !currentBlock.data?.content || currentBlock.data.content.replace(/<[^>]+>/g, "").trim() === "";

        const updated = [...blocks];
        if (isEmpty) {
          updated.splice(index, 1, ...newBlocks);
        } else {
          updated.splice(index + 1, 0, ...newBlocks);
        }

        onChange(updated);
        toast.success(`Pasted ${newBlocks.length} formatted blocks!`);
        return true;
      }
    }
    return false;
  };

  const handleSmartPasteSubmit = () => {
    if (!pasteRawContent.trim()) {
      toast.error("Please paste some content first");
      return;
    }
    const newBlocks = parsePasteToBlocks("", pasteRawContent);
    if (newBlocks && newBlocks.length > 0) {
      const isEmptyEditor = blocks.length === 1 && (!blocks[0].data?.content || blocks[0].data.content.replace(/<[^>]+>/g, "").trim() === "");
      if (isEmptyEditor) {
        onChange(newBlocks);
      } else {
        onChange([...blocks, ...newBlocks]);
      }
      toast.success(`Imported ${newBlocks.length} blocks with full structure!`);
      setPasteRawContent("");
      setPasteModalOpen(false);
    }
  };

  // Keyboard navigation & slash trigger inside editable content
  const handleKeyDown = (e, block, index) => {
    // Open Slash menu on '/'
    if (e.key === "/" && !e.shiftKey) {
      setSlashMenu({ blockId: block.id, filter: "" });
      setSlashSelectedIdx(0);
      return;
    }

    if (slashMenu && slashMenu.blockId === block.id) {
      const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(slashMenu.filter.toLowerCase()));

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashSelectedIdx((prev) => (prev + 1) % (filtered.length || 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashSelectedIdx((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
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

    // Standard block shortcuts: Enter creates new paragraph
    if (e.key === "Enter" && !e.shiftKey) {
      if (block.type === "paragraph" || block.type === "heading" || block.type === "blockquote") {
        e.preventDefault();
        insertBlockAt(index + 1, "paragraph");
        return;
      }
    }

    // Backspace on empty block
    if (e.key === "Backspace") {
      const content = block.data.content || "";
      const textOnly = content.replace(/<[^>]+>/g, "").trim();
      if (textOnly === "" && blocks.length > 1) {
        e.preventDefault();
        deleteBlock(block.id);
      }
    }
  };

  const executeSlashCommand = (block, cmd, index) => {
    // Clean trailing slash from text
    let cleanContent = (block.data.content || "").replace(/\/[\w-]*$/, "").trim();

    if (cmd.type === "heading") {
      const updated = blocks.map(b => b.id === block.id ? { ...b, type: "heading", data: { ...b.data, content: cleanContent, level: cmd.level } } : b);
      onChange(updated);
    } else if (cmd.type === "list") {
      const updated = blocks.map(b => b.id === block.id ? { ...b, type: "list", data: { items: [cleanContent || ""], style: cmd.style } } : b);
      onChange(updated);
    } else if (cmd.type === "paragraph") {
      const updated = blocks.map(b => b.id === block.id ? { ...b, type: "paragraph", data: { ...b.data, content: cleanContent } } : b);
      onChange(updated);
    } else {
      const isEmpty = cleanContent === "";
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
      case "slider": return { images: [], caption: "" };
      case "image": return { url: "", alt: "", caption: "", align: "center", width: "100%" };
      case "callout": return { type: "info", content: "Important note..." };
      case "bookmark": return { url: "", title: "", description: "", image: "", domain: "" };
      case "toc": return { levels: ["h1", "h2", "h3"] };
      case "embed": return { url: "", embedType: "youtube" };
      case "html": return { code: "<!-- Custom HTML -->" };
      case "divider": return {};
      default: return {};
    }
  };

  // SSRF Bookmark Fetcher
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
  const handleUploadImage = async (file, onDone) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    const loadingToast = toast.loading("Uploading image to Cloudinary...");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/blog/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      if (res.data.success && res.data.imageUrl) {
        toast.success("Image uploaded successfully!", { id: loadingToast });
        onDone(res.data.imageUrl);
      }
    } catch (error) {
      toast.error("Image upload failed: " + (error.response?.data?.message || error.message), { id: loadingToast });
    }
  };

  // Render block content
  const renderBlockInput = (block, index) => {
    switch (block.type) {
      case "paragraph":
        return (
          <EditableContent
            blockId={block.id}
            html={block.data.content || ""}
            placeholder="Type your paragraph or press '/' for commands..."
            className="text-slate-800 leading-relaxed py-1 text-base min-h-[1.7em]"
            onUpdate={(val) => updateBlockData(block.id, { content: val })}
            onKeyDown={(e) => handleKeyDown(e, block, index)}
            onFocus={() => setActiveBlockIndex(index)}
            onPasteBlocks={(htmlData, plainText) => handlePasteBlocks(index, htmlData, plainText)}
          />
        );

      case "heading":
        const level = block.data.level || 2;
        const headingStyles = level === 1 ? "text-3xl font-black" : level === 2 ? "text-2xl font-extrabold" : "text-xl font-bold";
        return (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
              H{level}
            </span>
            <EditableContent
              blockId={block.id}
              tagName={`h${level}`}
              html={block.data.content || ""}
              placeholder={`Heading ${level}...`}
              className={`text-slate-900 ${headingStyles} flex-1 py-1`}
              onUpdate={(val) => updateBlockData(block.id, { content: val })}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
              onFocus={() => setActiveBlockIndex(index)}
              onPasteBlocks={(htmlData, plainText) => handlePasteBlocks(index, htmlData, plainText)}
            />
          </div>
        );

      case "blockquote":
        return (
          <blockquote className="border-l-4 border-[#24672E] pl-4 italic text-slate-700 bg-slate-50 p-3 rounded-r-2xl">
            <EditableContent
              blockId={block.id}
              html={block.data.content || ""}
              placeholder="Quote or highlighted statement..."
              className="text-slate-700 italic focus:outline-none"
              onUpdate={(val) => updateBlockData(block.id, { content: val })}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
              onFocus={() => setActiveBlockIndex(index)}
              onPasteBlocks={(htmlData, plainText) => handlePasteBlocks(index, htmlData, plainText)}
            />
          </blockquote>
        );

      case "list":
        return (
          <div className="pl-6 space-y-1.5">
            {(block.data.items || [""]).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 relative group">
                <span className="text-slate-500 font-bold shrink-0 mt-0.5">
                  {block.data.style === "bullet" ? "•" : `${idx + 1}.`}
                </span>
                <EditableContent
                  blockId={`${block.id}_${idx}`}
                  html={item || ""}
                  placeholder="List item..."
                  className="flex-1 text-slate-800 py-0.5"
                  onUpdate={(val) => {
                    const newItems = [...(block.data.items || [""])];
                    newItems[idx] = val;
                    updateBlockData(block.id, { items: newItems });
                  }}
                  onPasteBlocks={(htmlData, plainText) => handlePasteBlocks(index, htmlData, plainText)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const newItems = [...(block.data.items || [""])];
                      newItems.splice(idx + 1, 0, "");
                      updateBlockData(block.id, { items: newItems });
                    } else if (e.key === "Backspace" && item === "") {
                      e.preventDefault();
                      if ((block.data.items || []).length <= 1) {
                        const updated = blocks.map(b => b.id === block.id ? { ...b, type: "paragraph", data: { content: "" } } : b);
                        onChange(updated);
                      } else {
                        const newItems = block.data.items.filter((_, i) => i !== idx);
                        updateBlockData(block.id, { items: newItems });
                      }
                    }
                  }}
                  onFocus={() => setActiveBlockIndex(index)}
                />
              </div>
            ))}
          </div>
        );

      case "slider":
        const sliderImages = block.data.images || [];
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1E971D]" /> Image Slider / Carousel Block
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerConfig({ blockId: block.id, type: "slider" })}
                  className="bg-emerald-50 hover:bg-emerald-100 text-[#1E971D] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border border-emerald-200"
                >
                  Add from Gallery
                </button>
                <label className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1">
                  <Upload size={12} /> Upload Slide
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleUploadImage(file, (url) => {
                          updateBlockData(block.id, { images: [...sliderImages, url] });
                        });
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {sliderImages.length > 0 ? (
              <div>
                <BlogImageSlider images={sliderImages} title="Article Slider" />

                {/* Thumbnail Management Row */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
                  {sliderImages.map((imgUrl, sIdx) => (
                    <div key={sIdx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-250 group">
                      <img src={imgUrl} alt={`Slide ${sIdx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = sliderImages.filter((_, i) => i !== sIdx);
                          updateBlockData(block.id, { images: updated });
                        }}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 shadow"
                        title="Remove slide"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white">
                <Sliders className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No slides added yet to this carousel.</p>
                <p className="text-[10px] text-slate-400 mt-1">Upload images or select from media gallery above to create an interactive slider.</p>
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#1E971D]" /> Single Image Block
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerConfig({ blockId: block.id, type: "single" })}
                  className="bg-emerald-50 text-[#1E971D] hover:bg-emerald-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-200"
                >
                  Gallery Library
                </button>
                {block.data.url && (
                  <button
                    type="button"
                    onClick={() => updateBlockData(block.id, { url: "" })}
                    className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {block.data.url ? (
              <div className="flex flex-col items-center">
                <img
                  src={block.data.url}
                  alt={block.data.alt}
                  style={{ width: block.data.width || "100%" }}
                  className="rounded-2xl shadow-md max-h-[480px] object-contain bg-white border border-slate-100 p-1"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4 bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Image Alt Text (SEO)</label>
                    <input
                      type="text"
                      className="border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                      value={block.data.alt || ""}
                      onChange={(e) => updateBlockData(block.id, { alt: e.target.value })}
                      placeholder="SEO tag Alt description..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Caption Label</label>
                    <input
                      type="text"
                      className="border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                      value={block.data.caption || ""}
                      onChange={(e) => updateBlockData(block.id, { caption: e.target.value })}
                      placeholder="Display label below image..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-300 rounded-2xl">
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-600 font-bold mb-3">Upload an image file or pick from library</p>
                <div className="flex gap-2">
                  <label className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleUploadImage(file, (url) => updateBlockData(block.id, { url }));
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPickerConfig({ blockId: block.id, type: "single" })}
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
        const cType = block.data.type || "info";
        let cBorder = "border-sky-400 bg-sky-50 text-sky-900";
        if (cType === "tip") cBorder = "border-emerald-400 bg-emerald-50 text-emerald-900";
        else if (cType === "note") cBorder = "border-amber-400 bg-amber-50 text-amber-900";
        else if (cType === "warning") cBorder = "border-rose-400 bg-rose-50 text-rose-900";

        return (
          <div className={`border-l-4 p-4 rounded-2xl space-y-3 ${cBorder}`}>
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Callout Alert
              </span>
              <select
                className="text-[10px] font-black uppercase border border-slate-300 rounded-lg p-1 bg-white text-slate-800 outline-none cursor-pointer"
                value={cType}
                onChange={(e) => updateBlockData(block.id, { type: e.target.value })}
              >
                <option value="info">Info (Blue)</option>
                <option value="tip">Tip (Green)</option>
                <option value="note">Note (Yellow)</option>
                <option value="warning">Warning (Red)</option>
              </select>
            </div>
            <EditableContent
              blockId={block.id}
              html={block.data.content || ""}
              placeholder="Enter highlighted message..."
              className="text-sm italic py-1 focus:outline-none"
              onUpdate={(val) => updateBlockData(block.id, { content: val })}
              onFocus={() => setActiveBlockIndex(index)}
            />
          </div>
        );

      case "bookmark":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-sky-600" /> Webpage Link Bookmark
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs outline-none bg-white focus:border-slate-400"
                placeholder="Enter URL to fetch (https://...)"
                defaultValue={block.data.url || ""}
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
                  const inputVal = e.currentTarget.previousSibling.value;
                  fetchBookmarkMeta(block.id, inputVal);
                }}
                disabled={bookmarkFetchingId === block.id}
                className="bg-slate-900 text-white font-bold px-4 rounded-xl text-xs flex items-center gap-1 hover:bg-[#1E971D] disabled:opacity-50"
              >
                {bookmarkFetchingId === block.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Fetch"}
              </button>
            </div>

            {block.data.title && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{block.data.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{block.data.description}</p>
                  <span className="text-[10px] text-[#1E971D] font-extrabold flex items-center gap-1 mt-2.5">
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
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#1E971D]" /> Table of Contents Block
            </span>
            <p className="text-xs text-slate-500 italic">
              Automatically scans article H1, H2, and H3 headings and renders a jump link index.
            </p>
          </div>
        );

      case "embed":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Youtube className="w-3.5 h-3.5 text-red-600" /> Video Frame Embed
            </span>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none bg-white focus:border-slate-400"
              placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=...)"
              value={block.data.url || ""}
              onChange={(e) => updateBlockData(block.id, { url: e.target.value })}
            />
            {block.data.url && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow">
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
            <span className="absolute text-[8px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-black tracking-widest uppercase">
              Divider Spacer
            </span>
          </div>
        );

      case "html":
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3 font-mono">
            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Code className="w-3.5 h-3.5" /> Custom HTML Snippet
            </span>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-900 text-slate-100 outline-none resize-y h-32 focus:border-purple-500 font-mono"
              placeholder="<div>Custom HTML here</div>"
              value={block.data.code || ""}
              onChange={(e) => updateBlockData(block.id, { code: e.target.value })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={editorContainerRef}
      onMouseUp={handleCheckSelection}
      onKeyUp={handleCheckSelection}
      className="space-y-4 select-text"
    >
      {/* ── FLOATING FORMATTING & AI TOOLBAR ── */}
      {textSelection && (
        <div
          style={{ left: `${textSelection.x}px`, top: `${textSelection.y}px` }}
          className="absolute z-[2500] -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 animate-fade-in text-white select-none"
        >
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyInlineFormatting("bold"); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 cursor-pointer"
            title="Bold"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyInlineFormatting("italic"); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 cursor-pointer"
            title="Italic"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyInlineFormatting("underline"); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 cursor-pointer"
            title="Underline"
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyInlineFormatting("strikeThrough"); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              const url = prompt("Enter hyperlink destination URL:");
              if (url) applyInlineFormatting("createLink", url);
            }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 cursor-pointer"
            title="Add Link"
          >
            <LinkIcon size={15} />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* AI Helper Presets */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleAiTextAction("rewrite"); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            <Sparkles size={13} className="text-[#FFDD00]" /> Rewrite
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleAiTextAction("improve"); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            Improve
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleAiTextAction("expand"); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            Expand
          </button>
        </div>
      )}

      {/* ── AI PREVIEW MODAL ── */}
      {aiPreview && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAiPreview(null)} />
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]">
            <div className="bg-[#1E971D] p-4 text-white flex justify-between items-center">
              <span className="font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFDD00]" /> AI {aiPreview.actionName} Suggestion
              </span>
              <button onClick={() => setAiPreview(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-grow bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Original Text</span>
                <p className="text-xs bg-slate-100 p-3 rounded-xl text-slate-700 border border-slate-200">{aiPreview.originalText}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-black text-[#1E971D] uppercase tracking-widest">AI Generated Replacement</span>
                <div className="text-xs bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 font-medium leading-relaxed">
                  {aiPreview.newText}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAiPreview(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={confirmAiReplace}
                className="px-5 py-2 bg-[#1E971D] text-white hover:bg-slate-900 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Apply replacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI SPINNER ── */}
      {aiLoading && (
        <div className="fixed inset-0 z-[3100] bg-slate-900/30 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E971D]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">AI Assistant writing...</span>
          </div>
        </div>
      )}

      {/* ── BLOCKS LIST ── */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            data-block-id={block.id}
            className={`group relative flex items-start gap-4 p-3 rounded-2xl transition-all border ${
              activeBlockIndex === index 
                ? "bg-white border-slate-300 shadow-sm" 
                : "border-transparent hover:bg-slate-50/70"
            }`}
          >
            {/* Action Bar (Left of Block) */}
            <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity shrink-0 pt-1">
              <button
                type="button"
                onClick={() => insertBlockAt(index + 1, "paragraph")}
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

            {/* Block Content Canvas */}
            <div className="flex-grow min-w-0">
              {renderBlockInput(block, index)}
            </div>

            {/* Slash Commands Dropdown */}
            {slashMenu && slashMenu.blockId === block.id && (
              <div className="absolute left-10 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[2600] overflow-hidden animate-slide-up">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Block Type</span>
                  <span className="text-[9px] font-bold text-slate-400">Esc to cancel</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
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

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={() => insertBlockAt(blocks.length, "paragraph")}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-2xs"
        >
          <Plus size={14} /> Add Paragraph Block
        </button>

        <button
          type="button"
          onClick={() => setPasteModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-50 text-[#1E971D] hover:bg-[#1E971D] hover:text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border border-emerald-200 shadow-2xs cursor-pointer"
          title="Paste entire article from ChatGPT or Markdown"
        >
          <Sparkles size={14} className="text-[#FFDD00]" /> Paste from ChatGPT / Docs
        </button>
      </div>

      {/* ── SMART PASTE IMPORT MODAL ── */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-[3200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setPasteModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
            <div className="bg-[#1E971D] p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFDD00]" />
                <div>
                  <h3 className="font-extrabold uppercase text-xs tracking-wider">Paste from ChatGPT / Markdown / Docs</h3>
                  <p className="text-[10px] text-white/80 mt-0.5">Automatically converts headings, bullet lists, bold text, and paragraphs into formatted blocks.</p>
                </div>
              </div>
              <button onClick={() => setPasteModalOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-grow bg-slate-50/50">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Paste Text Content Here (Ctrl + V)
                </label>
                <textarea
                  className="w-full h-64 border border-slate-300 rounded-2xl p-4 text-xs font-mono leading-relaxed bg-white text-slate-800 outline-none focus:border-[#1E971D] focus:ring-1 focus:ring-[#1E971D] resize-y"
                  placeholder="Paste your content generated from ChatGPT (e.g. # Heading, - Bullet points, **Bold**, paragraphs)..."
                  value={pasteRawContent}
                  onChange={(e) => setPasteRawContent(e.target.value)}
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1">
                <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#1E971D] block">Supported Formatting</span>
                <p className="text-[11px] text-slate-600">
                  • <strong># Heading 1, ## Heading 2, ### Heading 3</strong> → Converted to styled section headings<br />
                  • <strong>- Bullet lists</strong> and <strong>1. Numbered lists</strong> → Converted to structured list blocks<br />
                  • <strong>&gt; Quotes</strong> → Converted to blockquote highlights<br />
                  • <strong>**Bold**</strong>, <em>*Italic*</em>, and [Links](url) → Preserved automatically
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPasteRawContent("");
                  setPasteModalOpen(false);
                }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSmartPasteSubmit}
                className="px-6 py-2.5 bg-[#1E971D] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Import & Convert to Blocks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Gallery Picker Modal */}
      <ImagePickerModal
        isOpen={pickerConfig !== null}
        onClose={() => setPickerConfig(null)}
        onSelect={(url) => {
          if (!pickerConfig) return;
          if (pickerConfig.type === "slider") {
            const block = blocks.find(b => b.id === pickerConfig.blockId);
            const currentImages = block?.data?.images || [];
            updateBlockData(pickerConfig.blockId, { images: [...currentImages, url] });
          } else {
            updateBlockData(pickerConfig.blockId, { url });
          }
        }}
      />
    </div>
  );
};

export default BlogBlockEditor;
