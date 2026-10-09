import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../data/AppProvider'
import { SPOTS } from '../../data/constants'
import { BottomSheet, Chip } from '../ui'
import type { SpotTag } from '../../data/types'

export default function UploadSheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: (m: string) => void }) {
  const { uploadPhoto } = useApp()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [spot, setSpot] = useState<SpotTag | null>(null)
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) return setPreview(null)
    const u = URL.createObjectURL(file)
    setPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  useEffect(() => { if (!open) { setFile(null); setSpot(null) } }, [open])

  const submit = async () => {
    if (!file || !spot) return
    setBusy(true)
    const r = await uploadPhoto(file, spot)
    setBusy(false)
    toast(r.ok ? '사진을 올렸습니다' : r.error)
    if (r.ok) onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="사진 올리기">
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={() => input.current?.click()} className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-tile border border-dashed border-gray-300 bg-white text-[14px] font-semibold text-sub">
        {preview ? <img src={preview} alt="선택한 사진 미리보기" className="h-full w-full object-cover" /> : '사진 선택'}
      </button>
      <p className="eyebrow mb-3 mt-6">어디서 찍었나요 <span className="normal-case tracking-normal text-red-500">(필수)</span></p>
      <div className="flex flex-wrap gap-2">
        {SPOTS.map((s) => <Chip key={s} active={spot === s} onClick={() => setSpot(s)}>{s}</Chip>)}
      </div>
      <button disabled={!file || !spot || busy} onClick={submit} className="btn mt-7 w-full">{busy ? '올리는 중' : '올리기'}</button>
    </BottomSheet>
  )
}
