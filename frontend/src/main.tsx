import { StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// @ts-ignore
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
  document.getElementById("root")
);
