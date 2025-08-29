import { createBrowserRouter, redirect } from "react-router-dom"
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

// NOTE: guards (auth/verified/admin) come later; for now, everything is public.

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "signin", element: <SignIn /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "reset-password", element: <ResetPassword /> },

      // App sections
      { path: "ideas", element: <Ideas /> },
      { path: "ideas/:id", element: <IdeaDetail /> },
      { path: "profile", element: <Profile /> },
      { path: "admin/users", element: <AdminUsers /> },
      { path: "*", element: <NotFound /> },
    ],
  },
])
