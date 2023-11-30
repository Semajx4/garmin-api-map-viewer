import React from 'react';
import '../styles/HomePage.css';
import MapComponent from './leafletMap.tsx';

function HomePage() {
  return (
    <div className="home-page">
      <nav className="navbar">
        <ul className="nav-list">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">Photos</a></li>
          <li><a href="#services">Map</a></li>
          <li className="login-button"><a href="#login">Login</a></li>
          {/* Add more navigation items as needed */}
        </ul>
      </nav>

      <header className="header">
        <h1>Pacific North West Trail</h1>
        <h2></h2>
      </header>

      <main className="main-content">
        {/* Rest of your content */}
        <MapComponent></MapComponent>
      </main>

      <footer className="footer">
        <p>Contact us: contact@example.com</p>
      </footer>
    </div>
  );
}

export default HomePage;
