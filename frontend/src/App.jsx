import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DonationPage from "./pages/DonationPage";
import DonorAuthPage from "./pages/DonorAuthPage";
import DonorDashboardPage from "./pages/DonorDashboardPage";
import HomePage from "./pages/HomePage";
import NgoAuthPage from "./pages/NgoAuthPage";
import NgoDashboardPage from "./pages/NgoDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="min-h-screen bg-hero-radial">
      <div className="fixed inset-0 -z-10 grid-fade opacity-40" />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/donor-auth" element={<DonorAuthPage />} />
        <Route path="/ngo-auth" element={<NgoAuthPage />} />
        <Route
          path="/donor-dashboard"
          element={
            <ProtectedRoute role="donor">
              <DonorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo-dashboard"
          element={
            <ProtectedRoute role="ngo">
              <NgoDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donate"
          element={
            <ProtectedRoute role="donor">
              <DonationPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
