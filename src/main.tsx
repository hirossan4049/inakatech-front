import { AppShell, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider>
      <AppShell header={{ height: 56 }} navbar={{ width: 240, breakpoint: "sm" }}>
        <React.Suspense fallback={null}>
          <RouterProvider router={router} />
        </React.Suspense>
      </AppShell>
    </MantineProvider>
  </React.StrictMode>
);
