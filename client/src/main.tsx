import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("React app starting...");

const root = document.getElementById("root");
if (!root) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, creating React app...");
  createRoot(root).render(<App />);
}
