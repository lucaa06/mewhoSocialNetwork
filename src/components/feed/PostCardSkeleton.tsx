export function PostCardSkeleton() {
  return (
    <div
      className="rounded-3xl p-4 space-y-3"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Author row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[28%] shrink-0 skeleton" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-28 rounded-lg skeleton" />
          <div className="h-2.5 w-20 rounded-lg skeleton" />
        </div>
        <div className="h-6 w-16 rounded-full skeleton" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-lg skeleton" />
        <div className="h-3.5 w-full rounded-lg skeleton" />
        <div className="h-3.5 w-5/6 rounded-lg skeleton" />
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-3 pt-1">
        <div className="h-7 w-16 rounded-full skeleton" />
        <div className="h-7 w-16 rounded-full skeleton" />
        <div className="h-7 w-16 rounded-full skeleton" />
      </div>
    </div>
  );
}

export function PostFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
