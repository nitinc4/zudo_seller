import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL, getImageUrl } from '../utils/api';
import { Package, Plus, Search, Filter, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/sellers/products');
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const selectedCategoryData = categories.find(c => String(c._id) === String(selectedCat));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.categoryId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const productCatId = p.categoryId?._id || p.categoryId;
    const productSubCatId = p.subCategoryId?._id || p.subCategoryId;

    const matchesCat = !selectedCat || String(productCatId) === String(selectedCat);
    const matchesSubCat = !selectedSubCat || String(productSubCatId) === String(selectedSubCat);

    return matchesSearch && matchesCat && matchesSubCat;
  });

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Products</h1>
          <p style={{ color: '#94a3b8' }}>Manage your product inventory and pricing.</p>
        </div>
        <button 
          onClick={() => navigate('/products/add')}
          className="btn-primary" 
          style={{ padding: '12px 24px' }}
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '16px', 
        marginBottom: '24px',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="input-field"
              style={{ paddingLeft: '48px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>CATEGORY</label>
            <select 
              className="input-field" 
              style={{ height: '45px' }}
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                setSelectedSubCat('');
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>SUB-CATEGORY</label>
            <select 
              className="input-field" 
              style={{ height: '45px' }}
              value={selectedSubCat}
              onChange={(e) => setSelectedSubCat(e.target.value)}
              disabled={!selectedCat}
            >
              <option value="">All Sub-Categories</option>
              {selectedCategoryData?.subCategories?.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => { setSelectedCat(''); setSelectedSubCat(''); setSearchTerm(''); }}
            style={{ 
              marginTop: '25px',
              height: '45px',
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444',
              padding: '0 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>PRODUCT</th>
              <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>CATEGORY</th>
              <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>PRICE</th>
              <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>STOCK</th>
              <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="animate-spin" style={{ display: 'inline-block' }}><Package size={24} /></div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No products found. Start by adding one!
                </td>
              </tr>
            ) : filteredProducts.map((product) => (
              <tr key={product._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }} className="table-row-hover">
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <img 
                        src={getImageUrl(product.imageUrl)} 
                        alt="" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{product.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>SKU: {product.sku || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{product.categoryId?.name || product.category || 'N/A'}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{product.subCategoryId?.name || product.subCategory || ''}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600 }}>₹{product.price}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                  <span style={{ color: product.stock < 10 ? '#ef4444' : '#22c55e' }}>
                    {product.stock} units
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 700,
                    background: product.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: product.isActive ? '#22c55e' : '#ef4444',
                    border: `1px solid ${product.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => navigate(`/products/edit/${product._id}`)}
                      style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Products;
