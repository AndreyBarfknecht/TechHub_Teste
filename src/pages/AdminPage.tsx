import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ProductForm from "../components/admin/ProductForm";
import ProductList from "../components/admin/ProductList";
import StoreSettings from "../components/admin/StoreSettings";
import SalesReport from "../components/admin/SalesReport";
import type { Product } from "../types/product";
import type { Session } from '@supabase/supabase-js';
import {
  LogOut, LayoutDashboard, ShieldCheck, Plus, X,
  ExternalLink, ArrowLeft, Tag, Trash2, ToggleLeft, ToggleRight, Settings,
  BarChart3, Package as PackageIcon
} from "lucide-react";
import "./Admin.css";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  usage_count: number;
  max_uses: number | null;
  created_at: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reports'>('products');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState("");
  const [couponMaxUses, setCouponMaxUses] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setCoupons(data as Coupon[]);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchCoupons();
    }
  }, [session, fetchCoupons]);

  const openCouponModal = () => {
    setCouponCode("");
    setCouponPercent("");
    setCouponMaxUses("");
    setIsCouponModalOpen(true);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseInt(couponPercent);
    if (!couponCode.trim()) { alert("Informe um código para o cupom."); return; }
    if (isNaN(pct) || pct < 1 || pct > 100) { alert("Desconto deve ser entre 1% e 100%."); return; }

    setCouponLoading(true);
    const { error } = await supabase.from("coupons").insert({
      code: couponCode.trim().toUpperCase(),
      discount_percent: pct,
      max_uses: couponMaxUses ? parseInt(couponMaxUses) : null,
      is_active: true,
    });
    setCouponLoading(false);

    if (error) {
      alert(error.code === "23505" ? "Esse código já existe. Tente outro." : "Erro: " + error.message);
      return;
    }

    setIsCouponModalOpen(false);
    setMessage({ type: "success", text: `Cupom "${couponCode.toUpperCase()}" criado com sucesso!` });
    fetchCoupons();
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id);
    fetchCoupons();
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`Deletar o cupom "${coupon.code}"? Esta ação não pode ser desfeita.`)) return;
    await supabase.from("coupons").delete().eq("id", coupon.id);
    fetchCoupons();
    setMessage({ type: "success", text: `Cupom "${coupon.code}" removido.` });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Credenciais inválidas. Verifique seu email e senha.");
  };

  const openAddModal = () => { setEditingProduct(null); setIsModalOpen(true); };
  const openEditModal = (product: Product) => { setEditingProduct(product); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); };

  const handleProductAdded = () => { setRefreshTrigger(p => p + 1); closeModal(); setMessage({ type: "success", text: "Novo produto cadastrado com sucesso!" }); };
  const handleProductUpdated = () => { setRefreshTrigger(p => p + 1); closeModal(); setMessage({ type: "success", text: "Produto atualizado com sucesso." }); };
  const handleProductDeleted = () => { setRefreshTrigger(p => p + 1); setMessage({ type: "success", text: "Produto removido com sucesso." }); };

  if (loading) return (
    <div className="admin-layout" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      Carregando Painel...
    </div>
  );

  if (!session) return (
    <div className="admin-login-container fade-in">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <ShieldCheck size={48} color="var(--primary)" style={{ margin: "0 auto 1rem" }} />
          <h2>Acesso Restrito</h2>
          <p>Painel de Gestão da Loja</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input type="email" required className="admin-input" placeholder="admin@loja.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Senha</label>
            <input type="password" required className="admin-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {loginError && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "1rem", fontWeight: 500 }}>{loginError}</p>}
          <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.85rem" }}>
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-layout fade-in">
      <div className="admin-container">

        <header className="admin-header">
          <div>
            <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LayoutDashboard size={28} color="var(--primary)" />
              Painel de Gestão
            </h1>
            <p>Controle o inventário e os produtos da sua loja.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={() => navigate("/")} className="btn-outline-admin">
              <ArrowLeft size={16} />
              <span className="desktop-text">Voltar para a Loja</span>
              <span className="mobile-text">Loja</span>
            </button>
            <button onClick={() => supabase.auth.signOut()} className="btn-logout">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </header>

        {message.type && (
          <div className={`admin-alert ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })}>×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <PackageIcon size={18} />
            Produtos & Cupons
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={18} />
            Relatórios de Vendas
          </button>
        </div>

        {activeTab === 'products' ? (
          <>
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ fontSize: "1.5rem", color: "var(--text-main)" }}>Produtos</h2>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <Link to="/" className="btn-logout"
                    style={{ textDecoration: "none", height: "42px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ExternalLink size={18} /> Ver Loja
                  </Link>
                  <button onClick={openCouponModal} className="btn-outline-admin"
                    style={{ height: "42px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Tag size={18} /> Criar Cupom
                  </button>
                  <button onClick={() => setIsSettingsModalOpen(true)} className="btn-outline-admin"
                    style={{ height: "42px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Settings size={18} /> Configurações
                  </button>
                  <button onClick={openAddModal} className="btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "42px" }}>
                    <Plus size={20} /> Novo Produto
                  </button>
                </div>
              </div>
              <ProductList refreshTrigger={refreshTrigger} onEdit={openEditModal} onDelete={handleProductDeleted} />
            </div>

            <div style={{ marginTop: "3rem", marginBottom: "3rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Tag size={22} color="var(--primary)" /> Cupons de Desconto
                </h2>
                <button onClick={openCouponModal} className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "42px" }}>
                  <Plus size={18} /> Novo Cupom
                </button>
              </div>

              {couponsLoading ? (
                <p style={{ color: "var(--text-muted)", padding: "1rem" }}>Carregando cupons...</p>
              ) : coupons.length === 0 ? (
                <div className="admin-section" style={{ textAlign: "center", padding: "3rem" }}>
                  <Tag size={40} color="var(--border)" style={{ margin: "0 auto 1rem", display: "block" }} />
                  <p style={{ color: "var(--text-muted)" }}>Nenhum cupom criado ainda. Clique em "Criar Cupom" para começar.</p>
                </div>
              ) : (
                <div className="product-list-container">
                  {coupons.map(coupon => (
                    <div key={coupon.id} className="product-list-item">
                      <div className="item-info-group">
                        <div style={{
                          width: 64, height: 64, borderRadius: 8, flexShrink: 0,
                          background: coupon.is_active ? "var(--primary-light)" : "#f1f5f9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid var(--border)"
                        }}>
                          <Tag size={24} color={coupon.is_active ? "var(--primary)" : "#94a3b8"} />
                        </div>
                        <div className="item-details">
                          <h3 style={{ fontFamily: "monospace", letterSpacing: "0.08em", fontSize: "1.1rem" }}>
                            {coupon.code}
                          </h3>
                          <span className="item-category">
                            Usos: {coupon.usage_count}
                            {coupon.max_uses !== null ? ` / ${coupon.max_uses}` : " (ilimitado)"}
                            {" · "}Criado em {new Date(coupon.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="item-stats">
                        <div className="item-price" style={{ color: "var(--primary)" }}>
                          {coupon.discount_percent}% OFF
                        </div>
                        <span className={`item-stock ${coupon.is_active ? "stock-good" : "stock-out"}`}>
                          {coupon.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => handleToggleCoupon(coupon)} className="btn-icon"
                          title={coupon.is_active ? "Desativar cupom" : "Ativar cupom"}
                          style={{
                            border: coupon.is_active ? "1px solid #d1fae5" : "1px solid #fee2e2",
                            color: coupon.is_active ? "#059669" : "#dc2626"
                          }}>
                          {coupon.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => handleDeleteCoupon(coupon)} className="btn-icon btn-delete" title="Deletar cupom">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <SalesReport />
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? `Editar: ${editingProduct.name}` : "Cadastrar Novo Produto"}</h2>
                <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
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

        {isCouponModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCouponModalOpen(false)}>
            <div className="modal-container" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Tag size={20} color="var(--primary)" />
                  Criar Cupom de Desconto
                </h2>
                <button className="modal-close-btn" onClick={() => setIsCouponModalOpen(false)}><X size={24} /></button>
              </div>
              <div className="modal-content">
                <form onSubmit={handleCreateCoupon}>
                  <div className="admin-form-group">
                    <label className="admin-label">Código do Cupom</label>
                    <input
                      required type="text" className="admin-input"
                      placeholder="Ex: DESCONTO20"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                      style={{ fontFamily: "monospace", letterSpacing: "0.1em", fontSize: "1.1rem" }}
                    />
                    <small style={{ color: "var(--text-muted)", marginTop: "0.35rem", display: "block" }}>
                      Apenas letras e números, sem espaços.
                    </small>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Percentual de Desconto (%)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <input
                        required type="number" min={1} max={100} className="admin-input"
                        placeholder="Ex: 15"
                        value={couponPercent}
                        onChange={e => setCouponPercent(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <span style={{
                        background: "var(--primary-light)", color: "var(--primary)",
                        padding: "0.75rem 1.25rem", borderRadius: "var(--radius-sm)",
                        fontWeight: 700, fontSize: "1.1rem", minWidth: 64, textAlign: "center"
                      }}>
                        {couponPercent ? `${couponPercent}%` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Limite de Usos</label>
                    <input
                      type="number" min={1} className="admin-input"
                      placeholder="Deixe vazio para ilimitado"
                      value={couponMaxUses}
                      onChange={e => setCouponMaxUses(e.target.value)}
                    />
                    <small style={{ color: "var(--text-muted)", marginTop: "0.35rem", display: "block" }}>
                      Ex: 2, 5, 10 — ou vazio para uso ilimitado.
                    </small>
                  </div>
                  {couponCode && couponPercent && (
                    <div style={{
                      background: "var(--primary-light)", border: "2px dashed var(--primary)",
                      borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem"
                    }}>
                      <div>
                        <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.25rem" }}>
                          Preview do Cupom
                        </p>
                        <p style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "0.1em" }}>
                          {couponCode}
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          {couponMaxUses ? `Limite: ${couponMaxUses} uso(s)` : "Uso ilimitado"}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                          {couponPercent}%
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>de desconto</p>
                      </div>
                    </div>
                  )}
                  <button type="submit" disabled={couponLoading} className="btn-primary"
                    style={{ width: "100%", padding: "1rem", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <Tag size={18} />
                    {couponLoading ? "Criando..." : "Criar Cupom"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {isSettingsModalOpen && (
          <div className="modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
            <div className="modal-container" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Settings size={20} color="var(--primary)" />
                  Configurações da Loja
                </h2>
                <button className="modal-close-btn" onClick={() => setIsSettingsModalOpen(false)}><X size={24} /></button>
              </div>
              <div className="modal-content">
                <StoreSettings />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
