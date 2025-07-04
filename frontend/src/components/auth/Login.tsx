import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../AuthContext';

interface Errors {
  email?: string;
  password?: string;
}

interface LoginProps {
  switchToSignIn: () => void;
}

const Login: React.FC<LoginProps> = ({ switchToSignIn }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  // Display auth errors from useAuth
  useEffect(() => {
    if (authError) {
      setApiError(authError);
    }
  }, [authError]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      setIsLoading(true);
      try {
        console.log('Attempting login with email:', email);
        await login(email.trim(), password);
        setEmail('');
        setPassword('');
        setErrors({});
        setSuccessMessage('Login Successful! Welcome back!');
        // Navigation is handled by the login function in AuthContext
        setTimeout(() => {
          console.log('Navigating after success message');
        }, 1000); // Log after delay to confirm timing
      } catch (error: any) {
        console.error('Login error:', error);
        setApiError(error.message || 'Failed to log in');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-cyan-500/30 flex items-center space-x-2">
            <span className="text-cyan-400 text-lg font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-red-500/90 backdrop-blur-lg border border-red-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-red-500/30 flex items-center space-x-2">
            <span className="text-white text-lg font-semibold">{apiError}</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 glitch-bg z-0" />
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 z-10">
        <div className="flex-1 min-w-0 p-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8 animate-pulse">Log In</h2>
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${
                  errors.email ? 'border-pink-500' : ''
                }`}
                placeholder="Email"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${
                  email ? '-top-6 text-sm text-cyan-200' : ''
                }`}
              >
                Email
              </label>
              {errors.email && <span className="text-pink-500 text-sm text-center block">{errors.email}</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${
                  errors.password ? 'border-pink-500' : ''
                }`}
                placeholder="Password"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${
                  password ? '-top-6 text-sm text-cyan-200' : ''
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-cyan-300/70 hover:text-cyan-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
              </button>
              {errors.password && <span className="text-pink-500 text-sm text-center block">{errors.password}</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 animate-pulse disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            <p className="text-center text-sm text-cyan-300/80 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchToSignIn}
                className="text-pink-400 hover:underline hover:text-pink-300"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
        <div className="flex-1 min-w-0 bg-gradient-to-br from-cyan-900 to-pink-900 flex items-center justify-center p-8">
          <div className="text-center text-white/80">
            <h3 className="text-2xl font-semibold mb-2">Welcome Back</h3>
            <p>Access your account with ease.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface Errors {
  email?: string;
  password?: string;
}

interface LoginProps {
  switchToSignIn: () => void;
}

const Login: React.FC<LoginProps> = ({ switchToSignIn }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      setIsLoading(true);
      try {
        const loginUrl = '/api/login'; // Updated to match backend route
        console.log('Sending login request to:', loginUrl);
        const response = await axios.post(loginUrl, { email: email.trim(), password });
        localStorage.setItem('token', response.data.token); // Store token
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data
        setEmail('');
        setPassword('');
        setErrors({});
        setSuccessMessage('Login Successful! Welcome back!');
        console.log('User logged in:', response.data);

        const { role } = response.data.user;
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/components/admin');
          } else if (role === 'student') {
            navigate('/components/student');
          } else if (role === 'teacher') {
            navigate('/components/teacher');
          } else {
            setApiError('Unknown user role');
          }
        }, 3000);
      } catch (error: any) {
        console.error('Login error:', error);
        setApiError(
          error.response?.data?.message || 'Failed to log in'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      //{/* Success Message Toast }
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-cyan-500/30 flex items-center space-x-2">
            <span className="text-cyan-400 text-lg font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-red-500/90 backdrop-blur-lg border border-red-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-red-500/30 flex items-center space-x-2">
            <span className="text-white text-lg font-semibold">{apiError}</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 glitch-bg z-0" />
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 z-10">
        <div className="flex-1 min-w-0 p-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8 animate-pulse">Log In</h2>
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.email ? 'border-pink-500' : ''}`}
                placeholder="Email"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${email ? '-top-6 text-sm text-cyan-200' : ''}`}
              >
                Email
              </label>
              {errors.email && <span className="text-pink-500 text-sm text-center block">{errors.email}</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.password ? 'border-pink-500' : ''}`}
                placeholder="Password"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${password ? '-top-6 text-sm text-cyan-200' : ''}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-cyan-300/70 hover:text-cyan-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size= {24} />}
              </button>
              {errors.password && <span className="text-pink-500 text-sm text-center block">{errors.password}</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 animate-pulse disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            <p className="text-center text-sm text-cyan-300/80 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchToSignIn}
                className="text-pink-400 hover:underline hover:text-pink-300"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
        <div className="flex-1 min-w-0 bg-gradient-to-br from-cyan-900 to-pink-900 flex items-center justify-center p-8">
          <div className="text-center text-white/80">
            <h3 className="text-2xl font-semibold mb-2">Welcome Back</h3>
            <p>Access your account with ease.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;*/



/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface Errors {
  name?: string;
  password?: string;
}

interface LoginProps {
  switchToSignIn: () => void;
}

const Login: React.FC<LoginProps> = ({ switchToSignIn }) => {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setApiError('');
  if (validateForm()) {
    setIsLoading(true);
    try {
      const loginUrl = '/api/login';
      console.log('Sending login request to:', loginUrl);
      const response = await axios.post(loginUrl, { name: name.trim(), password });
      setName('');
      setPassword('');
      setErrors({});
      setSuccessMessage('Login Successful! Welcome back!');
      console.log('User logged in:', response.data);

      const { role } = response.data.user;
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/components/admin');
        } else if (role === 'student') {
          navigate('/components/student');
        } else if (role === 'teacher') {
          navigate('/components/teacher');
        } else {
          setApiError('Unknown user role');
        }
      }, 3000);
    } catch (error: any) {
      console.error('Login error:', error);
      setApiError(
        error.response?.data?.message || 'Failed to log in'
      );
    } finally {
      setIsLoading(false);
    }
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Success Message Toast /}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-cyan-500/30 flex items-center space-x-2">
            <span className="text-cyan-400 text-lg font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-red-500/90 backdrop-blur-lg border border-red-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-red-500/30 flex items-center space-x-2">
            <span className="text-white text-lg font-semibold">{apiError}</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 glitch-bg z-0" />
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 z-10">
        <div className="flex-1 min-w-0 p-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8 animate-pulse">Log In</h2>
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.name ? 'border-pink-500' : ''}`}
                placeholder="Name"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${name ? '-top-6 text-sm text-cyan-200' : ''}`}
              >
                Name
              </label>
              {errors.name && <span className="text-pink-500 text-sm text-center block">{errors.name}</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.password ? 'border-pink-500' : ''}`}
                placeholder="Password"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${password ? '-top-6 text-sm text-cyan-200' : ''}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-cyan-300/70 hover:text-cyan-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
              </button>
              {errors.password && <span className="text-pink-500 text-sm text-center block">{errors.password}</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 animate-pulse disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            <p className="text-center text-sm text-cyan-300/80 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchToSignIn}
                className="text-pink-400 hover:underline hover:text-pink-300"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
        <div className="flex-1 min-w-0 bg-gradient-to-br from-cyan-900 to-pink-900 flex items-center justify-center p-8">
          <div className="text-center text-white/80">
            <h3 className="text-2xl font-semibold mb-2">Welcome Back</h3>
            <p>Access your account with ease.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;*/
/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface Errors {
  name?: string;
  password?: string;
}

interface LoginProps {
  switchToSignIn: () => void;
}

const Login: React.FC<LoginProps> = ({ switchToSignIn }) => {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      setIsLoading(true);
      try {
        const loginUrl = '/api/login'; // Use proxy
        console.log('Sending login request to:', loginUrl);
        const response = await axios.post(loginUrl, { name, password });
        setName('');
        setPassword('');
        setErrors({});
        setSuccessMessage('Login Successful! Welcome back!');
        console.log('User logged in:', response.data);
        setTimeout(() => navigate('/components/admin'), 3000); // Navigate after 3s
      } catch (error: any) {
        console.error('Login error:', error);
        setApiError(
          error.code === 'ERR_NETWORK' && error.message.includes('Cross-Origin')
            ? 'CORS error: Cannot connect to server. Check backend configuration.'
            : error.response?.data?.message || 'Failed to log in'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      //{/* Success Message Toast *}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/50 rounded-lg px-6 py-3 shadow-2xl shadow-cyan-500/30 flex items-center space-x-2">
            <span className="text-cyan-400 text-lg font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 glitch-bg z-0" />
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#1a1a2e]/90 backdrop-blur-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 z-10">
        <div className="flex-1 min-w-0 p-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8 animate-pulse">Log In</h2>
          {apiError && <p className="text-pink-500 text-center mb-6">{apiError}</p>}
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.name ? 'border-pink-500' : ''}`}
                placeholder="Name"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${name ? '-top-6 text-sm text-cyan-200' : ''}`}
              >
                Name
              </label>
              {errors.name && <span className="text-pink-500 text-sm text-center block">{errors.name}</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 bg-transparent border-2 border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 rounded-lg neon-glow peer ${errors.password ? 'border-pink-500' : ''}`}
                placeholder="Password"
                disabled={isLoading}
              />
              <label
                className={`absolute left-4 top-3 text-cyan-300/70 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-cyan-200 ${password ? '-top-6 text-sm text-cyan-200' : ''}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-cyan-300/70 hover:text-cyan-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
              </button>
              {errors.password && <span className="text-pink-500 text-sm text-center block">{errors.password}</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 animate-pulse disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            <p className="text-center text-sm text-cyan-300/80 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchToSignIn}
                className="text-pink-400 hover:underline hover:text-pink-300"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
        <div className="flex-1 min-w-0 bg-gradient-to-br from-cyan-900 to-pink-900 flex items-center justify-center p-8">
          <div className="text-center text-white/80">
            <h3 className="text-2xl font-semibold mb-2">Welcome Back</h3>
            <p>Access your account with ease.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;*/