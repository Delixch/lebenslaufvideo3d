import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProjectsStage } from './components/ProjectsStage';
import { MobileProjectsSection } from './components/MobileProjectsSection';

import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { AmbientSound } from './components/AmbientSound';
import { ScrollRail } from './components/ScrollRail';

// Ab hier traegt die Notebook-Buehne ihre Beschriftung lesbar; darunter
// uebernimmt die Liste. Dieselbe Grenze steht als min-[1200px] in beiden
// Abschnitten, damit zwischen den beiden nie eine Luecke entsteht.
const SCHMAL = '(min-width: 1200px)';

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Die Notebook-Buehne bemisst ihre gesamte Beschriftung in cqw, also an der
  // Breite des Bildes. Unter 1200px schrumpft der Infokasten darin auf 5-7px
  // Schriftgroesse — auf dem iPad war er nicht mehr lesbar. Darunter uebernimmt
  // deshalb die aufklappbare Liste, die ihre Groessen selbst mitwachsen laesst.
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(!window.matchMedia(SCHMAL).matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-[#E8DFD8] selection:bg-[#cbb59d] selection:text-black">
      <Header setIsHovered={setIsHovered} />
      <HeroSection isHovered={isHovered} setIsHovered={setIsHovered} />
      <AboutSection />
      <div id="work" className="scroll-mt-20 md:scroll-mt-0">
        {!isMobile && <ProjectsStage />}
        {isMobile && <MobileProjectsSection />}
      </div>
      <SkillsSection />
      <ExperienceSection />
      <ContactSection />
      <AmbientSound />
      <ScrollRail />
    </div>
  );
}

export default App;