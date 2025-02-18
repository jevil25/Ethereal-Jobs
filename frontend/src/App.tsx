import './App.css';
import NavBar from './components/Navbar';
import HomePage from "./pages/HomePage";
import JobPage from "./pages/JobPage";
import ResumeBuilder from './pages/ResumeBuilder';
import { BrowserRouter as Router, Route,  Routes} from 'react-router-dom';
import { Provider } from "react-redux";
import { store } from "./lib/redux/store";

function App() {
  return (
    <>
      <div className="App">
        <main className='bg-gray-50'>
          <Provider store={store}>
            <Router>
              <NavBar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/job/:id" element={<JobPage />} />
                <Route path="/resume" element={<ResumeBuilder />} />
                <Route path="*" element={<h1>Not Found</h1>} />
              </Routes>
            </Router>
          </Provider>
        </main>
      </div>
    </>
  )
}

export default App
