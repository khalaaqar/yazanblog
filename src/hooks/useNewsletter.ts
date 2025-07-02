import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendNewsletterData {
  title: string;
  content: string;
  type: 'article' | 'company';
}

export const useSendNewsletter = () => {
  return useMutation({
    mutationFn: async ({ title, content, type }: SendNewsletterData) => {
      console.log('Starting newsletter send process...');
      
      // 1. جلب قائمة المشتركين من Supabase
      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email, name')
        .eq('status', 'active');

      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
        throw subscribersError;
      }
      
      if (!subscribers || subscribers.length === 0) {
        throw new Error('لا يوجد مشتركون في النشرة البريدية');
      }

      console.log(`Found ${subscribers.length} active subscribers`);

      // 2. تنظيف المحتوى من HTML tags للنص العادي
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();

      // 3. استدعاء الـ Edge Function
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          title,
          content: cleanContent,
          type,
          subscribers,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'فشل في إرسال النشرة البريدية');
      }

      console.log('Newsletter sent successfully:', data);
      return data;
    },
  });
};