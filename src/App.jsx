import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/layout/ScrollToTop.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Scene3D from './components/layout/Scene3D.jsx'
import CircuitBoard from './components/layout/CircuitBoard.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Activities from './pages/Activities.jsx'
import Awards from './pages/Awards.jsx'
import Contact from './pages/Contact.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import useGlowOnReach from './hooks/useGlowOnReach.js'

export default function App() {
  useGlowOnReach()

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Scene3D />
      <Navbar />
      {/* The circuit background lives behind the page content */}
      <main className="relative flex-1">
        <CircuitBoard />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<ComingSoon name="404" />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}
