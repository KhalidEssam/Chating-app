import React from 'react';

const Logout: React.FC = () => {
  const handleLogout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  );
};

export default Logout;
