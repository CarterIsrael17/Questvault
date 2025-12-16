import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import PastQuestions from "./pages/PastQuestions"; 
import AdminPage from "./pages/AdminPage"; 
import AdminRoute from "./components/AdminRoute"; 
import { supabase } from "./supabaseClient";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → redirect to SignIn */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Auth / User Pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />

        {/* Past Questions Page */}
        <Route path="/past-questions" element={<PastQuestions />} />

        {/* Admin Upload Page (Protected) */}
        <Route
          path="/admin-upload"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
