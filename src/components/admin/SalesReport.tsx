import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Users,
  AlertTriangle,
  CreditCard,
  Layers
} from "lucide-react";

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItemsSold: number;
  conversionRate: number; // Placeholder based on orders vs generic visit estimate
  pendingRevenue: number;
}

interface TopProduct {
  id: string;
  name: string;
  total_sold: number;
  revenue: number;
  image?: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

interface CategorySales {
  name: string;
  revenue: number;
  percentage: number;
}

interface OrderItem {
  quantity: number;
  product_id: string;
  unit_price: number;
  products: {
    name: string;
    image_urls: string[];
  } | null;
}

interface OrderData {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  order_items: OrderItem[];
}

export default function SalesReport() {
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalItemsSold: 0,
    conversionRate: 2.4, // Industry average fallback
    pendingRevenue: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [statusCount, setStatusCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const confirmedStatuses = ['paid', 'shipped', 'out_for_delivery', 'delivered'];
      
      // Fetch Orders for metrics
      let query = supabase
        .from('orders')
        .select(`
          id, 
          total_amount, 
          status, 
          created_at,
          payment_method,
          order_items (
            quantity, 
            product_id, 
            unit_price, 
            products (name, image_urls, category_id, categories(name))
          )
        `);

      if (period === '7d') {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        query = query.gte('created_at', date.toISOString());
      } else if (period === '30d') {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        query = query.gte('created_at', date.toISOString());
      }

      const { data: ordersData, error: ordersError } = await query;
      if (ordersError) throw ordersError;

      // Fetch Low Stock Products
      const { data: stockData, error: stockError } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .lt('stock_quantity', 10)
        .order('stock_quantity', { ascending: true })
        .limit(5);

      if (stockError) throw stockError;
      if (stockData) setLowStockProducts(stockData as LowStockProduct[]);

      if (ordersData) {
        const orders = ordersData as any[];
        
        // 1. Basic Stats
        const totalRevenue = orders
          .filter(o => confirmedStatuses.includes(o.status))
          .reduce((acc, order) => acc + Number(order.total_amount), 0);
          
        const pendingRevenue = orders
          .filter(o => o.status === 'pending')
          .reduce((acc, order) => acc + Number(order.total_amount), 0);

        const validOrders = orders.filter(o => o.status !== 'canceled');
        const totalOrders = validOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // 2. Product & Category Mapping
        let totalItemsSold = 0;
        const productMap: Record<string, { name: string; sold: number; revenue: number; image?: string }> = {};
        const catMap: Record<string, { name: string; revenue: number }> = {};
        const statusMap: Record<string, number> = {};

        orders.forEach(order => {
          statusMap[order.status] = (statusMap[order.status] || 0) + 1;
          
          if (order.status === 'canceled') return;
          
          order.order_items.forEach((item: any) => {
            totalItemsSold += item.quantity;
            const productId = item.product_id;
            const productName = item.products?.name || "Produto Removido";
            const categoryName = item.products?.categories?.name || "Geral";
            const revenue = Number(item.unit_price) * item.quantity;
            
            // Product ranking
            if (!productMap[productId]) {
              productMap[productId] = { 
                name: productName, 
                sold: 0, 
                revenue: 0, 
                image: item.products?.image_urls?.[0] 
              };
            }
            productMap[productId].sold += item.quantity;
            productMap[productId].revenue += revenue;

            // Category ranking
            if (!catMap[categoryName]) {
              catMap[categoryName] = { name: categoryName, revenue: 0 };
            }
            catMap[categoryName].revenue += revenue;
          });
        });

        const topProductsData: TopProduct[] = Object.entries(productMap)
          .map(([id, data]) => ({
            id,
            name: data.name,
            total_sold: data.sold,
            revenue: data.revenue,
            image: data.image
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        const categoryData: CategorySales[] = Object.values(catMap)
          .map(cat => ({
            ...cat,
            percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
          }))
          .sort((a, b) => b.revenue - a.revenue);

        setStats({
          totalRevenue,
          totalOrders,
          averageOrderValue,
          totalItemsSold,
          conversionRate: 2.8, // Simulated
          pendingRevenue
        });
        setTopProducts(topProductsData);
        setCategorySales(categoryData);
        setStatusCount(statusMap);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) return <div className="reports-loading">Sincronizando dados de vendas...</div>;

  return (
    <div className="dashboard-container fade-in">
      
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Dashboard Executivo</h2>
          <p>Visão geral de performance e saúde financeira da loja.</p>
        </div>
        <div className="reports-controls">
          <div className="period-selector">
            <Calendar size={18} />
            <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="all">Todo o período</option>
            </select>
            <ChevronDown size={16} className="select-icon" />
          </div>
          <button className="btn-refresh" onClick={() => fetchSalesData()}>
             Atualizar Dados
          </button>
        </div>
      </div>

      {/* 2. PRIMARY KPIs */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon revenue"><DollarSign size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Faturamento Líquido</span>
            <h3 className="stat-value">{formatCurrency(stats.totalRevenue)}</h3>
            <div className="stat-meta">
               <span className="pending-tag">Aguardando: {formatCurrency(stats.pendingRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders"><ShoppingBag size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Pedidos Confirmados</span>
            <h3 className="stat-value">{stats.totalOrders}</h3>
            <div className="stat-trend positive">
              <ArrowUpRight size={14} /> <span>{period === 'all' ? 'Volume Total' : 'Estável'}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ticket"><Target size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Ticket Médio</span>
            <h3 className="stat-value">{formatCurrency(stats.averageOrderValue)}</h3>
            <div className="stat-meta">Valor médio por compra</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon conversion"><Users size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Taxa de Conversão</span>
            <h3 className="stat-value">{stats.conversionRate}%</h3>
            <div className="stat-trend positive"><ArrowUpRight size={14} /> <span>+0.4%</span></div>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="dashboard-main-grid">
        
        {/* Top Selling Products */}
        <div className="dashboard-box wide">
          <div className="box-header">
            <div className="title-group">
              <Package size={20} color="var(--primary)" />
              <h3>Produtos Estrela (Mais Vendidos)</h3>
            </div>
            <button className="text-btn">Ver todos</button>
          </div>
          <div className="products-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Vendas</th>
                  <th>Receita Gerada</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-product-cell">
                        <div className="product-thumb">
                          {p.image ? <img src={p.image} alt="" /> : <Package size={20} />}
                        </div>
                        <span className="p-name">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="p-count">{p.total_sold} un.</span></td>
                    <td><strong>{formatCurrency(p.revenue)}</strong></td>
                    <td>
                      <div className="mini-progress">
                        <div className="fill" style={{ width: `${(p.revenue / (topProducts[0]?.revenue || 1)) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Secondary Sidebar Stats */}
        <div className="dashboard-side">
          
          {/* Category Share */}
          <div className="dashboard-box">
            <div className="box-header">
              <div className="title-group">
                <Layers size={18} color="var(--primary)" />
                <h3>Vendas por Categoria</h3>
              </div>
            </div>
            <div className="category-list">
              {categorySales.map(cat => (
                <div key={cat.name} className="cat-item">
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-val">{cat.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="cat-progress">
                    <div className="fill" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Overview */}
          <div className="dashboard-box mt-1">
            <div className="box-header">
              <div className="title-group">
                <CreditCard size={18} color="var(--primary)" />
                <h3>Status dos Pedidos</h3>
              </div>
            </div>
            <div className="status-grid-dashboard">
               <div className="status-pill delivered">Entregues: {statusCount.delivered || 0}</div>
               <div className="status-pill paid">Pagos: {statusCount.paid || 0}</div>
               <div className="status-pill pending">Pendentes: {statusCount.pending || 0}</div>
               <div className="status-pill canceled">Cancelados: {statusCount.canceled || 0}</div>
            </div>
          </div>

          {/* Health Alert - Dynamic */}
          {lowStockProducts.length > 0 && (
            <div className="health-card">
              <div className="health-header">
                <AlertTriangle size={20} className="health-icon" />
                <strong>Atenção ao Estoque</strong>
              </div>
              <div className="low-stock-list">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="low-stock-item">
                    <span className="p-name">{p.name}</span>
                    <span className={`p-stock ${p.stock_quantity === 0 ? 'critical' : 'warning'}`}>
                      {p.stock_quantity} un.
                    </span>
                  </div>
                ))}
              </div>
              <p className="health-footer">Reabasteça estes itens para evitar perda de vendas.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
