import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard'; // Akan kita buat
import ExperienceDetail from './components/detail';

// Halaman Publik
function PublicPortfolio() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPortfolio />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/detail/:id" element={<ExperienceDetail />} />
        <Route path="/achievement/:id" element={<ExperienceDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
