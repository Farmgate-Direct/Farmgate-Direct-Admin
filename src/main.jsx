import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sileo";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    {/* <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#166534",
          color: "#ffffff",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
        },
        success: {
          iconTheme: {
            primary: "#ffffff",
            secondary: "#166534",
          },
          style: {
            background: "#15803d",
            color: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ffffff",
            secondary: "#dc2626",
          },
          style: {
            background: "#dc2626",
            color: "#ffffff",
          },
        },
      }}
    /> */}

    <Toaster
      options={{
        position: "top-right",
        duration: 3000,
      }}
    />
  </BrowserRouter>,
);
