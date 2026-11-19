import Hero from '../components/home/Hero.jsx'
import AboutTeaser from '../components/home/AboutTeaser.jsx'
import InNumbers from '../components/home/InNumbers.jsx'
import AwardsShowcase from '../components/home/AwardsShowcase.jsx'
import WhatWeDo from '../components/home/WhatWeDo.jsx'
import TeamSection from '../components/home/TeamSection.jsx'
import JoinCTA from '../components/home/JoinCTA.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <InNumbers />
      <AwardsShowcase />
      <WhatWeDo />
      <TeamSection />
      <JoinCTA />
    </>
  )
}
