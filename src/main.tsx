import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import './pages.css'; 
// Fix 1: Import the NotificationProvider
import { NotificationProvider } from './content/NotificationContext';

console.log("Starting app...");

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    console.log("Not in development mode, skipping mocks");
    return;
  }

  try {
    // Note: Use a dynamic import for 'browser' and 'seed' to prevent them from
    // being bundled in production builds, as you've done.
    const { worker } = await import("./mocks/browser");
    const { seedDatabase } = await import("./mocks/seed");

    console.log("Seeding database...");
    await seedDatabase();
    console.log("Starting mock worker...");
    await worker.start({ onUnhandledRequest: "bypass" });
    console.log("Mock worker started");
  } catch (err) {
    // IMPORTANT: If mocking fails, we still want the app to render.
    // We log the error but do NOT throw, allowing the .then() block to execute.
    console.error("Mock initialization failed (This is okay, app will still render):", err);
  }
}

// Function to handle the actual rendering logic
const renderApp = () => {
  console.log("Rendering App...");
  
  // Use non-null assertion (!) since index.html guarantees this element exists
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  
  root.render(
    <React.StrictMode>
      {/* Fix 2: Wrap the App with the NotificationProvider and BrowserRouter */}
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </React.StrictMode>
  );
};

// Start the mocking process, then render the application regardless of mock status
enableMocking().then(renderApp);

// --- End of main.tsx ---