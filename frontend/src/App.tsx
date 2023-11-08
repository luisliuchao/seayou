import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./index.css";

import Login from "./Login";
import Home from "./Home";
import PrivateRoute from "./PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateRoute />}>
          <Route path="/*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}
