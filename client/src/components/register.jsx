import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import '../styles/main1.css';
import '../styles/util.css';
import '../styles/font-awesome.min.css';

const Register = () => {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [ministry, setMinistry] = useState('');
  const [role, setRole] = useState('admin'); // Default role is admin
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Clear previous messages

    try {
        const response = await axios.post('http://localhost:3001/api/users/register', {
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

        if (response.data.message === "User registered successfully!") {
            navigate('/'); // Redirect to login or home page
        } else {
          console.log(response);
            setMessage(response.data.message); // Display success or other messages
        }
    } catch (error) {
        setLoading(false);
        // Display validation or other error messages
        console.log(error.response);

        if (error.response && error.response.data && error.response.data.message) {
            setMessage(error.response.data.message);
        } else {
            setMessage('Something went wrong. Please try again.');
        }
    }
};

return (
  <div className="limiter">
      <div className="container-login100">
          <div className="wrap-login100">
              <div className="login100-pic js-tilt">
                  <img src="images/CASFOS-Coimbatore.jpg" alt="IMG" /><br /><br />
                  <div>
                      <form>
                          <label className="particles-checkbox-container">
                              <input
                                  type="radio"
                                  className="particles-checkbox"
                                  value="admin"
                                  name="role"
                                  checked={role === 'admin'}
                                  onChange={(e) => setRole(e.target.value)}
                              />
                              <span>Administrator</span>
                          </label>
                          <br />
                          <label className="particles-checkbox-container">
                              <input
                                  type="radio"
                                  className="particles-checkbox"
                                  value="dataentry"
                                  name="role"
                                  checked={role === 'dataentry'}
                                  onChange={(e) => setRole(e.target.value)}
                              />
                              <span>Data Entry Staff</span>
                          </label>
                          <br />
                          <label className="particles-checkbox-container">
                              <input
                                  type="radio"
                                  className="particles-checkbox"
                                  value="viewer"
                                  name="role"
                                  checked={role === 'viewer'}
                                  onChange={(e) => setRole(e.target.value)}
                              />
                              <span>Viewer</span>
                          </label>
                      </form>
                  </div>
              </div>

              <div className="login100-form validate-form">
                  <p className="login100-form-title" id="selectedLabel">
                      Register
                  </p>

                  <form onSubmit={handleRegister}>
                      {/* Name Field */}
                      <div className="wrap-input100 validate-input">
                          <input
                              className="input100"
                              type="text"
                              name="name"
                              placeholder="Username"
                              value={name}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                          />
                          <span className="focus-input100"></span>
                          <span className="symbol-input100">
                              <i className="fa fa-user" aria-hidden="true"></i>
                          </span>
                      </div>

                      {/* Date of Birth Field */}
                      <div className="wrap-input100 validate-input">
                          <input
                              className="input100"
                              type="date"
                              name="dob"
                              placeholder="Date of Birth"
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                              required
                          />
                          <span className="focus-input100"></span>
                          <span className="symbol-input100">
                              <i className="fa fa-calendar" aria-hidden="true"></i>
                          </span>
                      </div>

                      {/* Designation Field */}
                      <div className="wrap-input100 validate-input">
                          <input
                              className="input100"
                              type="text"
                              name="designation"
                              placeholder="Designation"
                              value={designation}
                              onChange={(e) => setDesignation(e.target.value)}
                              required
                          />
                          <span className="focus-input100"></span>
                          <span className="symbol-input100">
                              <i className="fa fa-briefcase" aria-hidden="true"></i>
                          </span>
                      </div>

                      {/* Phone Field */}
                      <div className="wrap-input100 validate-input">
                          <input
                              className="input100"
                              type="tel"
                              name="phone"
                              placeholder="Phone No"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                          />
                          <span className="focus-input100"></span>
                          <span className="symbol-input100">
                              <i className="fa fa-phone" aria-hidden="true"></i>
                          </span>
                      </div>

                      <div className="wrap-input100 validate-input">
                          <input
                              className="input100"
                              type="text"
                              name="organization"
                              placeholder="Organization"
                              value={organization}
                              onChange={(e) => setOrganization(e.target.value)}
                              required
                          />
                          <span className="focus-input100"></span>
                          <span className="symbol-input100">
                              <i className="fa fa-building" aria-hidden="true"></i>
                          </span>
                      </div>

                      {/* Ministry Field */}
                      <div className="wrap-input100 validate-input">
                          <input
                              className="input100"
                              type="text"
                              name="ministry"
                              placeholder="Ministry"
                              value={ministry}
                              onChange={(e) => setMinistry(e.target.value)}
                              required
                          />
                          <span className="focus-input100"></span>
                          <span className="symbol-input100">
                              <i className="fa fa-university" aria-hidden="true"></i>
                          </span>
                      </div>

                      {/* Password Field */}
                      <div className="wrap-input100 validate-input">
                          <input
                              className="input100"
                              type="password"
                              name="password"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                          />
                          <span className="focus-input100"></span>
                          <span className="symbol-input100">
                              <i className="fa fa-lock" aria-hidden="true"></i>
                          </span>
                      </div>

                      {/* Submit Button */}
                      <div className="container-login100-form-btn">
                          <button className="login100-form-btn" type="submit" disabled={loading}>
                              {loading ? 'Registering...' : 'Register'}
                          </button>
                      </div>
                  </form>

                  {/* Display validation or error messages */}
                  {message && (
                      <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
                          {message}
                      </p>
                  )}
              </div>
          </div>
      </div>
  </div>
);
};

export default Register;