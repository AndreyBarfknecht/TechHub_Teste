import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import "./ProductDetailPage.css";
import "../components/product/ProductSpecs.css";
import { supabase } from "../lib/supabase";
import type { Product } from "../types/product";
import { useRelatedProducts } from "../hooks/useRelatedProducts";
import { useProductReviews } from "../hooks/useProductReviews";
import ProductCard from "../components/ui/ProductCard";

// Refactored Components
import { ProductGallery } from "../components/product/ProductGallery";
import { ProductPurchaseActions } from "../components/product/ProductPurchaseActions";
import { FreightSimulator } from "../components/product/FreightSimulator";
import { ProductReviews } from "../components/product/ProductReviews";

const ProductDetailSkeleton = () => (
  <div className="product-detail-page fade-in container">
    <div className="product-detail-card">
      <div className="product-gallery-section skeleton-pulse-bg" style={{ height: '500px' }} />
      <div className="product-info-section">
        <div className="skeleton-line" style={{ width: '80%', height: '36px', marginBottom: '1.5rem' }} />
        <div className="skeleton-line" style={{ width: '40%', height: '40px', marginBottom: '1.5rem' }} />
        <div className="skeleton-line" style={{ width: '60%', height: '20px', marginBottom: '2rem' }} />
        <div className="skeleton-line" style={{ width: '100%', height: '54px', marginBottom: '1rem' }} />
        <div className="skeleton-line" style={{ width: '100%', height: '54px', marginBottom: '2rem' }} />
        <div className="skeleton-line" style={{ width: '100%', height: '150px' }} />
      </div>
    </div>
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const { reviews, averageRating } = useProductReviews(id);
  const { relatedProducts, loading: relatedLoading } = useRelatedProducts(product?.category_id, product?.id);

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
      } catch (err: unknown) {
        console.error("Error fetching product:", err);
        setError("Produto não encontrado ou ocorreu um erro.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | E-commerce`;
    }
    return () => {
      document.title = 'E-commerce';
    };
  }, [product]);

  if (loading) return <ProductDetailSkeleton />;

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

  const images = product.image_urls.length > 0 ? product.image_urls : ["https://via.placeholder.com/1000?text=Sem+Imagem"];

  const handleAddToCart = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
          
          {/* LEFT COLUMN: Dedicated Gallery + Description below */}
          <div className="product-main-left">
            <div className="product-gallery-section">
              <ProductGallery 
                images={images} 
                isFeatured={product.is_featured} 
                productName={product.name} 
              />
            </div>

            <div className="product-description-container">
              <h2>Descrição do Produto</h2>
              <div 
                className="product-desc-text"
                dangerouslySetInnerHTML={{ 
                  __html: product.description || "Nenhuma descrição disponível para este produto." 
                }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Info & Actions (Sticky) */}
          <div className="product-info-section">
            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i <= Math.round(averageRating) ? "star-filled" : "star-empty"} 
                  />
                ))}
              </div>
              <span className="rating-score">{averageRating.toFixed(1)}</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span className="rating-text">
                ({reviews.length > 0 ? `${reviews.length} avaliações` : 'Nenhuma avaliação'})
              </span>
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

            <ProductPurchaseActions 
              product={product} 
              onAddToCart={handleAddToCart} 
            />
            
            <FreightSimulator />

            <ul className="product-benefits">
              <li className="benefit-item">
                <Truck className="benefit-icon" size={20} />
                <span><strong>Frete Grátis</strong> para todo o Brasil.</span>
              </li>
              <li className="benefit-item">
                <RotateCcw className="benefit-icon" size={20} />
                <span><strong>Devolução grátis.</strong> 30 dias de garantia.</span>
              </li>
              <li className="benefit-item">
                <ShieldCheck className="benefit-icon" size={20} />
                <span><strong>Compra Segura.</strong> Receba o que espera.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FULL WIDTH: Specifications Block below everything */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="product-specs-full-width">
            <h2>Especificações Técnicas</h2>
            <div className="specs-grid-layout">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-card-item">
                  <span className="spec-name">{key}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {!relatedLoading && relatedProducts && relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2>Quem viu este produto também comprou</h2>
            <div className="related-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <CheckCircle size={20} color="#10b981" />
          <span>Produto adicionado ao carrinho!</span>
        </div>
      )}
    </div>
  );
}
