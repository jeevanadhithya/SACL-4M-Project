import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import FormRouter from "./forms/FormRouter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route to Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Core Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Dynamic Route to any of the 10 Consultancy Forms in forms/ folder */}
        <Route path="/forms/:formId" element={<FormRouter />} />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
