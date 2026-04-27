import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const generateBlogContent = async (topic: string, niche: string) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    You are an expert SEO blog writer. Generate a high-quality, engaging, and SEO-optimized blog post based on the following details:
    Topic: ${topic}
    Niche/Category: ${niche}

    Please provide the response in a valid JSON format with the following structure:
    {
      "title": "A catchy and SEO-friendly title",
      "description": "A short, engaging description (150-160 characters)",
      "content": "Full blog content in HTML format. Use proper headings (h2, h3), lists, and paragraphs. Include an introduction, main body, and conclusion.",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "seo_title": "SEO optimized title for search engines",
      "meta_description": "Compelling meta description for search results",
      "reading_time": 5
    }

    Ensure the content is informative, adds value, and uses keywords naturally.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean the response if it contains markdown code blocks
  const cleanText = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanText);
};

export const improveSEO = async (content: string) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    You are an SEO expert. Improve the following blog content for better search engine rankings.
    - Optimize heading structure.
    - Ensure keyword density is balanced.
    - Improve readability and engagement.
    - Add a FAQ section at the end if not present.
    - Return the full improved content in HTML format.

    Content:
    ${content}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
export const generateComponentContent = async (type: 'FAQ' | 'STAT' | 'TIMELINE', topic: string) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompts = {
    FAQ: `Generate a relevant FAQ item (Question and Answer) for a blog post about: ${topic}. 
          Return JSON: {"question": "...", "answer": "..."}`,
    STAT: `Generate a relevant statistic (Title, Value, Subtitle) for a blog post about: ${topic}. 
           Return JSON: {"title": "...", "value": "...", "subtitle": "..."}`,
    TIMELINE: `Generate a relevant historical or future timeline event (Year, Event) for a blog post about: ${topic}. 
               Return JSON: {"year": "...", "event": "..."}`
  };

  const result = await model.generateContent(prompts[type]);
  const response = await result.response;
  const cleanText = response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(cleanText);
};
export const getTrendingTopics = async () => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // Improved prompt to force Gemini to think about real-time events
  const prompt = `
    Find 6 currently VIRAL and TRENDING topics in India right now related to:
    1. Real Estate & Rental Market (e.g., specific city price hikes, new laws)
    2. Property Investment
    3. Home Decor/Improvement trends in 2026
    4. Relocation/Packers & Movers news
    
    Research what people are talking about on Reddit (r/india, r/bangalore, etc.) and Google Trends TODAY.
    
    Return ONLY a valid JSON array:
    [
      {"title": "Viral Topic Title", "category": "Category"},
      ...
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Trends Error:", error);
    // Fallback topics if API fails
    return [
      { "title": "Rising Rental Costs in Mumbai Suburbs", "category": "Market Trends" },
      { "title": "How to Save on Security Deposits in 2026", "category": "Legal" },
      { "title": "Top 5 Emerging Localities in Bangalore for Bachelors", "category": "Properties" },
      { "title": "Sustainable Home Decor Trends for Indian Summer", "category": "Lifestyle" },
      { "title": "New RERA Guidelines Every Tenant Should Know", "category": "Legal" }
    ];
  }
};

export const generateAIImage = (prompt: string) => {
  // Using Pollinations AI for free image generation
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
};
