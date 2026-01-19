import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete expired verifications
    const { data: expiredVerifications, error: fetchError } = await supabase
      .from("item_verifications")
      .select("id, images, video_url")
      .lt("expires_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    let deletedCount = 0;

    for (const verification of expiredVerifications || []) {
      // Delete images from storage
      if (verification.images && verification.images.length > 0) {
        const imagePaths = verification.images.map((url: string) => {
          const match = url.match(/verification-media\/(.+)$/);
          return match ? match[1] : null;
        }).filter(Boolean);

        if (imagePaths.length > 0) {
          await supabase.storage.from("verification-media").remove(imagePaths);
        }
      }

      // Delete video from storage
      if (verification.video_url) {
        const videoMatch = verification.video_url.match(/verification-media\/(.+)$/);
        if (videoMatch) {
          await supabase.storage.from("verification-media").remove([videoMatch[1]]);
        }
      }

      // Delete verification record
      const { error: deleteError } = await supabase
        .from("item_verifications")
        .delete()
        .eq("id", verification.id);

      if (!deleteError) deletedCount++;
    }

    // Also delete associated ratings
    if (expiredVerifications && expiredVerifications.length > 0) {
      const expiredIds = expiredVerifications.map(v => v.id);
      await supabase
        .from("verification_ratings")
        .delete()
        .in("verification_id", expiredIds);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deleted ${deletedCount} expired verifications`,
        deletedCount 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting expired verifications:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
