import './App.css';
import NavBar from './components/Navbar';
import JobSearch from "./pages/JobSearch";
import JobPage from "./pages/JobPage";
import ResumeBuilder from './pages/ResumeBuilder';
import NotFoundPage from './pages/404';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Provider } from "react-redux";
import { store } from "./lib/redux/store";
import { AuthProvider } from './providers/AuthProvider';
import axios from 'axios';

// needed for axios to send cookies
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <div className="App">
        <main className='bg-gray-50'>
          <Provider store={store}>
            <Router>
              <AppContent />
            </Router>
          </Provider>
        </main>
      </div>
    </>
  )
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <AuthProvider>
        {!isHomePage && <NavBar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobSearch />} />
          <Route path="/job/:id" element={<JobPage />} />
          <Route path="/resume" element={<ResumeBuilder />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
