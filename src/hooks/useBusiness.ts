import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Business = Database['public']['Tables']['businesses']['Row'];

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    fetchBusiness();
  }, [user]);

  const fetchBusiness = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error fetching business:', error);
        return;
      }

      // Set the first business if data exists, otherwise null
      setBusiness(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (name: string, type: string = 'general') => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name,
          type,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business:', error);
        return { error };
      }

      setBusiness(data);

      // Seed the business with demo data
      await seedBusinessData(data.id);

      return { data };
    } catch (error) {
      console.error('Error creating business:', error);
      return { error };
    }
  };

  const seedBusinessData = async (businessId: string) => {
    try {
      // Call the seed function
      const { error } = await supabase.rpc('seed_business_data', {
        business_uuid: businessId
      });

      if (error) {
        console.error('Error seeding business data:', error);
      }
    } catch (error) {
      console.error('Error seeding business data:', error);
    }
  };

  return {
    business,
    loading,
    createBusiness,
    refetch: fetchBusiness,
  };
}