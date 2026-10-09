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
      <div className="pt-2"><LiveBanner /></div>
      <BestPhotoCarousel />
      <QuickLinks />
      <TodaySchedule />
      <SponsorStrip />
      <div className="h-6" />
    </>
  )
}
