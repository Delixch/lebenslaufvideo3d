import { useState } from 'react';
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
import { TestCalibrate } from './components/TestCalibrate';

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const calibrateMode = typeof window !== 'undefined' && window.location.search.includes('calibrate');

  if (calibrateMode) {
    return <TestCalibrate />;
  }

  return (
    <div className="w-full min-h-screen bg-black text-[#E8DFD8] selection:bg-[#cbb59d] selection:text-black">
      <Header setIsHovered={setIsHovered} />
      <HeroSection isHovered={isHovered} setIsHovered={setIsHovered} />
      <AboutSection />
      <div id="work">
        <ProjectsStage />
        <MobileProjectsSection />
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