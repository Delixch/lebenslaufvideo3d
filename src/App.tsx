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
import { GoldFrame } from './components/GoldFrame';
import { ScrollRail } from './components/ScrollRail';

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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
      <GoldFrame />
      <ScrollRail />
    </div>
  );
}

export default App;