import './App.css';
import { ReactNode } from 'react';
import NavBar from './components/Navbar';
import JobSearch from "./pages/JobSearch";
import JobPage from "./pages/JobPage";
import ResumeBuilder from './pages/ResumeBuilderv2';
import NotFoundPage from './pages/404';
import HomePage from './pages/HomePage';
import ResetPasswordPage from './pages/ResetPassword';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { Provider } from "react-redux";
import { store } from "./lib/redux/store";
import { AuthProvider } from './providers/AuthProvider';
import axios from 'axios';
import { useAuth } from './providers/AuthProvider';
import VerifyEmailPage from './pages/verify-email';
import OnboardingFlow from './pages/OnBoarding';
import { Toaster } from "./components/ui/sonner";

// needed for axios to send cookies
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <div className="App">
        <main className=''>
          <Provider store={store}>
            <Router>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Router>
          </Provider>
        </main>
        <Toaster />
      </div>
    </>
  )
}

// Create a wrapper component that can be used for each protected route
function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/?login=true&feature-box=true" replace />;
  }

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const onboardingCompleted = searchParams.get('onboardingcompleted');
  if (location.pathname === "jobs" && onboardingCompleted === 'true') {
    console.log('onboarding completed');
    return;
  }
  console.log(`user is onboarded: ${user}`);
  if (!user.is_onboarded && location.pathname !== '/onboarding') {
    console.log('onboarding not completed');
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/reset-password' || location.pathname === '/verify-email';

  return (
    <>
      {!isHomePage && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path='/verify-email' element={<VerifyEmailPage />} />
        <Route path="/jobs" element={
          <RequireAuth>
            <JobSearch />
          </RequireAuth>
        } />
        <Route path="/job/:id" element={
          <RequireAuth>
            <JobPage />
          </RequireAuth>
        } />
        <Route path="/resume" element={
          <RequireAuth>
            <ResumeBuilder />
          </RequireAuth>
        } />
        <Route path='/onboarding' element={
          <RequireAuth>
            <OnboardingFlow />
          </RequireAuth>
        } />
        <Route path="*" element={
            <NotFoundPage />
        } />
      </Routes>
    </>
  );
}

export default App;