import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Home from "./pages/HomePage.jsx";
import Compress from "./pages/Compression.jsx";
import Convert from "./pages/Convert.jsx";
import Resize from "./pages/Resize.jsx";
import Extract from "./pages/Extract.jsx";
import ImagesToPDF from "./pages/ImagesToPDF.jsx";
import Contact from "./pages/Contact.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import ApiDocs from "./pages/ApiDocs.jsx";
import Support from "./pages/Support.jsx";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compress" element={<Compress />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/resize" element={<Resize />} />
            <Route path="/extract" element={<Extract />} />
            <Route path="/images-to-pdf" element={<ImagesToPDF />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/api" element={<ApiDocs />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
