import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryProvider } from "./providers/query.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <App />
    </QueryProvider>
  </React.StrictMode>
);
