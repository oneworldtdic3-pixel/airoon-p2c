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
  // 캠핑존 카드 구간(카드마다 예매 버튼이 있음)이나 맨 아래 후원사·SNS 영역이 보이면 떠 있는 예매 버튼을 숨긴다
  const zones = useRef<HTMLDivElement>(null)
  const footer = useRef<HTMLDivElement>(null)
  const [atZones, setAtZones] = useState(false)
  const [atFooter, setAtFooter] = useState(false)
  useEffect(() => {
    const ios: IntersectionObserver[] = []
    const watch = (el: HTMLElement | null, set: (v: boolean) => void, rootMargin: string) => {
      if (!el) return
      const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { rootMargin })
      io.observe(el)
      ios.push(io)
    }
    watch(zones.current, setAtZones, '0px')
    watch(footer.current, setAtFooter, '0px 0px -35% 0px')
    return () => ios.forEach((io) => io.disconnect())
  }, [])
  // 아래로 스크롤하는 동안에는 내용을 가리지 않게 내리고, 위로 올리거나 맨 위 근처면 다시 보인다
  const [scrollingDown, setScrollingDown] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        if (y < 120) setScrollingDown(false)
        else if (y > last + 6) setScrollingDown(true)
        else if (y < last - 6) setScrollingDown(false)
        last = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <>
      <Hero />
      <div className="pt-8 empty:hidden"><InstallStrip /></div>
      <div className="pt-12"><LiveBanner /></div>
      <ArtistTeaser />
      <div ref={zones}><ZoneCards /></div>
      <QuickLinks />
      <TodaySchedule />
      <LivePhotos />
      <div ref={footer}><SponsorStrip /></div>
      <div className="h-6" />
      <TicketFab hidden={atZones || atFooter || scrollingDown} />
      <HomePopup />
      <PushPrompt />
    </>
  )
}
