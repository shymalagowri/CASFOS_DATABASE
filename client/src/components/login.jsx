/**
 * Overview:
 * This is a React component for a login page used in an asset management system. 
 * It provides a user interface for authentication with role-based access. 
 * The component includes:
 * - A role selection panel with radio buttons for different user roles.
 * - A login form with username, password fields, and password visibility toggle.
 * - API integration using axios for authentication.
 * - Navigation to role-specific dashboards upon successful login.
 * - Error handling and loading states for user feedback.
 * - Styling with CSS classes and Font Awesome icons for a modern look.
 * 
 * The component uses React Router for navigation and state management with useState hooks.
 * It communicates with a backend API at 'http://${ip}:${port}/api/users/login' for authentication.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaLongArrowAltRight } from 'react-icons/fa';
import '../styles/main1.css';
import '../fonts/font-awesome-4.7.0/css/font-awesome.min.css';
import '../styles/util.css';

// Define role options for the radio buttons
const ROLE_OPTIONS = [
  { value: 'headofoffice', label: 'Head of Office' },
  { value: 'principal', label: 'Principal' },
  { value: 'assetmanager', label: 'Asset Manager' },
  { value: 'storekeeper', label: 'Storekeeper' },
  { value: 'facultyentrystaff', label: 'Faculty Entry Staff' },
  { value: 'facultyverifier', label: 'Faculty Verifier' },
  { value: 'viewer', label: 'Viewer' },
];

const Login = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // State management for form inputs and UI
  const [name, setUsername] = useState(''); // Stores username input
  const [password, setPassword] = useState(''); // Stores password input
  const [role, setRole] = useState('headofoffice'); // Stores selected role
  const [loading, setLoading] = useState(false); // Loading state for login process
  const [message, setMessage] = useState(''); // Stores error/success messages
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const navigate = useNavigate(); // Navigation hook from react-router

  /**
   * Handles the login form submission
   * @param {Event} e - Form submission event
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setLoading(true); // Set loading state
    setMessage(''); // Clear any previous messages

    // Check if username or password is empty
    if (!name.trim() || !password.trim()) {
      setLoading(false);
      setMessage('Enter username and password');
      return;
    }

    try {
      // Send login request to backend API
      const response = await axios.post(`http://${ip}:${port}/api/users/login`, {
        name,
        password,
        role,
      });

      setLoading(false); // Reset loading state

      // Handle successful login
      if (response.data === 'success') {
        // Define routes for each role's dashboard
        const dashboardRoutes = {
          headofoffice: '/headofofficedashboard',
          principal: '/principaldashboard',
          assetmanager: '/assetmanagerdashboard',
          storekeeper: '/storekeeperdashboard',
          facultyentrystaff: '/facultyentrystaffdashboard',
          facultyverifier: '/facultyverifierdashboard',
          viewer: '/viewerdashboard',
        };

        // Get the route for the selected role
        const route = dashboardRoutes[role];
        if (route) {
          // Navigate to dashboard with username as query parameter
          navigate(`${route}?username=${encodeURIComponent(name)}`);
        } else {
          setMessage('Invalid role'); // Handle unknown role
        }
      } else {
        setMessage('Invalid login credentials');
      }
    } catch (error) {
      // Handle login errors
      setLoading(false);
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message;
      // if (errorMessage === 'User not found' || errorMessage === 'Wrong password') {
      //   setMessage('Invalid login credentials');
      // } 
        console.log(error)
        setMessage(errorMessage || 'Something went wrong');
      
    }
  };

  /**
   * Toggles password visibility between text and password types
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-container">
      <div className="limiter">
        <div className="container-login100">
          {/* Main login wrapper with fade-in animation */}
          <div className="wrap-login100 fade-in">
            {/* Left Panel - Now contains only the role selection */}
            <div className="login-left-panel">
              {/* Role selection container */}
              <div className="role-selection-container">
                <h3 className="role-selection-title">Select Your Role</h3>
                <form className="role-selection-form">
                  {/* Map through role options to create radio buttons */}
                  {ROLE_OPTIONS.map((option, index) => (
                    <label key={index} className="role-option">
                      <input
                        type="radio"
                        value={option.value}
                        name="role"
                        checked={role === option.value}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <span className="role-label">{option.label}</span>
                    </label>
                  ))}
                </form>
              </div>
            </div>

            {/* Right Panel - Contains logo and login form */}
            <div className="login-right-panel">
              {/* Logo container moved to right panel */}
              <div className="login-image-container">
                <img
                  src="/images/CASFOS-Coimbatore.ico"
                  alt="CASFOS Logo"
                  className="login-image"
                />
              </div>

              {/* Login form title */}
              <h1 className="login-title">Login</h1>

              {/* Login form */}
              <form onSubmit={handleLogin} className="login-form">
                {/* Username input field */}
                <div className="input-group">
                  <label htmlFor="username" className="input-label">
                    Username
                  </label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      id="username"
                      type="text"
                      name="name"
                      placeholder="Enter your username"
                      value={name}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password input field with visibility toggle */}
                <div className="input-group">
                  <label htmlFor="password" className="input-label">
                    Password
                  </label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {/* Toggle password visibility icon */}
                    {showPassword ? (
                      <FaEyeSlash
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    ) : (
                      <FaEye
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                </div>

                {/* Login submit button */}
                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                {/* Display error/success messages */}
                {message && <p className="error-message">{message}</p>}

                {/* Additional links (e.g., registration) */}
                <div className="login-links">
                  <Link to="/register" className="register-link">
                    Create your Account
                    <FaLongArrowAltRight />
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;