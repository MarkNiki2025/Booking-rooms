import { createBrowserRouter } from "react-router";

import LoginPage from "@/pages/loginPage/LoginPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import RoomDetailsPage from "@/pages/RoomDetailsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import MainLayout from "@/components/layout/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "rooms/:roomId",
        element: <RoomDetailsPage />,
      },
    ],
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