import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

// Recharts uses ResizeObserver while it measures the dashboard chart.
// Chromium can report a harmless resize notification loop during layout;
// prevent CRA's development overlay from treating that browser warning as
// an application crash.
const ignoreResizeObserverLoop = (event) => {
  if (
    typeof event?.message === "string" &&
    event.message.includes("ResizeObserver loop")
  ) {
    event.stopImmediatePropagation();
  }
};

window.addEventListener("error", ignoreResizeObserverLoop);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
