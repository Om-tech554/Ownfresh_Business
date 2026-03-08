import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const SLink = ({ to, children, scroll = true, ...rest }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault(); // prevent default navigation
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