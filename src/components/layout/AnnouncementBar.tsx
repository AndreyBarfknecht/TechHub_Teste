import React from 'react';
import { Link } from 'react-router-dom';

interface AnnouncementBarProps {
  message?: string;
  link?: string;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = "Frete grátis em compras acima de R$ 200!",
  link = "/products"
}) => {
  return (
    <div className="announcement-bar">
      <div className="container">
        <Link to={link} className="announcement-content">
          {message}
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementBar;
