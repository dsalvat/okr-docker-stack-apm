import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Objectives from "./pages/Objectives";
import ObjectiveDetail from "./pages/ObjectiveDetail";
import History from "./pages/History";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pàgina principal */}
        <Route path="/" element={<Home />} />

        {/* Dashboard principal */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Llista d’objectius */}
        <Route path="/objectives" element={<Objectives />} />

        {/* Detall d’un objectiu concret */}
        <Route path="/objectives/:id" element={<ObjectiveDetail />} />

        {/* Històric */}
        <Route path="/history" element={<History />} />

        {/* Ruta per defecte (404) */}
        <Route path="*" element={<div>404 - Pàgina no trobada</div>} />
      </Routes>
    </Router>
  );
}

export default App;
