import { createBrowserRouter, redirect } from "react-router-dom"
import RequireVerified from "@/components/auth/RequireVerified"
import RequireAuth from "@/components/auth/RequireAuth"
import RedirectIfAuthed from "@/components/auth/RedirectIfAuthed"


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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      // Home should bounce authed users to /ideas
      { index: true, element: <RedirectIfAuthed><Home /></RedirectIfAuthed> },
      { path: "/playground", element: <Playground /> },

      // Public auth routes should be hidden from authed users
      { path: "signin", element: <RedirectIfAuthed><SignIn /></RedirectIfAuthed> },
      { path: "register", element: <RedirectIfAuthed><Register /></RedirectIfAuthed> },

      // keep verify/reset accessible even when logged in (useful for edge cases)
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "auth/verify-email", element: <VerifyEmail /> },
      { path: "reset-password", element: <ResetPassword /> },

      // Protected sections
  { path: "ideas", element: <RequireVerified><Ideas /></RequireVerified> },
  { path: "ideas/:id", element: <RequireVerified><IdeaDetail /></RequireVerified> },
  { path: "profile", element: <RequireAuth><Profile /></RequireAuth> },
  { path: "admin/users", element: <RequireVerified><AdminUsers /></RequireVerified> },

      { path: "*", element: <NotFound /> },
    ],
  },
])
