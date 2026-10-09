import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { Segmented, Toast } from '../components/ui'
import ProgramList from '../components/reserve/ProgramList'
import ShowerGrid from '../components/reserve/ShowerGrid'
import ParkingForm from '../components/reserve/ParkingForm'
import { useToast } from '../hooks/useToast'

type Tab = 'program' | 'shower' | 'parking'

export default function Reserve() {
  const [sp, setSp] = useSearchParams()
  const raw = sp.get('tab')
  const tab: Tab = raw === 'shower' || raw === 'parking' ? raw : 'program'
  const { msg, show } = useToast()
  return (
    <>
      <PageHeader title="예약" sub="모든 프로그램은 100% 사전예약제예요" />
      <div className="px-5 pb-4">
        <Segmented<Tab> value={tab} onChange={(v) => setSp({ tab: v }, { replace: true })} options={[{ value: 'program', label: '프로그램' }, { value: 'shower', label: '샤워실' }, { value: 'parking', label: '주차장' }]} />
        <div className="mt-5">
          {tab === 'program' && <ProgramList toast={show} />}
          {tab === 'shower' && <ShowerGrid toast={show} />}
          {tab === 'parking' && <ParkingForm toast={show} />}
        </div>
      </div>
      <Toast msg={msg} />
    </>
  )
}
