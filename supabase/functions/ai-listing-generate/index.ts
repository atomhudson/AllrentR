import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";

const systemPrompt = `
You are an AI assistant helping a user list an item for rent or sale on a marketplace.
Your goal is to extract the following information to populate a listing form:
- product_name (string)
- description (string, enhanced version of user input)
- category (one of: electronics, vehicles, furniture, tools, sports, books, clothing, other)
- product_type (one of: rent, sale, both)
- rent_price (number, the price amount. If rent, per day. If sale, total price)
- pin_code (string, 6 digits)
- address (string)
- phone (string)

If any critical information is missing (especially price, location/pin_code, phone, product type), ask the user for it in a conversational way.

Return your response in this JSON format (do not use markdown code blocks, just raw JSON):
{
  "extracted_data": {
    "product_name": "...",
    "description": "...",
    "category": "one of: electronics, vehicles, furniture, tools, sports, books, clothing, other",
    "product_type": "one of: rent, sale, both",
    "rent_price": 0,
    "pin_code": "...",
    "address": "...",
    "phone": "..."
  },
  "next_question": "Your question here if info is missing, else null",
  "is_complete": boolean (true if all necessary info is gathered)
}
IMPORTANT: 'rent_price' must be a number (e.g. 500). Do not include currency symbols or text.
`;

Deno.serve(async (req) => {
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

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { mode, description, imageBase64, imageMimeType, currentInput, extractedData } = body;

    if (!mode || (mode !== "initial" && mode !== "chat")) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let messages: any[] = [];
    let model = "llama-3.3-70b-versatile";
    let useJsonFormat = true;

    if (mode === "initial") {
      if (!description) {
        return new Response(JSON.stringify({ error: "Description required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Try vision model first if image provided
      if (imageBase64 && imageMimeType) {
        model = "llama-3.2-90b-vision-preview";
        useJsonFormat = false;
        messages = [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt + `\nUser Description: "${description}"` },
              { type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
            ],
          },
        ];
      } else {
        messages = [
          { role: "system", content: systemPrompt },
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

    const groqBody: any = {
      messages,
      model,
      temperature: 0.5,
      max_tokens: 1024,
    };
    if (useJsonFormat) {
      groqBody.response_format = { type: "json_object" };
    }

    let groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqBody),
    });

    // Fallback to text-only if vision fails
    if (!groqResponse.ok && mode === "initial" && imageBase64) {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Description: "${description}"` },
      ];
      groqBody.messages = messages;
      groqBody.model = "llama-3.3-70b-versatile";
      groqBody.response_format = { type: "json_object" };

      groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groqBody),
      });
    }

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqData = await groqResponse.json();
    const text = groqData.choices?.[0]?.message?.content || "";

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
