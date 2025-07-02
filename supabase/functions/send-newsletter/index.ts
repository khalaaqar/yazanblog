import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NewsletterData {
  title: string;
  content: string;
  type: "article" | "company";
  subscribers: Array<{ email: string; name: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    const { title, content, type, subscribers }: NewsletterData = await req.json();

    console.log("Newsletter request received:", { 
      title, 
      type, 
      subscribersCount: subscribers?.length 
    });

    // Validate input
    if (!title || !content || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, content, or type" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: "لا يوجد مشتركون في النشرة البريدية" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get environment variables
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const FROM_ADDRESS = Deno.env.get("EMAIL_FROM") || "noreply@example.com";
    const FROM_NAME = Deno.env.get("EMAIL_FROM_NAME") || "نشرة الموقع";
    const SITE_URL = Deno.env.get("SITE_URL") || "https://your-site.com";

    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "SendGrid API key not configured" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("Sending newsletter to", subscribers.length, "subscribers");
    console.log("Using FROM_ADDRESS:", FROM_ADDRESS);

    // Clean content for email (remove HTML tags for plain text version)
    const cleanContent = content.replace(/<[^>]*>/g, '').substring(0, 300);

    // Send emails using SendGrid API directly
    const sendPromises = subscribers.map(async (subscriber) => {
      const emailData = {
        personalizations: [
          {
            to: [{ email: subscriber.email, name: subscriber.name }],
            subject: `${type === "article" ? "مقال جديد" : "رحلة شركة جديدة"}: ${title}`,
          }
        ],
        from: { email: FROM_ADDRESS, name: FROM_NAME },
        reply_to: { email: FROM_ADDRESS },
        content: [
          {
            type: "text/plain",
            value: `مرحباً ${subscriber.name}،

${type === "article" ? "تم نشر مقال جديد بعنوان:" : "تم نشر رحلة شركة جديدة بعنوان:"}

${title}

${cleanContent}...

اقرأ المزيد على: ${SITE_URL}

---
تم إرسال هذه الرسالة لأنك مشترك في النشرة البريدية لدينا.`
          },
          {
            type: "text/html",
            value: `
              <html dir="rtl">
                <body style="font-family: 'Arial', sans-serif; direction: rtl; text-align: right; margin: 0; padding: 0; background-color: #f4f4f4;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                        ${type === "article" ? "مقال جديد" : "رحلة شركة جديدة"}
                      </h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px 20px;">
                      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
                        مرحباً <strong>${subscriber.name}</strong>،
                      </p>
                      
                      <p style="font-size: 16px; color: #666; margin-bottom: 25px;">
                        ${type === "article"
                          ? "تم نشر مقال جديد بعنوان:"
                          : "تم نشر رحلة شركة جديدة بعنوان:"}
                      </p>
                      
                      <h2 style="color: #333; margin: 25px 0; font-size: 24px; line-height: 1.4;">
                        ${title}
                      </h2>
                      
                      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-right: 4px solid #667eea;">
                        <p style="color: #555; line-height: 1.6; margin: 0; font-size: 16px;">
                          ${cleanContent}...
                        </p>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${SITE_URL}" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                          اقرأ المزيد
                        </a>
                      </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                      <p style="font-size: 14px; color: #999; margin: 0; line-height: 1.5;">
                        تم إرسال هذه الرسالة لأنك مشترك في النشرة البريدية لدينا.<br>
                        إذا كنت لا ترغب في استقبال هذه الرسائل، يمكنك إلغاء الاشتراك في أي وقت.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `
          }
        ]
      };

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to send email to ${subscriber.email}:`, response.status, errorText);
        throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
      }

      console.log(`Email sent successfully to ${subscriber.email}`);
      return { success: true, email: subscriber.email };
    });

    // Execute all email sends
    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    // Log failed attempts
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to send to ${subscribers[index].email}:`, result.reason);
      }
    });

    console.log(`Newsletter result — sent: ${successful}, failed: ${failed}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed,
        message: `تم إرسال النشرة البريدية بنجاح إلى ${successful} مشترك${failed > 0 ? ` وفشل في إرسالها إلى ${failed} مشترك` : ''}`
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (err: any) {
    console.error("Error in send-newsletter function:", err);
    return new Response(
      JSON.stringify({ 
        error: "حدث خطأ أثناء إرسال النشرة البريدية", 
        details: err.message 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);