import React, { useState } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  RemoveFormatting,
  Palette,
  Sparkles,
  Highlighter
} from "lucide-react";

/**
 * WordFormattingToolbar
 * Provides Microsoft Word-style typography and block formatting controls for blog writers.
 * Executes native Jodit commands via the editorRef.
 */
const WordFormattingToolbar = ({ editorRef }) => {
  const [activeHeader, setActiveHeader] = useState("p");
  const [textColor, setTextColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");

  const exec = (command, value = null) => {
    if (!editorRef?.current) return;
    try {
      const jodit = editorRef.current;
      if (typeof jodit.execCommand === "function") {
        jodit.execCommand(command, false, value);
      } else if (jodit.editor && typeof jodit.editor.execCommand === "function") {
        jodit.editor.execCommand(command, false, value);
      }
    } catch (err) {
      console.warn("Formatting command execution:", err);
    }
  };

  const applyHeader = (tag) => {
    setActiveHeader(tag);
    if (tag === "p") {
      exec("formatBlock", "<p>");
    } else {
      exec("formatBlock", `<${tag}>`);
    }
  };

  const applyColor = (color) => {
    setTextColor(color);
    exec("foreColor", color);
  };

  const applyHighlight = (color) => {
    setBgColor(color);
    exec("hiliteColor", color);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4 mb-6">
      {/* Header Bar Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Word Formatting & Typography
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Format headings, text styles, alignment, and lists
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full uppercase">
          Left Panel Tools
        </span>
      </div>

      {/* Row 1: Header Level Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
          Block Style:
        </span>
        {[
          { label: "Heading 1", tag: "h1", icon: Heading1 },
          { label: "Heading 2", tag: "h2", icon: Heading2 },
          { label: "Heading 3", tag: "h3", icon: Heading3 },
          { label: "Heading 4", tag: "h4", icon: Heading4 },
          { label: "Paragraph", tag: "p", icon: Pilcrow },
          { label: "Quote", tag: "blockquote", icon: Quote },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeHeader === item.tag;
          return (
            <button
              key={item.tag}
              type="button"
              onClick={() => applyHeader(item.tag)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Row 2: Text Inline Formatting & Colors & Alignments */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
        
        {/* Inline Formatting Buttons */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => exec("bold")}
            title="Bold (Ctrl+B)"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 font-bold transition-all"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("italic")}
            title="Italic (Ctrl+I)"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("underline")}
            title="Underline (Ctrl+U)"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("strikethrough")}
            title="Strikethrough"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => exec("justifyLeft")}
            title="Align Left"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("justifyCenter")}
            title="Align Center"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("justifyRight")}
            title="Align Right"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("justifyFull")}
            title="Justify"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Dividers */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => exec("insertUnorderedList")}
            title="Bulleted List"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertOrderedList")}
            title="Numbered List"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertHorizontalRule")}
            title="Insert Divider Rule"
            className="p-2 rounded-lg hover:bg-white hover:shadow-xs text-gray-700 transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Colors & Clear Format */}
        <div className="flex items-center gap-2">
          {/* Text Color Picker */}
          <label
            title="Text Color"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all text-xs font-bold text-gray-700"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            <input
              type="color"
              value={textColor}
              onChange={(e) => applyColor(e.target.value)}
              className="w-4 h-4 cursor-pointer border-none bg-transparent"
            />
          </label>

          {/* Highlight Color Picker */}
          <label
            title="Highlight Color"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all text-xs font-bold text-gray-700"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <input
              type="color"
              value={bgColor}
              onChange={(e) => applyHighlight(e.target.value)}
              className="w-4 h-4 cursor-pointer border-none bg-transparent"
            />
          </label>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => exec("removeFormat")}
            title="Clear Formatting"
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-100 transition-all text-xs font-bold"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

      </div>
    </div>
  );
};

export default WordFormattingToolbar;
