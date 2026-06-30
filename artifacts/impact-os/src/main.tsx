import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function getOrCreateVisitorId(): string {
  const key = 'impactlabs_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

pendo.initialize({
  visitor: {
    id: getOrCreateVisitorId()
  }
});

createRoot(document.getElementById("root")!).render(<App />);
