const getOpenRouterKey = () => {
  const keys = [
    import.meta.env.VITE_OPENROUTER_API_KEY,
    import.meta.env.VITE_OPENROUTER_API_KEY_2,
    import.meta.env.VITE_OPENROUTER_API_KEY_3,
    import.meta.env.VITE_OPENROUTER_API_KEY_4
  ].filter(Boolean);

  if (keys.length === 0) throw new Error("No OpenRouter API Keys found.");
  // Pick a random key from the available ones
  return keys[Math.floor(Math.random() * keys.length)];
};

const MODEL_NAME = "inclusionai/ling-2.6-1t:free";

export const generateBlogContent = async (topic: string, niche: string) => {
  const apiKey = getOpenRouterKey();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "AllRentr Admin"
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are an expert SEO strategist. Return responses ONLY in valid JSON format. Language must be STRICTLY PROFESSIONAL ENGLISH."
        },
        {
          role: "user",
          content: `Act as an expert SEO strategist. Create a HIGH-RANKING BLOG POST using EEAT, AEO, and SEO best practices. 
          
          Topic: ${topic}
          Language: STRICTLY ENGLISH (No Hinglish, no Hindi)
          Target Audience: INTERMEDIATE
          Primary Keyword: ${topic}
          
          Requirements:
          1. SHORT DESCRIPTION (max 500 characters).
          2. MAIN BLOG CONTENT with HTML tags.
          3. Use premium shortcodes: [[FAQ|||...]], [[STAT|||...]], [[TIMELINE|||...]].
          4. Professional English tone.
          5. 10-12 tags and 10-15 meta keywords.

          Return JSON format:
          {
            "title": "...",
            "description": "...",
            "content": "...",
            "tags": [...],
            "seo_title": "...",
            "meta_description": "...",
            "meta_keywords": "...",
            "reading_time": 5
          }`
        }
      ]
    })
  });

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    const errorMsg = data.error?.message || "AI failed to respond. Please check your API key or balance.";
    throw new Error(errorMsg);
  }

  const content = data.choices[0].message.content;
  const cleanText = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("AI returned invalid format.");
  }
};

export const improveSEO = async (content: string) => {
  const apiKey = getOpenRouterKey();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: "You are an SEO expert. Improve this HTML. Use ONLY ENGLISH." },
          { role: "user", content: `Improve this blog content in English: ${content}` }
        ]
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) return content;
    return data.choices[0].message.content;
  } catch (e) {
    return content;
  }
};

export const getTrendingTopics = async () => {
  const apiKey = getOpenRouterKey();

  const fallbackTrends = [
    { title: "IPL 2024: DC vs RCB Match Highlights", category: "Sports" },
    { title: "T20 World Cup 2024 India Squad Analysis", category: "Cricket" },
    { title: "Best Budget Smartphones under 20000 in India", category: "Tech" },
    { title: "Latest Bollywood News: Upcoming Movie Trailers", category: "Entertainment" }
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: "Find 6 trending topics in India. English only. Return JSON array." },
          { role: "user", content: "Fetch 6 trends for India today." }
        ]
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) return fallbackTrends;
    
    const content = data.choices[0].message.content;
    const cleanText = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);
    return parsed.length > 0 ? parsed : fallbackTrends;
  } catch (e) {
    return fallbackTrends;
  }
};

export const generateComponentContent = async (type: 'FAQ' | 'STAT' | 'TIMELINE', topic: string) => {
  const apiKey = getOpenRouterKey();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: "user",
          content: `Generate a ${type} for the topic: ${topic}. USE STRICTLY ENGLISH. Return ONLY JSON.`
        }
      ]
    })
  });

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) throw new Error("AI failed to generate component");
  
  const content = data.choices[0].message.content;
  const cleanText = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("Invalid format");
  }
};
