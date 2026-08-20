export default function DonorSkeleton() {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-rose-100 dark:border-slate-800 p-6 flex flex-col justify-between animate-pulse space-y-6">
      <div className="space-y-4">
        {/* Top Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar Placeholder */}
            <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            
            {/* Name and Address Placeholder */}
            <div className="space-y-2 min-w-0 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-28" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg w-20" />
            </div>
          </div>

          {/* Blood Group Badge Placeholder */}
          <div className="h-10 w-12 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
        </div>

        {/* Status Tag Placeholder */}
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Action Buttons Placeholder */}
      <div className="space-y-2 pt-3 border-t border-rose-100/60 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg w-28 mx-auto" />
      </div>
    </div>
  );
}