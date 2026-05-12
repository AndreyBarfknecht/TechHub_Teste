import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useAddresses } from '../hooks/useAddresses';

import ProfileAvatar from '../components/profile/ProfileAvatar';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import AddressCard from '../components/profile/AddressCard';
import AddressForm from '../components/profile/AddressForm';
import OrderHistoryCard from '../components/profile/OrderHistoryCard';

import './ProfilePage.css';
import type { Address } from '../types/profile';

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dados');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { addresses, loading: addressesLoading, addAddress, updateAddress, deleteAddress, fetchCep } = useAddresses();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/profile');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="profile-page" style={{display: 'flex', justifyContent: 'center', marginTop: '10vh'}}>
        <Loader2 className="spinning" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-page fade-in">
      <div className="container">
        
        <div className="profile-layout">
          {/* Sidebar / Menu */}
          <aside className="profile-sidebar card">
            <ProfileAvatar 
               avatarUrl={localAvatar || profile.avatar_url} 
               name={profile.full_name || ''} 
               email={user?.email} 
               uploading={uploadingAvatar}
               onUpload={async (e) => {
                 if (e.target.files && e.target.files[0]) {
                   const file = e.target.files[0];
                   setLocalAvatar(URL.createObjectURL(file));
                   setUploadingAvatar(true);
                   const { error } = await uploadAvatar(file);
                   setUploadingAvatar(false);
                   if (error) {
                       setLocalAvatar(null);
                       alert('Erro ao fazer upload da imagem: ' + error);
                   }
                 }
               }} 
            />

            <nav className="profile-nav">
              <button 
                className={`profile-nav-btn ${activeTab === 'dados' ? 'active' : ''}`}
                onClick={() => setActiveTab('dados')}
              >
                <User size={18} /> Meus Dados
              </button>
              <button 
                className={`profile-nav-btn ${activeTab === 'enderecos' ? 'active' : ''}`}
                onClick={() => setActiveTab('enderecos')}
              >
                <MapPin size={18} /> Endereços
              </button>
              <button 
                className={`profile-nav-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
                onClick={() => setActiveTab('pedidos')}
              >
                <Package size={18} /> Meus Pedidos
              </button>
              <button className="profile-nav-btn text-danger" onClick={signOut}>
                <LogOut size={18} /> Sair da Conta
              </button>
            </nav>
          </aside>

          {/* Conteúdo Principal */}
          <main className="profile-content card">
            {activeTab === 'dados' && (
              <div className="profile-section fade-in">
                <h3 className="section-title">Dados Pessoais</h3>
                <p className="section-subtitle">Gerencie suas informações de contato e identificação.</p>
                <PersonalInfoForm profile={profile} onSave={updateProfile} />
              </div>
            )}

            {activeTab === 'enderecos' && (
              <div className="profile-section fade-in">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
                  <div>
                    <h3 className="section-title" style={{marginBottom: '0.25rem'}}>Meus Endereços</h3>
                    <p className="section-subtitle" style={{marginBottom: 0}}>Gerencie seus endereços de entrega.</p>
                  </div>
                  {!showAddressForm && (
                     <button className="btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}>
                       <Plus size={18} /> Novo Endereço
                     </button>
                  )}
                </div>
                
                {showAddressForm && (
                  <AddressForm 
                    initialData={editingAddress}
                    onSave={editingAddress ? (data) => updateAddress(editingAddress.id, data) : addAddress}
                    onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
                    fetchCep={fetchCep}
                  />
                )}

                {!showAddressForm && (
                  <div className="saved-payment-cards">
                    {addressesLoading ? (
                      <div style={{display: 'flex', justifyContent: 'center', padding: '2rem'}}><Loader2 className="spinning" size={24} color="var(--primary)" /></div>
                    ) : addresses.length === 0 ? (
                      <div className="empty-state">
                        <MapPin size={48} color="var(--border)" />
                        <p>Você ainda não tem nenhum endereço salvo.</p>
                      </div>
                    ) : (
                      addresses.map(addr => (
                         <AddressCard 
                           key={addr.id} 
                           address={addr} 
                           onEdit={(a) => { setEditingAddress(a); setShowAddressForm(true); }}
                           onDelete={deleteAddress}
                           onSetDefault={(id) => updateAddress(id, { is_default: true })}
                         />
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div className="profile-section fade-in">
                <h3 className="section-title">Meus Pedidos</h3>
                <p className="section-subtitle">Acompanhe o status das suas compras recentes.</p>
                <OrderHistoryCard />
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
