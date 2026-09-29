import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Auto-detect AI provider based on environment variables and API key formats.
 * Supports:
 * - Google Gemini (100% Free via Google AI Studio / Gemini API)
 * - Groq (100% Free via console.groq.com)
 * - OpenAI (Paid API)
 */
const getApiConfig = () => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Google Gemini (Detected by GEMINI_API_KEY or key prefix "AQ." / "AIza")
  if (geminiKey || (openAiKey && (openAiKey.startsWith("AQ.") || openAiKey.startsWith("AIza")))) {
    return {
      provider: "gemini",
      apiKey: geminiKey || openAiKey,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      models: ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite"],
    };
  }

  // 2. Groq Cloud (Detected by GROQ_API_KEY or key prefix "gsk_")
  if (groqKey || (openAiKey && openAiKey.startsWith("gsk_"))) {
    return {
      provider: "groq",
      apiKey: groqKey || openAiKey,
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
      models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    };
  }

  // 3. OpenAI Default
  if (openAiKey) {
    return {
      provider: "openai",
      apiKey: openAiKey,
      baseUrl: "https://api.openai.com/v1/chat/completions",
      models: ["gpt-4o-mini", "gpt-3.5-turbo"],
    };
  }

  return null;
};

/**
 * Clean markdown code blocks from model JSON output
 */
const cleanJson = (str) => {
  if (!str) return "{}";
  let cleaned = str.trim();
  const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlock) {
    cleaned = jsonBlock[1].trim();
  }
  return cleaned;
};

export const callAI = async (messages, responseFormat = null) => {
  const config = getApiConfig();
  if (!config || !config.apiKey) {
    throw new Error(
      "AI API Key is not configured. Please define GEMINI_API_KEY or OPENAI_API_KEY in the backend .env file."
    );
  }

  let lastError = null;

  for (const model of config.models) {
    const payload = {
      model,
      messages,
      temperature: 0.7,
    };

    if (responseFormat) {
      payload.response_format = responseFormat;
    }

    try {
      const response = await axios.post(config.baseUrl, payload, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 45000,
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (error) {
      console.warn(`[AI Service] Model ${model} failed (${error.response?.data?.error?.message || error.message}). Attempting fallback...`);
      lastError = error;
    }
  }

  console.error("[AI Service] All model attempts failed:", lastError?.response?.data || lastError?.message);
  throw new Error(lastError?.response?.data?.error?.message || lastError?.message || "Failed to generate AI content");
};

// Backwards compatibility alias
const callOpenAI = callAI;

export const generateOutline = async ({ title, focusKeyword, description, content }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert blog content strategist. Return a JSON object with a single key 'sections' containing an array of objects. Each object must have a 'heading' string and a 'description' string suggesting what to cover in that section. Do not include markdown tags. Output pure valid JSON.",
    },
    {
      role: "user",
      content: `Generate a detailed blog post outline for:\nTitle: ${title}\nPrimary Keyword: ${focusKeyword || "N/A"}\nMeta Description: ${description || "N/A"}\nExisting Context: ${content || "None"}`,
    },
  ];

  const contentStr = await callAI(messages, { type: "json_object" });
  return JSON.parse(cleanJson(contentStr));
};

export const generateFAQ = async ({ title, focusKeyword, content }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert copywriter. Return a JSON object with a single key 'faqs' containing an array of objects. Each object must have a 'question' string and an 'answer' string. Keep answers concise and informative. Output pure valid JSON.",
    },
    {
      role: "user",
      content: `Create FAQs for an article about:\nTitle: ${title}\nKeyword: ${focusKeyword || "N/A"}\nExisting Content: ${content || "N/A"}`,
    },
  ];

  const contentStr = await callAI(messages, { type: "json_object" });
  return JSON.parse(cleanJson(contentStr));
};

export const generateSEOBrief = async ({ title, focusKeyword }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert SEO analyst. Return a JSON object containing the keys: 'targetAudience' (string), 'recommendedLength' (string), 'topicOverview' (string), 'headingsSuggestion' (array of strings), and 'keyPhrases' (array of strings indicating secondary keywords). Return pure valid JSON.",
    },
    {
      role: "user",
      content: `Perform SEO analysis and generate a brief for:\nTitle: ${title}\nFocus Keyword: ${focusKeyword}`,
    },
  ];

  const contentStr = await callAI(messages, { type: "json_object" });
  return JSON.parse(cleanJson(contentStr));
};

export const generateKeywordIdeas = async ({ title, focusKeyword }) => {
  const messages = [
    {
      role: "system",
      content: "You are an SEO keywords researcher. Return a JSON object with a single key 'keywords' containing an array of strings representing secondary keywords or related search queries. Return pure valid JSON.",
    },
    {
      role: "user",
      content: `Provide 8-10 related keyword ideas for:\nPrimary Keyword: ${focusKeyword || "N/A"}\nTitle Context: ${title}`,
    },
  ];

  const contentStr = await callAI(messages, { type: "json_object" });
  return JSON.parse(cleanJson(contentStr));
};

export const generateBlogPost = async ({ title, focusKeyword, description, content, prompt }) => {
  const messages = [
    {
      role: "system",
      content: "You are a professional SEO copywriter. Write a full, detailed blog post in clean HTML format. Use standard heading tags (h2, h3), paragraph tags (p), bold, lists (ul/ol), and blockquotes. Do not wrap the output in a markdown block. Do not include html, head, or body tags, just the inner body HTML.",
    },
    {
      role: "user",
      content: `Write an article based on the following:\nTitle: ${title}\nFocus Keyword: ${focusKeyword || "N/A"}\nMeta description: ${description || "N/A"}\nExisting content draft: ${content || "None"}\nAdditional Instructions/Instructions Prompt: ${prompt || "None"}`,
    },
  ];

  return await callAI(messages);
};

export const generateArticle = async ({ title, focusKeyword, description, content, prompt }) => {
  return await generateBlogPost({ title, focusKeyword, description, content, prompt });
};

export const rewriteText = async ({ text, tone = "professional" }) => {
  const messages = [
    {
      role: "system",
      content: `You are an expert editor. Rewrite the provided text in a ${tone} tone. Keep HTML tags intact if present. Return ONLY the rewritten text.`,
    },
    {
      role: "user",
      content: `Text to rewrite:\n${text}`,
    },
  ];

  return await callAI(messages);
};

export const improveText = async ({ text }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert editor. Improve the readability, flow, grammar, and style of the provided text. Keep HTML tags intact if present. Return ONLY the improved text.",
    },
    {
      role: "user",
      content: `Text to improve:\n${text}`,
    },
  ];

  return await callAI(messages);
};

export const expandText = async ({ text }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert content writer. Expand the provided text by adding more descriptive details, context, and depth, while maintaining the original meaning. Keep HTML tags intact if present. Return ONLY the expanded text.",
    },
    {
      role: "user",
      content: `Text to expand:\n${text}`,
    },
  ];

  return await callAI(messages);
};

export const shortenText = async ({ text }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert editor. Shorten and condense the provided text, removing fluff while retaining core information. Keep HTML tags intact if present. Return ONLY the condensed text.",
    },
    {
      role: "user",
      content: `Text to condense:\n${text}`,
    },
  ];

  return await callAI(messages);
};

export const generateMetaDescription = async ({ title, content }) => {
  const messages = [
    {
      role: "system",
      content: "You are an SEO specialist. Generate a compelling meta description under 160 characters for the provided blog title and content. Do not use quotes or formatting. Return ONLY the description text.",
    },
    {
      role: "user",
      content: `Title: ${title}\nContent excerpts: ${content ? content.slice(0, 1000) : "N/A"}`,
    },
  ];

  return await callAI(messages);
};

export const generateProductContent = async ({ name, category, keyBenefits }) => {
  const messages = [
    {
      role: "system",
      content: `You are an expert e-commerce copywriter specializing in cold-pressed natural oils, organic food, and wellness products. Return a pure JSON object with the following keys:
- "shortDesc": A punchy 1-2 sentence highlight for the product card (max 140 chars).
- "description": A detailed, high-converting product description (2-3 paragraphs) highlighting extraction technique (wood pressed / kacchi ghani), aroma, culinary and wellness benefits, smoke point, and purity.
Do not wrap output in markdown fences. Output pure valid JSON.`,
    },
    {
      role: "user",
      content: `Product Name: ${name}\nCategory: ${category || "Cold Pressed Oils"}\nKey Attributes: ${keyBenefits || "100% natural, traditional wood pressed, unrefined, chemical-free"}`,
    },
  ];

  const contentStr = await callAI(messages, { type: "json_object" });
  return JSON.parse(cleanJson(contentStr));
};

