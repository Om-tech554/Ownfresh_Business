import React, { useState, useEffect } from "react";
import { BookOpen, Plus, List, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

/**
 * TableOfContentsInserter
 * Placed on the LEFT side of the Blog Editor.
 * Scans headings from Jodit instance directly, adds unique anchor IDs,
 * and inserts a beautifully styled TOC container into the editor.
 */
const TableOfContentsInserter = ({ editorRef, description, setDescription }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState([]);

  // Parse headings from the Jodit instance directly
  const refreshHeadings = () => {
    let currentHtml = description || "";
    if (editorRef?.current) {
      const jodit = editorRef.current;
      currentHtml = jodit.value || jodit.editor?.value || "";
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHtml, "text/html");
      const headingElements = Array.from(doc.querySelectorAll("h1, h2, h3, h4"));
      const list = headingElements.map((h, index) => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent.trim(),
        originalId: h.getAttribute("id") || "",
        index
      })).filter(h => h.text.length > 0);

      setHeadings(list);
      return list;
    } catch (err) {
      console.error("Error parsing headings:", err);
      return [];
    }
  };

  // Poll for headings preview when TOC tool is open
  useEffect(() => {
    if (isOpen) {
      refreshHeadings();
      const interval = setInterval(refreshHeadings, 1500);
      return () => clearInterval(interval);
    }
  }, [isOpen, description]);

  const insertTOC = () => {
    const latestHeadings = refreshHeadings();
    if (latestHeadings.length === 0) {
      toast.error("No headings (H1, H2, H3, H4) found in content! Add headings first.");
      return;
    }

    let currentHtml = description || "";
    if (editorRef?.current) {
      currentHtml = editorRef.current.value || "";
    }

    try {
      // 1. Parse current description and add anchor IDs to headings
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHtml, "text/html");
      const headingElements = Array.from(doc.querySelectorAll("h1, h2, h3, h4"));

      const tocItems = [];

      headingElements.forEach((h, i) => {
        const text = h.textContent.trim();
        if (!text) return;

        // Generate clean anchor ID if missing
        let anchorId = h.getAttribute("id");
        if (!anchorId) {
          anchorId = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

          if (!anchorId) anchorId = `section-${i}`;
          h.setAttribute("id", anchorId);
        }

        tocItems.push({
          tag: h.tagName.toLowerCase(),
          text,
          id: anchorId
        });
      });

      // Update the main description HTML with the updated headings (containing IDs)
      const updatedDescription = doc.body.innerHTML;

      // 2. Generate TOC HTML block
      let tocHtml = `
        <div class="toc-container my-8 p-6 bg-slate-50 border-2 border-[#EFDB27]/40 rounded-2xl shadow-xs" style="background-color: #fafafa; border: 1px solid #e2e8f0; border-left: 4px solid #24672E; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;">
          <div class="flex items-center gap-2 mb-3.5" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24672E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            <h4 class="text-slate-900 font-extrabold text-base uppercase tracking-wider" style="color: #0f172a; font-weight: 800; margin: 0; font-size: 1rem;">Table of Contents</h4>
          </div>
          <ul class="space-y-2.5" style="list-style-type: none; padding-left: 0; margin: 0;">
      `;

      tocItems.forEach((item) => {
        let paddingClass = "pl-0 font-bold";
        let inlineStyle = "padding-left: 0px; font-weight: 700;";
        if (item.tag === "h2") {
          paddingClass = "pl-3 font-semibold text-slate-700";
          inlineStyle = "padding-left: 12px; font-weight: 600; color: #475569;";
        } else if (item.tag === "h3") {
          paddingClass = "pl-6 text-slate-600 text-xs";
          inlineStyle = "padding-left: 24px; font-weight: 500; color: #64748b; font-size: 0.875rem;";
        } else if (item.tag === "h4") {
          paddingClass = "pl-9 text-slate-500 text-[11px]";
          inlineStyle = "padding-left: 36px; font-weight: 400; color: #94a3b8; font-size: 0.75rem;";
        }

        tocHtml += `
          <li class="${paddingClass}" style="${inlineStyle} margin-top: 6px;">
            <a href="#${item.id}" style="color: #24672E; text-decoration: none; border-bottom: 1px dashed transparent;" onmouseover="this.style.borderBottom='1px dashed #24672E'" onmouseout="this.style.borderBottom='none'">
              ${item.text}
            </a>
          </li>
        `;
      });

      tocHtml += `
          </ul>
        </div>
        <p><br/></p>
      `;

      // 3. Insert TOC HTML into editor
      if (editorRef?.current) {
        const jodit = editorRef.current;
        let inserted = false;

        try {
          if (typeof jodit.selection?.insertHTML === "function") {
            jodit.selection.insertHTML(tocHtml);
            inserted = true;
          } else if (jodit.editor && typeof jodit.editor.selection?.insertHTML === "function") {
            jodit.editor.selection.insertHTML(tocHtml);
            inserted = true;
          } else if (typeof jodit.execCommand === "function") {
            jodit.execCommand("insertHTML", false, tocHtml);
            inserted = true;
          }
        } catch (selErr) {
          console.warn("Selection insert failed, falling back to direct value update:", selErr);
        }

        if (!inserted) {
          // Fallback: prepend TOC to the content
          jodit.value = tocHtml + updatedDescription;
          setDescription(jodit.value);
        } else {
          // Jodit insertion updates Jodit value, sync with React state
          setDescription(jodit.value);
        }

        toast.success("Table of Contents inserted successfully!");
        setIsOpen(false);
      } else {
        toast.error("Editor reference not loaded yet.");
      }
    } catch (err) {
      console.error("Failed to insert TOC:", err);
      toast.error("Could not insert Table of Contents.");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Table of Contents Tool
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Create a jump-link navigation block from article headings
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            if (nextOpen) refreshHeadings();
          }}
          className="flex items-center gap-1.5 bg-[#EFDB27] text-black px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] tracking-wider hover:bg-black hover:text-white transition-all"
        >
          <List className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          {isOpen ? "Hide List" : "View TOC Preview"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Found Headings Preview ({headings.length})
              </span>
              <button
                type="button"
                onClick={refreshHeadings}
                className="text-[9px] font-bold text-[#24672E] flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Refresh
              </button>
            </div>

            {headings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No headings found in editor yet. Use Heading tags (H1, H2, H3, H4) in your article to generate a Table of Contents.
              </p>
            ) : (
              <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {headings.map((h, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-700 flex items-center gap-2 font-medium"
                    style={{ paddingLeft: `${(parseInt(h.tag[1]) - 1) * 8}px` }}
                  >
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 shrink-0">
                      {h.tag}
                    </span>
                    <span className="truncate">{h.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={insertTOC}
            disabled={headings.length === 0}
            className="w-full bg-slate-900 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#24672E] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Generate & Insert Table of Contents
          </button>
        </div>
      )}
    </div>
  );
};

export default TableOfContentsInserter;
