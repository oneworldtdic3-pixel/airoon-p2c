import Hero from '../components/home/Hero'
import LiveBanner from '../components/home/LiveBanner'
import QuickLinks from '../components/home/QuickLinks'
import TodaySchedule from '../components/home/TodaySchedule'
import SponsorStrip from '../components/home/SponsorStrip'
import InstallStrip from '../components/home/InstallStrip'

export default function Home() {
  return (
    <>
      <Hero />
      <div className="pt-8"><InstallStrip /></div>
      <div className="pt-8"><LiveBanner /></div>
      <QuickLinks />
      <TodaySchedule />
      <SponsorStrip />
      <div className="h-6" />
    </>
  )
}
