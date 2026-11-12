import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import RoomsPage from "@/pages/RoomsPage";
import RoomDetailsPage from "@/pages/RoomDetailsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/rooms",
            element: <RoomsPage />,
          },
          {
            path: "/rooms/:roomId",
            element: <RoomDetailsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
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
    path: "*",
    element: <NotFoundPage />,
  },
]);