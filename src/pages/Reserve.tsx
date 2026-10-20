import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { Segmented, Toast } from '../components/ui'
import { LanternGlyph } from '../components/illust'
import ProgramList from '../components/reserve/ProgramList'
import ShowerGrid from '../components/reserve/ShowerGrid'
import ParkingForm from '../components/reserve/ParkingForm'
import CampSites from '../components/reserve/CampSites'
import { useToast } from '../hooks/useToast'
import { KakaoChatLine } from '../components/KakaoChat'

type Tab = 'program' | 'camp' | 'shower' | 'parking'

export default function Reserve() {
  const [sp, setSp] = useSearchParams()
  const raw = sp.get('tab')
  const tab: Tab = raw === 'shower' || raw === 'parking' || raw === 'camp' ? raw : 'program'
  const { msg, show } = useToast()
  return (
    <>
      <PageHeader eyebrow="100% 사전예약" title="예약" glyph={<LanternGlyph className="w-9" />}>
        <Segmented<Tab> value={tab} onChange={(v) => setSp({ tab: v }, { replace: true })} options={[{ value: 'program', label: '프로그램' }, { value: 'camp', label: '캠핑 사이트' }, { value: 'shower', label: '샤워실' }, { value: 'parking', label: '주차장' }]} />
      </PageHeader>
      <div className="px-5 pb-6">
        {tab === 'program' && <ProgramList toast={show} />}
        {tab === 'camp' && <CampSites toast={show} />}
        {tab === 'shower' && <ShowerGrid toast={show} />}
        {tab === 'parking' && <ParkingForm toast={show} />}
        <KakaoChatLine />
      </div>
      <Toast msg={msg} />
    </>
  )
}
