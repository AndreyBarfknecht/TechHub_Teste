import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AnnouncementBar: React.FC = () => {
  const [settings, setSettings] = useState<{ message: string; link: string; is_active: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'announcement_bar')
          .single();

        if (error) throw error;
        if (data) setSettings(data.value as any);
      } catch (err) {
        console.error('Erro ao carregar banner:', err);
        // Fallback para valor padrão se falhar
        setSettings({
          message: "Frete grátis em compras acima de R$ 200!",
          link: "/products",
          is_active: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading || !settings || !settings.is_active) return null;

  return (
    <div className="announcement-bar">
      <div className="container">
        <Link to={settings.link || "/products"} className="announcement-content">
          {settings.message}
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementBar;
