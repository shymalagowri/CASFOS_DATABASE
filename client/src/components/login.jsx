import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import '../styles/main1.css';
import '../styles/util.css';
import '../fonts/font-awesome-4.7.0/css/font-awesome.min.css';
var username1 = "";
const Login = () => {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Default role is admin
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate(); // Initialize navigate function

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      username1 = name;
      const response = await axios.post('http://localhost:3001/api/users/login', {
        name,
        password,
        role,
      });

      setLoading(false);

      console.log(response.data);

      if (response.data === "success") {
        const userData = { name };
        if (role === 'admin') {
          navigate(`/admindashboard?username=${encodeURIComponent(username1)}`); 
        } else if(role === 'dataentry') {
          navigate(`/dataentrydashboard?username=${encodeURIComponent(username1)}`); 
        } 
      else{
        navigate(`/viewerdashboard?username=${encodeURIComponent(username1)}`); 
      }
    }else {
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
              Login
            </p>

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
                  type={showPassword ? "text" : "password"} // Toggle between password and text
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
                  onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
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
              <a className="txt2" href="#">
                Username / Password?
              </a>
            </div>

            <div className="text-center p-t-136">
              <Link className="txt2" to="/register">
                Create your Account
                <i
                  className="fa fa-long-arrow-right m-l-5"
                  aria-hidden="true"
                ></i>
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