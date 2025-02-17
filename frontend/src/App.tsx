import './App.css';
import HomePage from "./pages/HomePage";
import JobPage from "./pages/JobPage";
import { BrowserRouter as Router, Route,  Routes} from 'react-router-dom';

function App() {
  return (
    <>
      <div className="App">
        <main>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/job/:id" element={<JobPage />} />
            </Routes>
          </Router>
        </main>
      </div>
    </>
  )
}

export default App
