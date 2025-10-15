import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SheetData {
  type: 'listing' | 'user' | 'admin_activity';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    const SPREADSHEET_ID = Deno.env.get('GOOGLE_SPREADSHEET_ID');

    if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
      throw new Error('Missing Google Sheets credentials');
    }

    const { type, data }: SheetData = await req.json();

    // Format data based on type
    let values: any[][];
    let sheetName: string;
    
    if (type === 'listing') {
      sheetName = 'Listings';
      values = [[
        data.id,
        data.product_name,
        data.description,
        data.rent_price,
        data.product_type,
        data.owner_user_id,
        data.listing_status,
        data.payment_verified ? 'Yes' : 'No',
        data.views,
        data.rating,
        data.created_at
      ]];
    } else if (type === 'user') {
      sheetName = 'Users';
      values = [[
        data.id,
        data.name,
        data.phone,
        data.pin_code,
        data.created_at
      ]];
    } else {
      sheetName = 'Admin Activity';
      values = [[
        data.action,
        data.admin_id,
        data.target_id,
        data.details,
        data.timestamp
      ]];
    }

    // Append data to Google Sheets
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;

    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Sheets API error:', error);
      throw new Error(`Failed to sync to Google Sheets: ${error}`);
    }

    const result = await response.json();
    console.log('Successfully synced to Google Sheets:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Data synced to Google Sheets' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
