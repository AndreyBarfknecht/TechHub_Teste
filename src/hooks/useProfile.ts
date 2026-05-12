import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Profile } from '../types/profile';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (err) throw err;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'User not authenticated' };
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (err) throw err;
      await fetchProfile();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: 'User not authenticated', publicUrl: null };
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: data.publicUrl });
      return { publicUrl: data.publicUrl, error: null };
    } catch (err: any) {
      return { error: err.message, publicUrl: null };
    }
  };

  return { profile, loading, error, updateProfile, uploadAvatar, refetch: fetchProfile };
};
