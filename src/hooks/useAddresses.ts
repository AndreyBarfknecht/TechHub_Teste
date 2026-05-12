import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Address } from '../types/profile';

export const useAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      if (addressData.is_default || addresses.length === 0) {
        await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
        addressData.is_default = true;
      }

      const { error } = await supabase.from('user_addresses').insert([{ ...addressData, user_id: user.id }]);
      if (error) throw error;
      await fetchAddresses();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      if (updates.is_default) {
        await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
      }
      const { error } = await supabase.from('user_addresses').update(updates).eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await fetchAddresses();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { error } = await supabase.from('user_addresses').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await fetchAddresses();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const fetchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) return null;
      return data;
    } catch {
      return null;
    }
  };

  return { addresses, loading, addAddress, updateAddress, deleteAddress, fetchCep, refetch: fetchAddresses };
};
