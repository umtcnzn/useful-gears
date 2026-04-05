export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#c9a55a', borderRightColor: 'rgba(201,165,90,0.3)' }}
        />
        <span className="text-[#5a6070] text-sm tracking-wide">Loading picks…</span>
      </div>
    </div>
  )
}
