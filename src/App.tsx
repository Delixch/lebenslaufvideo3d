import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { MobileProjectsSection } from './components/MobileProjectsSection';

import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { AmbientSound } from './components/AmbientSound';

function App() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full min-h-screen bg-black text-[#E8DFD8] selection:bg-[#cbb59d] selection:text-black">
      <Header setIsHovered={setIsHovered} />
      <HeroSection isHovered={isHovered} setIsHovered={setIsHovered} />
      <AboutSection />
      <div id="work">
        <ProjectsSection />
        <MobileProjectsSection />
      </div>
      <SkillsSection />
      <ExperienceSection />
      <ContactSection />
      <AmbientSound />
    </div>
  );
}

export default App;