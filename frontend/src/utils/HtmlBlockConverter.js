// HTML to Block List Parser & Serializer

// Generates a short unique ID for block mapping
export const generateBlockId = () => Math.random().toString(36).substr(2, 9);

/**
 * Parses raw HTML content into structured blocks for the editor.
 * Gracefully parses standard HTML tags (from legacy articles) and custom blocks.
 * @param {string} html 
 * @returns {Array} List of blocks
 */
export const parseHtmlToBlocks = (html) => {
  if (!html || !html.trim()) {
    return [{ id: generateBlockId(), type: "paragraph", data: { content: "" } }];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const blocks = [];

    const children = Array.from(doc.body.childNodes);

    for (let node of children) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          blocks.push({
            id: generateBlockId(),
            type: "paragraph",
            data: { content: node.textContent }
          });
        }
        continue;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      const tagName = node.tagName.toLowerCase();

      // Detect Custom Blocks by CSS class or attributes
      if (node.classList.contains("blog-callout") || node.getAttribute("data-block-type") === "callout") {
        blocks.push({
          id: generateBlockId(),
          type: "callout",
          data: {
            type: node.getAttribute("data-type") || "info",
            content: node.getAttribute("data-content") || node.querySelector(".callout-text")?.innerHTML || node.innerHTML
          }
        });
      } else if (node.classList.contains("blog-bookmark") || node.getAttribute("data-block-type") === "bookmark") {
        blocks.push({
          id: generateBlockId(),
          type: "bookmark",
          data: {
            url: node.getAttribute("data-url") || "",
            title: node.getAttribute("data-title") || "",
            description: node.getAttribute("data-description") || "",
            image: node.getAttribute("data-image") || "",
            domain: node.getAttribute("data-domain") || ""
          }
        });
      } else if (node.classList.contains("blog-toc") || node.getAttribute("data-block-type") === "toc") {
        blocks.push({
          id: generateBlockId(),
          type: "toc",
          data: {
            levels: (node.getAttribute("data-levels") || "h1,h2,h3,h4").split(",")
          }
        });
      } else if (node.classList.contains("blog-divider") || node.getAttribute("data-block-type") === "divider" || tagName === "hr") {
        blocks.push({
          id: generateBlockId(),
          type: "divider",
          data: {}
        });
      } else if (node.classList.contains("blog-embed") || node.getAttribute("data-block-type") === "embed") {
        blocks.push({
          id: generateBlockId(),
          type: "embed",
          data: {
            url: node.getAttribute("data-url") || "",
            embedType: node.getAttribute("data-embed-type") || "youtube"
          }
        });
      } else if (node.classList.contains("blog-image") || node.getAttribute("data-block-type") === "image" || tagName === "figure") {
        blocks.push({
          id: generateBlockId(),
          type: "image",
          data: {
            url: node.getAttribute("data-url") || node.querySelector("img")?.getAttribute("src") || "",
            alt: node.getAttribute("data-alt") || node.querySelector("img")?.getAttribute("alt") || "",
            caption: node.getAttribute("data-caption") || node.querySelector("figcaption")?.innerHTML || "",
            align: node.getAttribute("data-align") || "center",
            width: node.getAttribute("data-width") || "100%"
          }
        });
      } else if (node.classList.contains("blog-custom-html") || node.getAttribute("data-block-type") === "html") {
        const encodedCode = node.getAttribute("data-code");
        blocks.push({
          id: generateBlockId(),
          type: "html",
          data: {
            code: encodedCode ? decodeURIComponent(encodedCode) : node.innerHTML
          }
        });
      } else if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName[1]);
        blocks.push({
          id: generateBlockId(),
          type: "heading",
          data: {
            level,
            content: node.innerHTML,
            id: node.getAttribute("id") || ""
          }
        });
      } else if (tagName === "p") {
        // Look inside for embedded image fallback
        const img = node.querySelector("img");
        if (img && node.textContent.trim() === "") {
          blocks.push({
            id: generateBlockId(),
            type: "image",
            data: {
              url: img.getAttribute("src") || "",
              alt: img.getAttribute("alt") || "",
              caption: "",
              align: "center",
              width: "100%"
            }
          });
        } else {
          blocks.push({
            id: generateBlockId(),
            type: "paragraph",
            data: { content: node.innerHTML }
          });
        }
      } else if (tagName === "ul" || tagName === "ol") {
        const items = Array.from(node.querySelectorAll("li")).map(li => li.innerHTML);
        blocks.push({
          id: generateBlockId(),
          type: "list",
          data: {
            style: tagName === "ul" ? "bullet" : "ordered",
            items: items.length > 0 ? items : [""]
          }
        });
      } else if (tagName === "blockquote") {
        blocks.push({
          id: generateBlockId(),
          type: "blockquote",
          data: { content: node.innerHTML }
        });
      } else {
        // Unknown block tags fallback to paragraph
        blocks.push({
          id: generateBlockId(),
          type: "paragraph",
          data: { content: node.outerHTML }
        });
      }
    }

    if (blocks.length === 0) {
      blocks.push({ id: generateBlockId(), type: "paragraph", data: { content: "" } });
    }

    return blocks;
  } catch (error) {
    console.error("HtmlBlockConverter parse error:", error);
    return [{ id: generateBlockId(), type: "paragraph", data: { content: html } }];
  }
};

/**
 * Serializes the blocks back to standard HTML for the database.
 * Computes heading anchors dynamically.
 * @param {Array} blocks 
 * @returns {string} Raw HTML
 */
export const serializeBlocksToHtml = (blocks) => {
  if (!blocks || blocks.length === 0) return "";

  let html = "";

  // 1. Generate stable IDs for all headings
  const headingBlocks = blocks.filter(b => b.type === "heading" && b.data.content);
  const headingList = headingBlocks.map((h, i) => {
    const text = h.data.content.replace(/<[^>]+>/g, '').trim();
    let anchorId = h.data.id || text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!anchorId) anchorId = `section-${i}`;
    h.data.id = anchorId; // Mutate block data to ensure it's saved with ID
    return { tag: `h${h.data.level}`, text, id: anchorId };
  });

  // 2. Map blocks to HTML
  for (let block of blocks) {
    switch (block.type) {
      case "paragraph":
        html += `<p>${block.data.content}</p>`;
        break;
      case "heading":
        html += `<h${block.data.level} id="${block.data.id || ''}">${block.data.content}</h${block.data.level}>`;
        break;
      case "blockquote":
        html += `<blockquote>${block.data.content}</blockquote>`;
        break;
      case "divider":
        html += `<hr class="blog-divider my-6 border-slate-200" data-block-type="divider" />`;
        break;
      case "list":
        const tag = block.data.style === "bullet" ? "ul" : "ol";
        html += `<${tag}>${block.data.items.map(item => `<li>${item}</li>`).join("")}</${tag}>`;
        break;
      case "image":
        const alignStyles = block.data.align === "left" ? "my-4 float-left mr-6 max-w-xs text-left" : 
                            block.data.align === "right" ? "my-4 float-right ml-6 max-w-xs text-right" : 
                            block.data.align === "full" ? "my-6 w-full text-center" : "my-6 text-center";
        const imgStyles = block.data.align === "full" ? "rounded-2xl shadow-lg w-full h-auto object-cover" : "rounded-xl shadow-md max-w-full h-auto mx-auto";
        html += `
          <figure class="blog-image ${alignStyles}" data-block-type="image" data-url="${block.data.url}" data-alt="${block.data.alt}" data-caption="${block.data.caption}" data-align="${block.data.align}" data-width="${block.data.width || '100%'}" style="width: ${block.data.width || '100%'}">
            <img src="${block.data.url}" alt="${block.data.alt}" class="${imgStyles}" />
            ${block.data.caption ? `<figcaption class="text-xs text-gray-500 font-medium italic mt-2.5 px-2">${block.data.caption}</figcaption>` : ""}
          </figure>
        `;
        break;
      case "embed":
        let embedUrl = block.data.url;
        if (block.data.url.includes("youtube.com/watch")) {
          const videoId = new URL(block.data.url).searchParams.get("v");
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (block.data.url.includes("youtu.be/")) {
          const videoId = block.data.url.split("/").pop().split("?")[0];
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        
        html += `
          <div class="blog-embed my-6 text-center" data-block-type="embed" data-url="${block.data.url}" data-embed-type="${block.data.embedType || 'youtube'}">
            <iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="rounded-xl shadow-md"></iframe>
          </div>
        `;
        break;
      case "callout":
        const type = block.data.type || "info";
        let bgColor = "bg-sky-50 border-sky-450 text-sky-850";
        let icon = "💡";
        if (type === "tip") {
          bgColor = "bg-emerald-50 border-emerald-450 text-emerald-850";
          icon = "✨";
        } else if (type === "note") {
          bgColor = "bg-amber-50 border-amber-450 text-amber-850";
          icon = "📝";
        } else if (type === "warning") {
          bgColor = "bg-rose-50 border-rose-450 text-rose-850";
          icon = "⚠️";
        }
        html += `
          <div class="blog-callout ${bgColor} p-4 rounded-xl border-l-4 my-4" data-block-type="callout" data-type="${type}" data-content="${block.data.content}">
            <div class="flex items-start gap-3" style="display: flex; align-items: start; gap: 12px;">
              <span class="callout-icon" style="font-size: 1.25rem;">${icon}</span>
              <div class="callout-text" style="line-height: 1.6;">${block.data.content}</div>
            </div>
          </div>
        `;
        break;
      case "bookmark":
        html += `
          <div class="blog-bookmark border border-slate-200 rounded-2xl p-4 flex gap-4 my-4 bg-white shadow-xs" data-block-type="bookmark" data-url="${block.data.url}" data-title="${block.data.title}" data-description="${block.data.description}" data-image="${block.data.image}" data-domain="${block.data.domain}" style="display: flex; gap: 16px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 16px 0; background-color: #ffffff;">
            <div class="bookmark-content" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <h4 class="bookmark-title text-sm font-bold text-slate-900" style="margin: 0 0 6px 0; font-size: 0.875rem; font-weight: 700; color: #0f172a;">${block.data.title}</h4>
                <p class="bookmark-desc text-xs text-slate-500 line-clamp-2" style="margin: 0; font-size: 0.75rem; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${block.data.description}</p>
              </div>
              <span class="bookmark-url text-[10px] text-[#24672E] font-bold" style="font-size: 0.625rem; font-weight: 700; color: #24672E; margin-top: 8px;">${block.data.domain}</span>
            </div>
            ${block.data.image ? `<img src="${block.data.image}" class="bookmark-img w-24 h-24 object-cover rounded-xl" style="width: 96px; height: 96px; object-fit: cover; border-radius: 8px;" />` : ""}
          </div>
        `;
        break;
      case "toc":
        const allowedLevels = block.data.levels || ["h1", "h2", "h3", "h4"];
        const filteredHeadings = headingList.filter(h => allowedLevels.includes(h.tag));
        
        let tocHtml = `
          <div class="blog-toc my-6 p-6 bg-slate-50 border-l-4 border-[#24672E] rounded-2xl" data-block-type="toc" data-levels="${allowedLevels.join(",")}" style="background-color: #fafafa; border: 1px solid #e2e8f0; border-left: 4px solid #24672E; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;">
            <div class="flex items-center gap-2 mb-3.5" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24672E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              <h4 class="text-slate-900 font-extrabold text-base uppercase tracking-wider" style="color: #0f172a; font-weight: 800; margin: 0; font-size: 1rem;">Table of Contents</h4>
            </div>
            <ul class="space-y-2.5" style="list-style-type: none; padding-left: 0; margin: 0;">
        `;

        filteredHeadings.forEach((item) => {
          let inlineStyle = "padding-left: 0px; font-weight: 700;";
          if (item.tag === "h2") {
            inlineStyle = "padding-left: 12px; font-weight: 600; color: #475569;";
          } else if (item.tag === "h3") {
            inlineStyle = "padding-left: 24px; font-weight: 500; color: #64748b; font-size: 0.875rem;";
          } else if (item.tag === "h4") {
            inlineStyle = "padding-left: 36px; font-weight: 400; color: #94a3b8; font-size: 0.75rem;";
          }

          tocHtml += `
            <li style="${inlineStyle} margin-top: 6px;">
              <a href="#${item.id}" style="color: #24672E; text-decoration: none; border-bottom: 1px dashed transparent;">
                ${item.text}
              </a>
            </li>
          `;
        });

        tocHtml += `
            </ul>
          </div>
        `;
        
        html += tocHtml;
        break;
      case "html":
        html += `<div class="blog-custom-html" data-block-type="html" data-code="${encodeURIComponent(block.data.code)}">${block.data.code}</div>`;
        break;
      default:
        break;
    }
  }

  return html;
};
