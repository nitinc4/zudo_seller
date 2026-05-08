import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import MapPicker from '../components/MapPicker';
import { Store, MapPin, Phone, Building2, Loader2, Save } from 'lucide-react';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    billingAddress: '',
    phone: '',
    pickupLocation: {
      lat: 28.6139,
      lng: 77.2090,
      address: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use the API key found in AndroidManifest.xml
  const MAPS_API_KEY = 'AIzaSyDXn6KSA4exy08KiKicYZ53wCfs20__qWU';

  const handleLocationSelect = (coords) => {
    setFormData({
      ...formData,
      pickupLocation: {
        ...formData.pickupLocation,
        lat: coords.lat,
        lng: coords.lng,
        address: coords.address || formData.pickupLocation.address
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/sellers/profile', formData);
      const user = JSON.parse(localStorage.getItem('zudo_seller_user'));
      user.isProfileComplete = true;
      localStorage.setItem('zudo_seller_user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      console.error('Profile update error:', err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '40px', borderRadius: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Complete Your Seller Profile</h1>
          <p style={{ color: '#94a3b8' }}>Please provide your business details to start selling on Zudo.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={16} /> Store/Seller Name
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Trendy Collections" 
                required 
                value={formData.storeName}
                onChange={e => setFormData({...formData, storeName: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> Contact Phone Number
              </label>
              <input 
                type="tel" 
                className="input-field" 
                placeholder="e.g. +91 9876543210" 
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} /> Billing Address
            </label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Enter your full billing address" 
              required 
              value={formData.billingAddress}
              onChange={e => setFormData({...formData, billingAddress: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} /> Pickup Location (Select on Map)
            </label>
            <div style={{ position: 'relative' }}>
              <MapPicker 
                apiKey={MAPS_API_KEY} 
                onLocationSelect={handleLocationSelect} 
                initialLocation={formData.pickupLocation} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '16px', 
                left: '16px', 
                background: 'rgba(15, 23, 42, 0.8)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                fontSize: '12px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Coordinates Selected:</div>
                <div style={{ fontWeight: 600 }}>{formData.pickupLocation.lat.toFixed(6)}, {formData.pickupLocation.lng.toFixed(6)}</div>
              </div>
            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Specific pickup address/instructions" 
              required 
              value={formData.pickupLocation.address}
              onChange={e => setFormData({
                ...formData, 
                pickupLocation: { ...formData.pickupLocation, address: e.target.value }
              })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '16px 40px' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <Save size={20} />
                  <span>Save Profile & Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
