import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sileo";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster
      options={{
        position: "top-right",
        duration: 3000,
      }}
    />
  </BrowserRouter>,
);
