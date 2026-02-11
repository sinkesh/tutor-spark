import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AgentCardSkeleton = () => {
  return (
    <div className="rounded-xl border border-border p-4 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} borderRadius={8} />
          <div className="space-y-2">
            <Skeleton width={140} height={14} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton width={24} height={24} borderRadius={6} />
      </div>

      {/* Description */}
      <Skeleton height={12} className="mb-2" />
      <Skeleton height={12} width="85%" />
    </div>
  );
};

export default AgentCardSkeleton;
