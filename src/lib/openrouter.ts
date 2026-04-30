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
          content: "You are an expert SEO strategist, content writer, and Google ranking specialist. Return responses ONLY in valid JSON format."
        },
        {
          role: "user",
          content: `Act as an expert SEO strategist. Create a HIGH-RANKING BLOG POST using EEAT (Experience, Expertise, Authority, Trust), AEO (Answer Engine Optimization), and GRO (Generative Result Optimization).

          Topic: ${topic}
          Category: ${niche}
          Target Audience: INTERMEDIATE
          Tone: Professional, authoritative, and engaging English (Optimized for global ranking).

          Requirements:
          1. SHORT DESCRIPTION (max 500 characters) - highly engaging and click-worthy.
          2. MAIN BLOG CONTENT with HTML tags (h2, h3, p, ul, strong).
          3. Use a professional and authoritative English tone.
          4. Include real-life examples, case studies, and statistics.
          5. Use premium shortcodes: [[FAQ|||...]], [[STAT|||...]], [[CONCLUSION|||...]].
          6. IMPORTANT for CONCLUSION: Wrap the final summary/closing thoughts in [[CONCLUSION|||...]] shortcode.
          7. IMPORTANT for FAQ: Generate 5 SEPARATE FAQ shortcodes at the very end (after conclusion). 
             Format: [[FAQ|||Question|||Answer]]. Keep questions to 1 line and answers to 2-3 lines.
          8. IMPORTANT for STAT: Use [[STAT|||Title|||Value|||Subtitle]] for data points, or [[STAT|||Long insight text]] for facts.
          9. Order: Main Content -> Conclusion Shortcode -> FAQ Shortcodes.
          10. Provide 10-12 tags and 10-15 meta keywords.

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
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const cleanText = jsonMatch ? jsonMatch[0] : content.replace(/```json|```/g, "").trim();

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
          {
            role: "system",
            content: "You are an Expert SEO specialist. Improve this blog content. Return ONLY the improved HTML content without any conversational filler or markdown blocks."
          },
          {
            role: "user",
            content: `Improve this blog content using EEAT and AEO best practices. 
            - Ensure clear heading hierarchy (h2, h3).
            - Use a professional and engaging English tone.
            - Optimize for Google ranking.
            - Ensure any existing shortcodes [[FAQ|||...]], [[STAT|||...]] are preserved or improved.
            - IMPORTANT: Always use SEPARATE shortcodes for each FAQ item: [[FAQ|||Question|||Answer]].
            - Keep FAQ questions to 1 line and answers to 2-3 lines.
            - Place the FAQ section at the end if not already there.
            
            Return ONLY the HTML content:
            
            ${content}`
          }
        ]
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) return content;

    const rawContent = data.choices[0].message.content;
    // Extract HTML if AI wrapped it in markdown code blocks
    const htmlMatch = rawContent.match(/<[\s\S]*>/);
    if (htmlMatch) {
      return htmlMatch[0];
    }

    return rawContent.replace(/```html|```/g, "").trim();
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
          { role: "system", content: "Find 6 trending topics in India. Return ONLY a JSON array of objects with 'title' and 'category' keys. Example: [{\"title\": \"...\", \"category\": \"...\"}]. English only." },
          { role: "user", content: "Fetch 6 trends for India today." }
        ]
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) return fallbackTrends;

    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const cleanText = jsonMatch ? jsonMatch[0] : content.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleanText);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackTrends;
  } catch (e) {
    console.error("Trending topics parse error:", e);
    return fallbackTrends;
  }
};

export const generateComponentContent = async (type: 'FAQ' | 'STAT', topic: string) => {
  const apiKey = getOpenRouterKey();

  const prompts = {
    FAQ: `Generate a single relevant FAQ item (Question and Answer) for: ${topic}. Format: Question 1 line, Answer 2-3 lines. Return JSON: {"question": "...", "answer": "..."}. Do NOT include Q: or A: prefixes.`,
    STAT: `Generate a relevant statistic for: ${topic}. Return JSON: {"title": "...", "value": "...", "subtitle": "..."}. If it's a long fact, put it in 'value'.`
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a content assistant. Return ONLY valid JSON. Use STRICTLY ENGLISH." },
        {
          role: "user",
          content: prompts[type as keyof typeof prompts]
        }
      ]
    })
  });

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) throw new Error("AI failed to generate component");

  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const cleanText = jsonMatch ? jsonMatch[0] : content.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("Invalid format");
  }
};

export const importBlogFromText = async (rawText: string) => {
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
          role: "system",
          content: "You are a content structured tool. You take raw text and convert it into a professional, structured blog post with SEO fields. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: `Convert this raw text into a high-quality, SEO-optimized blog post structure. 
          - Structure the content using proper HTML (h2, h3, p, strong).
          - Add relevant premium shortcodes [[FAQ|||...]], [[STAT|||...]], [[CONCLUSION|||...]].
          - Extract a compelling title and description.
          - Generate relevant tags and meta keywords.
          - Ensure the tone is professional English.

          Raw Text:
          ${rawText}

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
  if (!data.choices || data.choices.length === 0) throw new Error("AI failed to process text.");

  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const cleanText = jsonMatch ? jsonMatch[0] : content.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("AI returned invalid format.");
  }
};

export const findResourcesForBlog = async (topic: string, content: string) => {
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
          role: "system",
          content: "You are a research assistant. Find related links, image search terms, and reference materials for a blog post. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: `Find high-quality resources for this blog.
          Topic: ${topic}
          Content: ${content.substring(0, 1000)}...

          Return JSON format:
          {
            "reference_links": [
              {"title": "...", "url": "..."},
              ...
            ],
            "image_suggestions": [
              {"description": "...", "search_term": "..."},
              ...
            ],
            "additional_resources": ["...", "..."]
          }`
        }
      ]
    })
  });

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) throw new Error("AI failed to find resources.");

  const jsonContent = data.choices[0].message.content;
  const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
  const cleanText = jsonMatch ? jsonMatch[0] : jsonContent.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("Invalid resource format");
  }
};
