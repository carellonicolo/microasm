import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { EditorProvider } from "./contexts/EditorContext";

// Registra Service Worker per caching avanzato (solo in produzione)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrato:', registration.scope);
        
        // Controlla aggiornamenti ogni 24 ore
        setInterval(() => {
          registration.update();
        }, 24 * 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Registrazione Service Worker fallita:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <EditorProvider>
    <App />
  </EditorProvider>
);
