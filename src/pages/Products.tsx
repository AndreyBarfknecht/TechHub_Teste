

const Products = () => {
  return (
    <div className="container fade-in" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Products</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
        Browse our entire collection of premium items.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {[1, 2, 3, 4, 5, 6].map((prod) => (
          <div key={prod} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ height: '250px', background: 'var(--bg-color)' }}></div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Premium Item {prod}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                High quality material with premium finish.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                  ${(prod * 29.99).toFixed(2)}
                </span>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
