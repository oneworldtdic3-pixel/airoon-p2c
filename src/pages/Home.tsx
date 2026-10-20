import { useEffect, useRef, useState } from 'react'
import Hero from '../components/home/Hero'
import LiveBanner from '../components/home/LiveBanner'
import QuickLinks from '../components/home/QuickLinks'
import TodaySchedule from '../components/home/TodaySchedule'
import SponsorStrip from '../components/home/SponsorStrip'
import InstallStrip from '../components/home/InstallStrip'
import LivePhotos from '../components/home/LivePhotos'
import ArtistTeaser from '../components/home/ArtistTeaser'
import TicketFab from '../components/home/TicketFab'
import HomePopup from '../components/home/HomePopup'
import PushPrompt from '../components/home/PushPrompt'
import ZoneCards from '../components/home/ZoneCards'

export default function Home() {
  // 맨 아래 후원사·SNS 영역이 화면 아래쪽 1/3 위로 올라오면 떠 있는 버튼을 숨긴다 (여백 없이도 내용이 가려지지 않게)
  const footer = useRef<HTMLDivElement>(null)
  const [atFooter, setAtFooter] = useState(false)
  useEffect(() => {
    const el = footer.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { rootMargin: '0px 0px -35% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <>
      <Hero />
      <div className="pt-8 empty:hidden"><InstallStrip /></div>
      <div className="pt-12"><LiveBanner /></div>
      <ArtistTeaser />
      <ZoneCards />
      <QuickLinks />
      <TodaySchedule />
      <LivePhotos />
      <div ref={footer}><SponsorStrip /></div>
      <div className="h-6" />
      <TicketFab hidden={atFooter} />
      <HomePopup />
      <PushPrompt />
    </>
  )
}
