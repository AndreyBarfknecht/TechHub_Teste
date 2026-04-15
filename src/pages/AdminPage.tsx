import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importado para navegação
import { supabase } from "../lib/supabase";
import ProductForm from "../components/admin/ProductForm";
import ProductList from "../components/admin/ProductList";
import type { Product } from "../types/product";
import type { Session } from '@supabase/supabase-js';
import { LogOut, LayoutDashboard, ShieldCheck, Plus, X, ExternalLink } from "lucide-react";
import "./Admin.css";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

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
    if (error) setError("Credenciais inválidas. Verifique seu email e senha.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    closeModal();
    setMessage({ type: 'success', text: 'Novo produto cadastrado com sucesso!' });
  };

  const handleProductUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    closeModal();
    setMessage({ type: 'success', text: 'Produto atualizado com sucesso.' });
  };

  const handleProductDeleted = () => {
    setRefreshTrigger(prev => prev + 1);
    setMessage({ type: 'success', text: 'Produto removido com sucesso.' });
  };

  const handleMessageClose = () => {
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return <div className="admin-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando Painel...</div>;
  }

  if (!session) {
    return (
      <div className="admin-login-container fade-in">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h2>Acesso Restrito</h2>
            <p>Painel de Gestão da Loja</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label className="admin-label">Email</label>
              <input
                type="email"
                required
                className="admin-input"
                placeholder="admin@loja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-label">Senha</label>
              <input
                type="password"
                required
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}
            
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout fade-in">
      <div className="admin-container">
        
        <header className="admin-header">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={28} color="var(--primary)" />
              Painel de Gestão
            </h1>
            <p>Controle o inventário e os produtos da sua loja.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </header>

        {message.type && (
          <div className={`admin-alert ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={handleMessageClose}>×</button>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Catálogo de Produtos</h2>
            
            {/* GRUPO DE BOTÕES DE AÇÃO */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/" className="btn-logout" style={{ textDecoration: 'none', height: '42px', display: 'flex', alignItems: 'center' }}>
                <ExternalLink size={18} />
                Ver Loja
              </Link>
              <button onClick={openAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                <Plus size={20} />
                Novo Produto
              </button>
            </div>
          </div>
          
          <ProductList 
            refreshTrigger={refreshTrigger}
            onEdit={openEditModal}
            onDelete={handleProductDeleted}
          />
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? `Editar: ${editingProduct.name}` : 'Cadastrar Novo Produto'}</h2>
                <button className="modal-close-btn" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-content">
                <ProductForm 
                  onProductAdded={handleProductAdded}
                  editingProduct={editingProduct}
                  onCancelEdit={closeModal}
                  onProductUpdated={handleProductUpdated}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
