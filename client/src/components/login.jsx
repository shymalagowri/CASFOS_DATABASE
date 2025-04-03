import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";  // Added Link here
import '../styles/main1.css';
import '../styles/util.css';
import '../fonts/font-awesome-4.7.0/css/font-awesome.min.css';

const Login = () => {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('headofoffice');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let actualRole = role;
      
      // For combined roles, check which specific role matches the username
      if (role === 'assetmanagerentry') {
        console.log("Asse");
        const assetManagerResponse = await axios.post('http://localhost:3001/api/users/checkUser', { name, role: 'assetmanager' });
        if (assetManagerResponse.data.exists) {
          actualRole = 'assetmanager';
        } else {
          actualRole = 'assetentrystaff';
        }
      } else if (role === 'facultyentrysuper') {
        const facultyEntryResponse = await axios.post('http://localhost:3001/api/users/checkUser', { name, role: 'facultyentrystaff' });
        if (facultyEntryResponse.data.exists) {
          actualRole = 'facultyentrystaff';
        } else {
          actualRole = 'superintendent';
        }
      }

      const response = await axios.post('http://localhost:3001/api/users/login', {
        name,
        password,
        role: actualRole,
      });

      setLoading(false);

      if (response.data === "success") {
        switch(actualRole) {
          case 'headofoffice':
            navigate(`/headofofficedashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'principal':
            navigate(`/principaldashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'assetmanager':
            navigate(`/assetmanagerdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'assetentrystaff':
            navigate(`/assetentrystaffdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'facultyentrystaff':
            navigate(`/facultyentrystaffdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'superintendent':
            navigate(`/superintendentdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'viewer':
            navigate(`/viewerdashboard?username=${encodeURIComponent(name)}`);
            break;
          default:
            setMessage('Invalid role');
        }
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      setLoading(false);
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="only-login">
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
            <div className="login100-pic js-tilt">
              <img src="images/CASFOS-Coimbatore.jpg" alt="IMG" /><br /><br />
              <div>
                <form>
                  {['Head of Office', 'Principal', 'Asset Manager/Entry Staff', 'Faculty Entry Staff/Superintendent', 'Viewer'].map((label, index) => (
                    <label key={index} className="particles-checkbox-container">
                      <input
                        type="radio"
                        className="particles-checkbox"
                        value={['headofoffice', 'principal', 'assetmanagerentry', 'facultyentrysuper', 'viewer'][index]}
                        name="role"
                        checked={role === ['headofoffice', 'principal', 'assetmanagerentry', 'facultyentrysuper', 'viewer'][index]}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </form>
              </div>
            </div>

            <div className="login100-form validate-form">
              <p className="login100-form-title">Login</p>
              <form onSubmit={handleLogin}>
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
                    <i className="fa fa-envelope" aria-hidden="true"></i>
                  </span>
                </div>

                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type={showPassword ? "text" : "password"}
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
                  <span
                    className="fa fa-eye"
                    style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '10px' }}
                    onClick={() => setShowPassword(!showPassword)}
                  ></span>
                </div>

                <div className="container-login100-form-btn">
                  <button className="login100-form-btn" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>

              {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

              <div className="text-center p-t-12">
                <span className="txt1">Forgot</span>
                <a className="txt2" href="#">Username / Password?</a>
              </div>

              <div className="text-center p-t-136">
                <Link className="txt2" to="/register">
                  Create your Account
                  <i className="fa fa-long-arrow-right m-l-5" aria-hidden="true"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;