import { MapPin, Star, Edit2, Trash2 } from 'lucide-react';
import type { Address } from '../../types/profile';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div className={`saved-card ${address.is_default ? 'default-address' : ''}`} style={{flexDirection: 'column', alignItems: 'stretch', gap: '1rem', border: address.is_default ? '2px solid var(--primary)' : '1px solid var(--border)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <div className="card-flag-icon" style={{backgroundColor: address.is_default ? 'var(--primary-light)' : 'var(--bg-color)'}}>
            <MapPin size={24} color={address.is_default ? 'var(--primary)' : 'var(--text-muted)'} />
          </div>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <h4 style={{margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--text-main)'}}>{address.alias}</h4>
              {address.is_default && <span className="card-status badge-success" style={{padding: '0.1rem 0.5rem', fontSize: '0.65rem'}}>Principal</span>}
            </div>
            <p className="card-expiry" style={{marginTop: '0.25rem', fontSize: '0.9rem'}}>
              {address.street}, {address.number}{address.complement ? ` - ${address.complement}` : ''}
              <br />
              {address.neighborhood} - {address.city}/{address.state} - CEP: {address.zip_code}
            </p>
          </div>
        </div>
      </div>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
        {!address.is_default && (
           <button className="btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => onSetDefault(address.id)}>
             <Star size={14} style={{marginRight: '0.25rem'}} /> Tornar Principal
           </button>
        )}
        <button className="btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => onEdit(address)}>
          <Edit2 size={14} style={{marginRight: '0.25rem'}} /> Editar
        </button>
        <button className="btn-danger" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'var(--transition)'}} onClick={() => {
          if (window.confirm('Deseja realmente excluir este endereço?')) {
            onDelete(address.id);
          }
        }}>
          <Trash2 size={14} style={{marginRight: '0.25rem'}} /> Excluir
        </button>
      </div>
    </div>
  );
}
