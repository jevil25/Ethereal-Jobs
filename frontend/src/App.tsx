import './App.css';
import NavBar from './components/Navbar';
import HomePage from "./pages/HomePage";
import JobPage from "./pages/JobPage";
import ResumeBuilder from './pages/ResumeBuilder';
import { BrowserRouter as Router, Route,  Routes} from 'react-router-dom';

function App() {
  return (
    <>
      <div className="App">
        <main className='bg-gray-50'>
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/job/:id" element={<JobPage />} />
              <Route path="/resume" element={<ResumeBuilder />} />
              <Route path="*" element={<h1>Not Found</h1>} />
            </Routes>
          </Router>
        </main>
      </div>
    </>
  )
}

export default App
