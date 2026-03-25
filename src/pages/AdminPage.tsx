import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProductForm from "../components/admin/ProductForm";
import ProductList from "../components/admin/ProductList";
import { LogOut } from "lucide-react";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleProductAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Carregando...</div>;
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f8' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4F46E5', fontSize: '24px' }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>}
            <button type="submit" className="btn-primary" style={{ marginTop: '8px', width: '100%' }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f8', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>Admin — Cadastro de Produtos</h1>
            <p style={{ color: '#666', margin: '4px 0 0 0' }}>Produtos cadastrados aqui aparecem automaticamente na loja</p>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #333', background: 'transparent' }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </header>

        <ProductForm onProductAdded={handleProductAdded} />
        
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Produtos na Loja</h2>
          <ProductList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
