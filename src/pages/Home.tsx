import Hero from '../components/home/Hero'
import LiveBanner from '../components/home/LiveBanner'
import QuickLinks from '../components/home/QuickLinks'
import TodaySchedule from '../components/home/TodaySchedule'
import SponsorStrip from '../components/home/SponsorStrip'
import InstallStrip from '../components/home/InstallStrip'
import LivePhotos from '../components/home/LivePhotos'
import ArtistTeaser from '../components/home/ArtistTeaser'

export default function Home() {
  return (
    <>
      <Hero />
      <div className="pt-8"><InstallStrip /></div>
      <div className="pt-8"><LiveBanner /></div>
      <ArtistTeaser />
      <QuickLinks />
      <TodaySchedule />
      <LivePhotos />
      <SponsorStrip />
      <div className="h-6" />
    </>
  )
}
