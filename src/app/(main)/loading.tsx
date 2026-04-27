export default function Loading() {
  return (
    <div className="flex-1 min-w-0 space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-black/6 rounded-2xl p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-black/8" />
            <div className="space-y-1.5">
              <div className="w-28 h-3.5 rounded-full bg-black/8" />
              <div className="w-20 h-3 rounded-full bg-black/5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3.5 rounded-full bg-black/6" />
            <div className="w-4/5 h-3.5 rounded-full bg-black/6" />
            <div className="w-2/3 h-3.5 rounded-full bg-black/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
