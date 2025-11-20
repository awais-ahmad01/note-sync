

import { Suspense } from 'react';
import ActivityLogsContent from '../../../components/activityLogs';
import ActivityLogsLoading from '../../../components/skeletons/activityLogsLoading';

const ActivityLogs = () => {
  return (
    <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
      <div className="max-w-7xl mx-auto p-8">
        <Suspense fallback={<ActivityLogsLoading count={6} />}>
          <ActivityLogsContent />
        </Suspense>
      </div>
    </main>
  );
};

export default ActivityLogs;