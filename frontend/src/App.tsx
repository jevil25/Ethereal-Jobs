import './App.css';
import { ReactNode } from 'react';
import NavBar from './components/Navbar';
import JobSearch from "./pages/JobSearch";
import JobPage from "./pages/JobPage";
import ResumeBuilder from './pages/ResumeBuilderv2';
import NotFoundPage from './pages/404';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Provider } from "react-redux";
import { store } from "./lib/redux/store";
import { AuthProvider } from './providers/AuthProvider';
import axios from 'axios';
import { useAuth } from './providers/AuthProvider';

// needed for axios to send cookies
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <div className="App">
        <main className='bg-gray-50'>
          <Provider store={store}>
            <Router>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Router>
          </Provider>
        </main>
      </div>
    </>
  )
}

// Create a wrapper component that can be used for each protected route
function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/?login=true" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {!isHomePage && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
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
        <Route path="*" element={
            <NotFoundPage />
        } />
      </Routes>
    </>
  );
}

export default App;