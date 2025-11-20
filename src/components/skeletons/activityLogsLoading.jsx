
import ActivityLogsSkeleton from './activityLogsSkeleton';

const ActivityLogsLoading = ({ count = 6 }) => {
  return (
    <div>

      <div className="mb-8">
        <div className="h-8 bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-96 animate-pulse"></div>
      </div>
     
      <ActivityLogsSkeleton count={count} />
    </div>
  );
};

export default ActivityLogsLoading;