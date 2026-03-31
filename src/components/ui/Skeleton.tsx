// src/components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-xl", className)}
      style={{ minHeight: "1rem" }}
    />
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function DigestSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="border-t border-navy-800/50 pt-3 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
export function QuizSkeleton() {
  return (
    <div className="glass-card rounded-[32px] p-8 space-y-8 animate-pulse border border-slate-100">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
      <div className="flex gap-4 pt-6">
        <Skeleton className="h-14 w-40 rounded-2xl" />
        <div className="flex-1" />
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </div>
    </div>
  );
}
