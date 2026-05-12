import React from 'react';
import { Camera, User, Loader2 } from 'lucide-react';

interface ProfileAvatarProps {
  avatarUrl: string | null;
  name: string;
  email: string | undefined;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileAvatar({ avatarUrl, name, email, uploading, onUpload }: ProfileAvatarProps) {
  return (
    <div className="profile-card-header">
      <div className="avatar-wrapper">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">
            <User size={40} />
          </div>
        )}
        <label className="avatar-upload-btn" htmlFor="avatar-upload">
          {uploading ? <Loader2 size={16} className="spinning" /> : <Camera size={16} />}
        </label>
        <input 
          type="file" 
          id="avatar-upload" 
          accept="image/*" 
          onChange={onUpload} 
          disabled={uploading}
          style={{display: 'none'}}
        />
      </div>
      <h2 className="profile-name">{name || 'Usuário'}</h2>
      <p className="profile-email">{email}</p>
    </div>
  );
}
