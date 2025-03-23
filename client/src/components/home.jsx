import React from 'react';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Home Page</h1>
      <p>This is a simple homepage for your application.</p>
      <a 
        href="/" 
        style={{
          textDecoration: 'none',
          color: 'white',
          backgroundColor: '#4CAF50',
          padding: '10px 20px',
          borderRadius: '5px',
          display: 'inline-block',
          marginTop: '20px'
        }}
      >
        Go to Login
      </a>
    </div>
  );
};

export default Home;
