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

// needed for axios to send cookies
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <div className="App">
        <main className="">
          <Toaster />
          <Router>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </Router>
        </main>
      </div>
    </>
  );
}

// Create a wrapper component that can be used for each protected route
async function RequireAuth({
  children,
  location,
  searchParams,
}: {
  children: ReactNode;
  location: Location;
  searchParams: URLSearchParams;
}) {
  const { user, refreshUser } = useAuth();

  await refreshUser();

  if (!user) {
    return <Navigate to="/?login=true&feature-box=true" replace />;
  }

  const onboardingCompleted = searchParams.get("onboardingcompleted");
  console.log(onboardingCompleted);
  console.log(location.pathname);
  if (location.pathname === "/jobs" && onboardingCompleted === "true") {
    return <>{children}</>;
  }
  if (!user.is_onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isHomePage =
    location.pathname === "/" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/verify-email";

  return (
    <>
      {!isHomePage && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/jobs"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <JobSearch />
            </RequireAuth>
          }
        />
        <Route
          path="/job/:id"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <JobPage />
            </RequireAuth>
          }
        />
        <Route
          path="/resume"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <ResumeBuilder />
            </RequireAuth>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth location={location} searchParams={searchParams}>
              <OnboardingFlow />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
