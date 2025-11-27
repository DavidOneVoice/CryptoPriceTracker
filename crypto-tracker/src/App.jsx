import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CryptoList from "./CryptoList";
import PrivacyPolicy from "./PrivacyPolicy";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Main page */}
        <Route path="/" element={<CryptoList />} />

        {/* Privacy Policy page */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
};

export default App;
