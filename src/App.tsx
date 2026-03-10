
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.tsx";
import Home from "./pages/Home.tsx";
import Products from "./pages/Products.tsx";

function App() {
  return (
    <Router>
      <div className="App fade-in">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
