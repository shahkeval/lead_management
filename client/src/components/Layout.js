import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, showNavbar = true }) => {
  return (
    <div>
      {showNavbar && <Navbar />}
      <div>{children}</div>
    </div>
  );
};

export default Layout; 