import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { HelmetProvider } from 'react-helmet-async'
import { ConfirmProvider } from './hooks/ConfirmContext.jsx'
import axios from 'axios'

// Global Axios Interceptor for Cross-Domain Authentication (myownfresh.com -> onrender.com)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("oil_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Custom Error Boundary to display runtime errors on screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "30px", background: "#ffffff", color: "#333333", fontFamily: "monospace", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", width: "100%", background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "12px", padding: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
            <h1 style={{ color: "#e53e3e", fontSize: "24px", margin: "0 0 10px 0", fontWeight: "900" }}>🚨 Runtime Error Detected</h1>
            <p style={{ fontSize: "14px", color: "#4a5568", margin: "0 0 20px 0" }}>
              The application encountered a crash. Below are the details to help fix it:
            </p>
            <div style={{ textAlign: "left", background: "#1a202c", color: "#a0aec0", padding: "15px", borderRadius: "8px", overflow: "auto", maxHeight: "300px", fontSize: "12px" }}>
              <strong style={{ color: "#fff" }}>Error:</strong> {this.state.error?.toString()}<br /><br />
              <strong style={{ color: "#fff" }}>Stack Trace:</strong>
              <pre style={{ margin: "5px 0 0 0", whiteSpace: "pre-wrap" }}>{this.state.error?.stack}</pre>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              style={{ marginTop: "25px", padding: "12px 24px", background: "#e53e3e", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}
              onMouseOver={(e) => e.target.style.background = "#c53030"}
              onMouseOut={(e) => e.target.style.background = "#e53e3e"}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <Provider store={store}>
        <ErrorBoundary>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </ErrorBoundary>
      </Provider>
    </BrowserRouter>
  </HelmetProvider>,
)
