import axios from "axios";

const getApiKey = () => {
  return process.env.OPENAI_API_KEY;
};

const callOpenAI = async (messages, responseFormat = null) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OpenAI API Key is not configured. Please define OPENAI_API_KEY in the backend .env file.");
  }

  const payload = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 45000, // 45 seconds timeout
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }
    throw new Error("Invalid response received from OpenAI API");
  } catch (error) {
    console.error("OpenAI API Call Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
};

export const generateOutline = async ({ title, focusKeyword, description, content }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert blog content strategist. Return a JSON object with a single key 'sections' containing an array of objects. Each object must have a 'heading' string and a 'description' string suggesting what to cover in that section. Do not include any markdown format tags like ```json in the output. The response must be pure JSON.",
    },
    {
      role: "user",
      content: `Generate a detailed blog post outline for:\nTitle: ${title}\nPrimary Keyword: ${focusKeyword || "N/A"}\nMeta Description: ${description || "N/A"}\nExisting Context: ${content || "None"}`,
    },
  ];

  const contentStr = await callOpenAI(messages, { type: "json_object" });
  return JSON.parse(contentStr);
};

export const generateFAQ = async ({ title, focusKeyword, content }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert copywriter. Return a JSON object with a single key 'faqs' containing an array of objects. Each object must have a 'question' string and an 'answer' string. Keep answers concise and informative. The response must be pure JSON, no formatting marks.",
    },
    {
      role: "user",
      content: `Create FAQs for an article about:\nTitle: ${title}\nKeyword: ${focusKeyword || "N/A"}\nExisting Content: ${content || "N/A"}`,
    },
  ];

  const contentStr = await callOpenAI(messages, { type: "json_object" });
  return JSON.parse(contentStr);
};

export const generateSEOBrief = async ({ title, focusKeyword }) => {
  const messages = [
    {
      role: "system",
      content: "You are an expert SEO analyst. Return a JSON object containing the keys: 'targetAudience' (string), 'recommendedLength' (string), 'topicOverview' (string), 'headingsSuggestion' (array of strings), and 'keyPhrases' (array of strings indicating secondary keywords). Return pure JSON.",
    },
    {
      role: "user",
      content: `Perform SEO analysis and generate a brief for:\nTitle: ${title}\nFocus Keyword: ${focusKeyword}`,
    },
  ];

  const contentStr = await callOpenAI(messages, { type: "json_object" });
  return JSON.parse(contentStr);
};

export const generateKeywordIdeas = async ({ title, focusKeyword }) => {
  const messages = [
    {
      role: "system",
      content: "You are an SEO keywords researcher. Return a JSON object with a single key 'keywords' containing an array of strings representing secondary keywords or related search queries. Return pure JSON.",
    },
    {
      role: "user",
      content: `Provide 8-10 related keyword ideas for:\nPrimary Keyword: ${focusKeyword || "N/A"}\nTitle Context: ${title}`,
    },
  ];

  const contentStr = await callOpenAI(messages, { type: "json_object" });
  return JSON.parse(contentStr);
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

  return await callOpenAI(messages);
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

  return await callOpenAI(messages);
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

  return await callOpenAI(messages);
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

  return await callOpenAI(messages);
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

  return await callOpenAI(messages);
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

  return await callOpenAI(messages);
};
