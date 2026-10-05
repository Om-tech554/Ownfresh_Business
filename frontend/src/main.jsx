import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { HelmetProvider } from 'react-helmet-async'
import { ConfirmProvider } from './hooks/ConfirmContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import axios from 'axios'

// Global Axios Interceptor for Cross-Domain Authentication (myownfresh.com -> onrender.com)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("oil_token");
  const isExternalUrl = config.url && (config.url.startsWith("http://") || config.url.startsWith("https://")) && !config.url.includes("onrender.com") && !config.url.includes("localhost") && !config.url.includes(window.location.hostname);
  if (token && !config.headers.Authorization && !isExternalUrl) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auto-recover from stale deployment chunks (Vite dynamic import failures)
window.addEventListener('vite:preloadError', (event) => {
  console.warn("Vite preload error detected (stale deployment chunk). Auto-reloading page to fetch latest assets...");
  event.preventDefault();
  window.location.reload();
});

// Custom Error Boundary with automatic stale deployment chunk recovery
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
    const msg = error?.message || error?.toString() || "";
    // If a deployment occurred while the user had an old tab open, old chunks return 404
    if (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("error loading dynamically imported module")
    ) {
      const lockKey = "stale_chunk_reload_lock";
      if (!sessionStorage.getItem(lockKey)) {
        sessionStorage.setItem(lockKey, Date.now().toString());
        console.warn("Stale bundle chunk detected. Auto-reloading page to load newest build...");
        window.location.reload();
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || this.state.error?.toString() || "";
      const isChunkError = 
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("error loading dynamically imported module");

      if (isChunkError) {
        return (
          <div style={{ padding: "30px", background: "#0B0F14", color: "#F7F9FC", fontFamily: "sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ maxWidth: "480px", width: "100%", background: "#171D26", border: "1px solid #27313D", borderRadius: "20px", padding: "36px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔄</div>
              <h2 style={{ color: "#FFD600", fontSize: "22px", margin: "0 0 10px 0", fontWeight: "900" }}>New Version Available</h2>
              <p style={{ fontSize: "14px", color: "#B7C1CE", margin: "0 0 24px 0", lineHeight: "1.6" }}>
                A new version of OwnFresh has just been deployed. Please reload the page to load the latest update.
              </p>
              <button
                onClick={() => {
                  sessionStorage.removeItem("stale_chunk_reload_lock");
                  window.location.reload();
                }}
                style={{ width: "100%", padding: "14px", background: "#FFD600", color: "#111318", border: "none", borderRadius: "12px", fontWeight: "900", cursor: "pointer", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                Reload & Update Now
              </button>
            </div>
          </div>
        );
      }

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
        <ThemeProvider>
          <ErrorBoundary>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  </HelmetProvider>,
)
