// Reusable skeleton shimmer components for loading states

export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-zinc-800/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-zinc-700/30 before:to-transparent ${className}`}
    />
  );
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return (
    <SkeletonBox className={`h-4 rounded-md ${className}`} />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-3">
      <SkeletonText className="w-1/3 h-3" />
      <SkeletonText className="w-1/2 h-6" />
    </div>
  );
}

export function SkeletonJobCard() {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-2/3 h-5" />
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-4 w-14 rounded" />
            <SkeletonText className="w-32 h-3" />
          </div>
        </div>
        <SkeletonBox className="h-6 w-20 rounded-lg shrink-0" />
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/30">
        <SkeletonBox className="h-7 w-20 rounded-lg" />
        <SkeletonBox className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50">
      <SkeletonBox className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonText className="w-1/4 h-3" />
        <SkeletonText className="w-1/3 h-2.5" />
      </div>
      <SkeletonBox className="h-5 w-16 rounded-full shrink-0" />
      <SkeletonBox className="h-5 w-20 rounded-full shrink-0 hidden sm:block" />
      <SkeletonBox className="h-7 w-16 rounded-lg shrink-0" />
    </div>
  );
}

export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonWeekGroup() {
  return (
    <div className="space-y-4">
      {/* Week header */}
      <div className="flex items-center gap-4">
        <SkeletonBox className="h-3 w-24 rounded-md" />
        <div className="flex-1 h-px bg-zinc-800/50" />
        <SkeletonBox className="h-5 w-12 rounded-full" />
      </div>
      {/* Job cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonJobCard key={i} />
        ))}
      </div>
    </div>
  );
}
