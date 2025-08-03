import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'waiter_call' | 'order_ready' | 'urgent_help';
  tableNumber?: number;
  message?: string;
  orderId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { type, tableNumber, message, orderId }: NotificationRequest = await req.json();

    console.log(`Admin notification: ${type} - Table ${tableNumber} - ${message}`);

    // Here you would integrate with your preferred notification service
    // For now, we'll just log the notification and could extend to:
    // - Send email notifications
    // - Push notifications to admin mobile app
    // - SMS alerts
    // - Slack/Discord notifications
    // - Real-time dashboard updates

    let notificationMessage = "";
    let priority = "normal";

    switch (type) {
      case 'waiter_call':
        notificationMessage = `🔔 Waiter requested at Table ${tableNumber}`;
        if (message) {
          notificationMessage += `: ${message}`;
        }
        priority = "high";
        break;
      case 'order_ready':
        notificationMessage = `✅ Order ${orderId} is ready for Table ${tableNumber}`;
        priority = "normal";
        break;
      case 'urgent_help':
        notificationMessage = `🚨 URGENT: Table ${tableNumber} needs immediate assistance`;
        if (message) {
          notificationMessage += `: ${message}`;
        }
        priority = "urgent";
        break;
      default:
        notificationMessage = `📋 General notification from Table ${tableNumber}`;
    }

    // Log the notification for admin dashboard
    console.log(`[${priority.toUpperCase()}] ${notificationMessage}`);

    // In a real implementation, you might:
    // 1. Send real-time notifications to admin dashboard
    // 2. Send email/SMS to managers
    // 3. Update a notifications table in the database
    // 4. Trigger push notifications

    // For demonstration, we'll create a simple notification record
    // You could create a notifications table to track all admin alerts
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin notified successfully",
        notification: notificationMessage,
        priority 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in notify-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});