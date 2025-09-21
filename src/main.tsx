import { AppShell, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TreeDetailPage from "./pages/TreeDetailPage";
import JournalCreatePage from "./pages/JournalCreatePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/tree/:treeId",
    element: (
      <ProtectedRoute>
        <TreeDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tree/:treeId/create",
    element: (
      <ProtectedRoute>
        <JournalCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications />
      <AuthProvider>
        <AppShell header={{ height: 56 }} navbar={{ width: 240, breakpoint: "sm" }}>
          <React.Suspense fallback={null}>
            <RouterProvider router={router} />
          </React.Suspense>
        </AppShell>
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);
