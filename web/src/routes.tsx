import { createBrowserRouter, redirect } from "react-router-dom"
import RequireAuth from "@/components/auth/RequireAuth"

import AppShell from "@/layouts/AppShell"
import Home from "@/pages/Home"
import SignIn from "@/pages/SignIn"
import Register from "@/pages/Register"
import VerifyEmail from "@/pages/VerifyEmail"
import ResetPassword from "@/pages/ResetPassword"
import Ideas from "@/pages/Ideas"
import IdeaDetail from "@/pages/IdeaDetail"
import Profile from "@/pages/Profile"
import AdminUsers from "@/pages/AdminUsers"
import NotFound from "@/pages/NotFound"
import Playground from "@/pages/Playground"

// NOTE: guards (auth/verified/admin) come later; for now, everything is public.

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "/playground", element: <Playground /> },

      // Public auth routes
      { path: "signin", element: <SignIn /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "reset-password", element: <ResetPassword /> },

      // Protected sections
      { path: "ideas", element: <RequireAuth><Ideas /></RequireAuth> },
      { path: "ideas/:id", element: <RequireAuth><IdeaDetail /></RequireAuth> },
      { path: "profile", element: <RequireAuth><Profile /></RequireAuth> },
      { path: "admin/users", element: <RequireAuth><AdminUsers /></RequireAuth> },

      { path: "*", element: <NotFound /> },
    ],
  },
])
