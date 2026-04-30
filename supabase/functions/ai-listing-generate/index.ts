// @ts-nocheck
// @ts-ignore: Deno is a global in the Supabase Edge Function environment
declare const Deno: any;

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("VITE_OPENROUTER_API_KEY") || "";

const systemPrompt = `
You are a professional marketplace expert. Your goal is to help users create high-quality listings by analyzing their images and descriptions.

When an image is provided:
1. Carefully analyze the image to identify the brand, model, color, condition, and key features of the product.
2. Generate an attractive, professional, and detailed "description" (at least 3-4 sentences). 
3. Highlight the selling points (e.g., "Sleek design," "Highly durable," "Professional grade").
4. If the image is a property (PG, Room, Flat), describe its ambiance, lighting, and possible amenities visible.

Extract and return the following fields:
- product_name (string: Catchy and concise)
- description (string: Professional and enhanced version based on image + user input)
- category: 
    - If property: (pg, room, flat, house, office, shop, warehouse)
    - If item: (electronics, vehicles, furniture, tools, sports, books, clothing, other)
- product_type (one of: rent, sale, both)
- rent_price (number: Extract amount, ignore currency)
- pin_code (string: 6 digits)
- address (string: Specific location if mentioned)
- phone (string: Contact number)

The user is listing a: {{LISTING_GROUP}}

If any critical info is missing, ask for it politely.

Return raw JSON only:
{
  "extracted_data": { ... },
  "next_question": "...",
  "is_complete": boolean
}
`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured (OPENROUTER_API_KEY missing)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { mode, description, imageBase64, imageMimeType, currentInput, extractedData, listingGroup } = body;

    const dynamicSystemPrompt = systemPrompt.replace("{{LISTING_GROUP}}", listingGroup || "item");

    if (!mode || (mode !== "initial" && mode !== "chat")) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let messages: any[] = [];
    let model = "google/gemini-2.0-flash-001";
    let useJsonFormat = true;

    if (mode === "initial") {
      if (!description) {
        return new Response(JSON.stringify({ error: "Description required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

        // Try vision model if image provided
        if (imageBase64 && imageMimeType) {
          model = "google/gemini-2.0-flash-001"; // Good vision support
          useJsonFormat = false; // JSON mode sometimes tricky with vision in initial prompt
          messages = [
            {
              role: "user",
              content: [
                { type: "text", text: dynamicSystemPrompt + `\nUser Description: "${description}"` },
                { type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
              ],
            },
          ];
        } else {
          messages = [
            { role: "system", content: dynamicSystemPrompt },
            { role: "user", content: `User Description: "${description}"` },
          ];
        }
    } else {
      // Chat mode
      if (!currentInput) {
        return new Response(JSON.stringify({ error: "Input required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prompt = `
        You are an AI assistant helping a user list an item.
        Current Extracted Data: ${JSON.stringify(extractedData || {})}
        The user just said: "${currentInput}"
        Update the extracted data based on the new input.
        If information is still missing (price, pin_code, phone, address, product_type), ask for it.
        IMPORTANT: 'rent_price' should be the price amount. If rent, per day. If sale, total price.
        Return JSON:
        {
          "extracted_data": { ...updated fields... },
          "next_question": "...",
          "is_complete": boolean
        }
        IMPORTANT: 'rent_price' must be a number. Do not include currency symbols.
      `;
      messages = [{ role: "user", content: prompt }];
    }

    const openRouterBody: any = {
      messages,
      model,
      temperature: 0.5,
      max_tokens: 1024,
    };
    if (useJsonFormat) {
      openRouterBody.response_format = { type: "json_object" };
    }

    let aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://allrentr.com", // Optional, for OpenRouter analytics
        "X-Title": "AllrentR AI Listing",
      },
      body: JSON.stringify(openRouterBody),
    });

    // Fallback to text-only if vision fails
    if (!aiResponse.ok && mode === "initial" && imageBase64) {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Description: "${description}"` },
      ];
      openRouterBody.messages = messages;
      openRouterBody.model = "google/gemini-2.0-flash-001";
      openRouterBody.response_format = { type: "json_object" };

      aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(openRouterBody),
      });
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenRouter API error:", errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const text = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
