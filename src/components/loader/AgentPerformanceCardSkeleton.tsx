import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const AgentPerformanceCardSkeleton = () => {
  return (
    <div className="p-5 border-l-4 border-l-muted rounded-r-xl bg-card shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Status + Badge Row */}
          <div className="flex items-center gap-2 mb-3">
            <Skeleton width={28} height={28} borderRadius={6} />
            <Skeleton width={110} height={20} borderRadius={12} />
            <Skeleton width={90} height={20} borderRadius={12} />
          </div>

          {/* Agent Name */}
          <Skeleton width={180} height={14} className="mb-2" />

          {/* Description */}
          <Skeleton height={12} className="mb-1" />
          <Skeleton height={12} width="80%" className="mb-3" />

          {/* Metrics Row */}
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton width={90} height={12} />
            <Skeleton width={110} height={12} />
            <Skeleton width={130} height={12} />
            <Skeleton width={80} height={12} />
          </div>
        </div>

        {/* Score Section */}
        <div className="flex flex-col items-end gap-3">
          <Skeleton width={50} height={28} />
          <Skeleton width={16} height={16} />
        </div>
      </div>
    </div>
  );
};
