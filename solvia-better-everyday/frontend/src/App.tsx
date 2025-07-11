import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";

import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <div className="font-inter bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="mood" element={<MoodTracker />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
