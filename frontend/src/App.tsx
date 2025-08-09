import "./App.css";
import { ReactNode } from "react";
import NavBar from "./components/Navbar";
import JobSearch from "./pages/JobSearch";
import JobPage from "./pages/JobPage";
import ResumeBuilder from "./pages/ResumeBuilderv2";
import NotFoundPage from "./pages/404";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/ResetPassword";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useSearchParams,
  Location,
} from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import axios from "axios";
import { useAuth } from "./providers/useAuth";
import VerifyEmailPage from "./pages/verify-email";
import OnboardingFlow from "./pages/OnBoarding";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./pages/Profile";
import UnsubscribePage from "./pages/unsubscribe";
import Footer from "./components/HomePage/Footer";
import FeedbackButton from "./components/FeedbackButton";
import { Role } from "./types/data";
import AdminDashboard from "./pages/Admin";
import { HelmetProvider } from "react-helmet-async";

// needed for axios to send cookies
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <div className="App">
        <main className="pt-18 md:pt-24 from-white via-white to-blue-50/30">
          <Toaster />
          <HelmetProvider>
            <Router>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Router>
          </HelmetProvider>
        </main>
      </div>
    </>
  );
}

// Create a wrapper component that can be used for each protected route
function RequireAuth({
  children,
  location,
  searchParams,
  adminRoute = false,
}: {
  children: ReactNode;
  location: Location;
  searchParams: URLSearchParams;
  adminRoute?: boolean;
}) {
  const { user } = useAuth();
  if (!user || user === null) {
    return <Navigate to="/?login=true&feature-box=true" replace />;
  }

  const onboardingCompleted = searchParams.get("onboardingcompleted");
  if (location.pathname === "/jobs" && onboardingCompleted === "true") {
    return <>{children}</>;
  }
  if (!user.is_onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (adminRoute && user.role !== Role.Admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isHomePage =
    location.pathname === "/" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/verify-email" ||
    location.pathname === "/unsubscribe";

  return (
    <>
      {!isHomePage && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />
        <Route
          path="/jobs"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <JobSearch />
              <FeedbackButton />
            </RequireAuth>
          }
        />
        <Route
          path="/job/:id"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <JobPage />
              <FeedbackButton />
            </RequireAuth>
          }
        />
        <Route
          path="/resume"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <ResumeBuilder />
              <FeedbackButton />
            </RequireAuth>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <OnboardingFlow />
              <FeedbackButton />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <ProfilePage />
              <FeedbackButton />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth
              location={location}
              searchParams={searchParams}
              adminRoute
            >
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
