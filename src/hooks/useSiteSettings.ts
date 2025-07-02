import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description?: string;
  contact_email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  whatsapp_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }
      return data as SiteSettings | null;
    },
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<SiteSettings>) => {
      console.log('Updating site settings with:', updates);
      
      // Get the first record to update
      const { data: existing, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing settings:', fetchError);
        throw fetchError;
      }

      if (existing?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('site_settings')
          .update({ 
            ...updates, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating site settings:', error);
          throw error;
        }
        console.log('Site settings updated successfully:', data);
        return data;
      } else {
        // Insert new record if none exists
        const requiredFields = {
          site_name: updates.site_name || 'اسم الموقع'
        };
        
        const { data, error } = await supabase
          .from('site_settings')
          .insert({ ...requiredFields, ...updates })
          .select()
          .single();
        
        if (error) {
          console.error('Error inserting site settings:', error);
          throw error;
        }
        console.log('Site settings created successfully:', data);
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('Site settings mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
    onError: (error) => {
      console.error('Site settings mutation failed:', error);
    },
  });
};