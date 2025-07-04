/*import { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Fixed import

interface User {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  name?: string;
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Decode token to check expiration
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }

        // Use stored user data as fallback
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if (parsedUser.id === decoded.id && parsedUser.role === decoded.role) {
            setUser(parsedUser);
            setLoading(false);
            return;
          }
        }

        // Fetch user data from backend
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData: User = response.data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Failed to authenticate user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  return { user, loading, error, logout };
};

export default useAuth;

*/
/*import { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  name?: string;
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Decode token to check expiration
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }

        // Fetch user data from backend
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Failed to authenticate user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, error, logout };
};

export default useAuth;*/