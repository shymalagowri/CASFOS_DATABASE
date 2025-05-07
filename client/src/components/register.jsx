/**
 * Overview:
 * This is a React component for a registration page used in an asset management system.
 * It provides a user interface for registering new users with role-based access.
 * The component includes:
 * - A role selection panel with radio buttons for individual roles.
 * - A registration form with fields for username, password, date of birth, designation, phone, organization, and ministry.
 * - Password visibility toggle functionality.
 * - API integration using axios to send registration data to the backend.
 * - Error handling for cases like existing usernames or invalid inputs, displayed in red text.
 * - Display of "User submitted for approval" message in green, centered text upon successful registration, styled like the login warning but in green.
 * - Form clearing and delayed navigation to the login page after successful registration.
 * - Styling with CSS classes and Font Awesome icons for a modern look.
 *
 * The component uses React Router for navigation and state management with useState hooks.
 * It communicates with a backend API at 'http://${ip}:${port}/api/users/register' for registration.
 */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCalendar, FaBriefcase, FaPhone, FaBuilding, FaUniversity, FaLongArrowAltRight, FaCheck, FaTimes } from 'react-icons/fa';
import '../styles/main1.css';
import '../fonts/font-awesome-4.7.0/css/font-awesome.min.css';
import '../styles/util.css';

// Define role options for selection
const ROLE_OPTIONS = [
  { value: 'headofoffice', label: 'Head of Office' },
  { value: 'principal', label: 'Principal' },
  { value: 'assetmanager', label: 'Asset Manager' },
  { value: 'storekeeper', label: 'Storekeeper' },
  { value: 'facultyentrystaff', label: 'Faculty Entry Staff' },
  { value: 'facultyverifier', label: 'Faculty Verifier' },
  { value: 'viewer', label: 'Viewer' },
];

const Register = () => {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  // State management for form inputs and UI
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [dob, setDob] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [ministry, setMinistry] = useState('');
  const [role, setRole] = useState('headofoffice');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Derived state for password match and length validation
  const passwordsMatch = password === reenterPassword && password.length > 0;
  const isPasswordValid = password.length >= 8;
  const isUsernameValid = name.length <= 100;

  /**
   * Toggles password visibility between text and password types
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Handles registration form submission
   * @param {Event} e - Form submission event
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate password length
    if (!isPasswordValid) {
      setLoading(false);
      alert('Password must be at least 8 characters long.');
      return;
    }

    // Validate password match
    if (!passwordsMatch) {
      setLoading(false);
      setMessage('Passwords do not match.');
      return;
    }

    // Validate username length
    if (!isUsernameValid) {
      setLoading(false);
      setMessage('Username cannot exceed 100 characters.');
      return;
    }

    try {
      const response = await axios.post(`http://${ip}:${port}/api/users/register`, {
        name,
        password,
        dob,
        designation,
        phone,
        organization,
        ministry,
        role,
      });

      setLoading(false);

      if (response.data.message === 'User registered successfully!') {
        setMessage('User submitted for approval');
        // Show SweetAlert2 success alert
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Your account has been submitted for approval!',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
        });
        // Clear form fields
        setUsername('');
        setPassword('');
        setReenterPassword('');
        setDob('');
        setDesignation('');
        setPhone('');
        setOrganization('');
        setMinistry('');
        setRole('headofoffice');
        // Navigate to login page after 3 seconds
        setTimeout(() => {
          setMessage('');
          navigate('/login');
        }, 3000);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message;
      setMessage(errorMessage || 'Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100 fade-in">
            <div className="login-left-panel" style={{ justifyContent: 'flex-start' }}>
              <div className="login-image-container">
                <img
                  src="/images/CASFOS-Coimbatore.ico"
                  alt="CASFOS Logo"
                  className="login-image"
                />
              </div>
              <div className="role-selection-container">
                <h3 className="role-selection-title">Select Your Role</h3>
                <form className="role-selection-form">
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
            <div className="login-right-panel">
              <h1 className="login-title">Register</h1>
              <form onSubmit={handleRegister} className="login-form">
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
                      maxLength={100}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="dob" className="input-label">
                    Date of Birth
                  </label>
                  <div className="input-wrapper">
                    <FaCalendar className="input-icon" />
                    <input
                      id="dob"
                      type="date"
                      name="dob"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="designation" className="input-label">
                    Designation
                  </label>
                  <div className="input-wrapper">
                    <FaBriefcase className="input-icon" />
                    <input
                      id="designation"
                      type="text"
                      name="designation"
                      placeholder="Enter your designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="phone" className="input-label">
                    Phone No
                  </label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="organization" className="input-label">
                    Organization
                  </label>
                  <div className="input-wrapper">
                    <FaBuilding className="input-icon" />
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      placeholder="Enter your organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="ministry" className="input-label">
                    Ministry
                  </label>
                  <div className="input-wrapper">
                    <FaUniversity className="input-icon" />
                    <input
                      id="ministry"
                      type="text"
                      name="ministry"
                      placeholder="Enter your ministry"
                      value={ministry}
                      onChange={(e) => setMinistry(e.target.value)}
                      required
                    />
                  </div>
                </div>
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
                      minLength={8}
                      required
                    />
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
                <div className="input-group">
                  <label htmlFor="reenter-password" className="input-label">
                    Re-enter Password
                  </label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      id="reenter-password"
                      type={showPassword ? 'text' : 'password'}
                      name="reenter-password"
                      placeholder="Re-enter your password"
                      value={reenterPassword}
                      onChange={(e) => setReenterPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    {reenterPassword && (
                      passwordsMatch ? (
                        <FaCheck className="password-match-icon" style={{ color: 'green' }} />
                      ) : (
                        <FaTimes className="password-match-icon" style={{ color: 'red' }} />
                      )
                    )}
                  </div>
                </div>
                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
                {message && (
                  <p className={message === 'User submitted for approval' ? 'success-message' : 'error-message'}>
                    {message}
                  </p>
                )}
                <div className="login-links">
                  <Link to="/" className="register-link">
                    Already have an account? Login
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

export default Register;