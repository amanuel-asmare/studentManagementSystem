import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import  {useAuth}  from '../AuthContext';

const Logout: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/" replace />;
};

export default Logout;