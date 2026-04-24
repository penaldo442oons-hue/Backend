import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Workspace from "./pages/Workspace";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function AuthedShell({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <ProtectedRoute>{children}</ProtectedRoute>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="relative flex min-h-dvh flex-col text-zinc-100">
        <div className="welp-app-bg absolute inset-0 -z-20" aria-hidden />
        <div className="pointer-events-none absolute inset-0 -z-10 welp-grid opacity-[0.35]" aria-hidden />
        <div className="relative z-0 flex min-h-dvh flex-1 flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/workspace"
              element={
                <AuthedShell>
                  <Workspace />
                </AuthedShell>
              }
            />
            <Route
              path="/contact"
              element={
                <AuthedShell>
                  <Contact />
                </AuthedShell>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
