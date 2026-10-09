import Hero from '../components/home/Hero'
import LiveBanner from '../components/home/LiveBanner'
import BestPhotoCarousel from '../components/home/BestPhotoCarousel'
import QuickLinks from '../components/home/QuickLinks'
import TodaySchedule from '../components/home/TodaySchedule'
import SponsorStrip from '../components/home/SponsorStrip'

export default function Home() {
  return (
    <>
      <Hero />
      <LiveBanner />
      <BestPhotoCarousel />
      <QuickLinks />
      <TodaySchedule />
      <SponsorStrip />
      <p className="px-5 pb-6 pt-8 text-center text-[12px] text-gray-400">2026.11.6(금) 14:00 ~ 11.8(일) 11:00 · 하동 쌍계사</p>
    </>
  )
}
