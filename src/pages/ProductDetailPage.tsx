import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Minus, 
  Plus, 
  ShoppingCart, 
  CreditCard, 
  ShieldCheck, 
  Truck,
  RotateCcw,
  Loader2,
  AlertCircle
} from "lucide-react";
import "./ProductDetailPage.css";
import { supabase } from "../lib/supabase";
import type { Product } from "../types/product";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .single();

        if (supabaseError) throw supabaseError;
        setProduct(data as Product);
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError("Produto não encontrado ou ocorreu um erro.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="page-loading fade-in">
        <Loader2 className="w-10 h-10 icon-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-error fade-in container">
        <AlertCircle size={64} color="#ef4444" />
        <h1>Ops!</h1>
        <p>{error || "Não conseguimos carregar este produto."}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          Voltar para Home
        </Link>
      </div>
    );
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const placeholderImg = "https://via.placeholder.com/1000?text=Sem+Imagem";
  const images = product.image_url ? [product.image_url] : [placeholderImg];

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const maxQuantity = product.stock_quantity || 10;
  const increaseQuantity = () => setQuantity(prev => Math.min(prev + 1, maxQuantity));
  const decreaseQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <div className="product-detail-page fade-in">
      <div className="container">
        
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products">Produtos</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <span>{product.category.name}</span>
              <ChevronRight size={14} />
            </>
          )}
          <span className="breadcrumb-active" title={product.name}>{product.name}</span>
        </nav>

        {/* Main Card Wrapper */}
        <div className="product-detail-card">
          
          {/* Gallery */}
          <div className="product-gallery-section">
            <div className="relative">
              {product.is_featured && (
                <span className="badge-featured">Destaque</span>
              )}

              <div 
                className="product-image-main"
                onMouseEnter={() => setIsHoveringImage(true)}
                onMouseLeave={() => setIsHoveringImage(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={images[activeImageIndex]}
                  alt={`${product.name} - Imagem ${activeImageIndex + 1}`}
                  style={{ opacity: isHoveringImage ? 0 : 1 }}
                />
                
                {isHoveringImage && (
                  <div 
                    className="product-zoom-overlay"
                    style={{
                      backgroundImage: `url(${images[activeImageIndex]})`,
                      backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                      backgroundSize: '200%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                )}

                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="mobile-nav-btn prev"
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="mobile-nav-btn next"
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`thumbnail-btn ${activeImageIndex === idx ? 'active' : ''}`}
                    aria-label={`Ver imagem ${idx + 1}`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info-section">
            
            <div className="product-rating">
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-current" />
                ))}
              </div>
              <span className="rating-score">5.0</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span className="rating-text">(Avaliações excelentes)</span>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-pricing">
              <div className="price-main">{formatPrice(product.price)}</div>
              <div className="price-installment">
                ou 10x de {formatPrice(product.price / 10)} sem juros
              </div>
              {product.stock_quantity > 0 && product.stock_quantity < 5 && (
                <div className="stock-warning">Apenas {product.stock_quantity} em estoque!</div>
              )}
              {product.stock_quantity === 0 && (
                <div className="stock-out">Produto Esgotado</div>
              )}
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <span>Quantidade:</span>
                <div className="qty-controls">
                  <button 
                    onClick={decreaseQuantity}
                    className="qty-btn"
                    disabled={quantity <= 1 || product.stock_quantity === 0}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    onClick={increaseQuantity}
                    className="qty-btn"
                    disabled={quantity >= maxQuantity || product.stock_quantity === 0}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="purchase-buttons">
                <button 
                  disabled={product.stock_quantity === 0}
                  className="btn-add"
                >
                  <ShoppingCart size={20} />
                  Adicionar ao Carrinho
                </button>
                <button 
                  disabled={product.stock_quantity === 0}
                  className="btn-buy"
                >
                  <CreditCard size={20} />
                  Comprar Agora
                </button>
              </div>
            </div>

            <ul className="product-benefits">
              <li className="benefit-item">
                <Truck className="benefit-icon" size={24} />
                <span><strong>Frete Grátis</strong> para todo o Brasil.</span>
              </li>
              <li className="benefit-item">
                <RotateCcw className="benefit-icon" size={24} />
                <span><strong>Devolução grátis.</strong> Você tem 30 dias a partir da data de recebimento.</span>
              </li>
              <li className="benefit-item">
                <ShieldCheck className="benefit-icon" size={24} />
                <span><strong>Compra Segura.</strong> Receba o produto que está esperando ou devolvemos o dinheiro.</span>
              </li>
            </ul>

            <div className="product-details">
              <h2>Descrição do Produto</h2>
              <div className="product-desc-text">
                {product.description || "Nenhuma descrição disponível para este produto. Consulte-nos para mais detalhes!"}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
