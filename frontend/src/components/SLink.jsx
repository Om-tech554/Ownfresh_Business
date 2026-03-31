import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const SLink = ({ to, children, scroll = true, onClick, ...rest }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // If a custom onClick was provided, execution shouldn't completely block the router unless requested.
    if (onClick) {
        onClick(e);
    }
    
    e.preventDefault(); // prevent default HTML anchor jumps
    
    if (scroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    
    navigate(to);
  };

  return (
    <Link to={to} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
};

export default SLink;