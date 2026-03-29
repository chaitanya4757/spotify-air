import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // ✅ New Redux Provider
import { store } from "./store";         // ✅ The central store you'll create
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ Redux must wrap everything to provide global state to all zones */}
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);