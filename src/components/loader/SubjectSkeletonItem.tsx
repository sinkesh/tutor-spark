import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SubjectSkeletonItem = () => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
      {/* Icon */}
      <Skeleton width={48} height={48} borderRadius={8} />

      {/* Text */}
      <div className="flex-1 space-y-2">
        <Skeleton width="40%" height={14} />
        <Skeleton width="60%" height={12} />
      </div>
    </div>
  );
};

export default SubjectSkeletonItem;
