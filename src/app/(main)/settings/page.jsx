import { Suspense} from 'react';
import SettingsLoading from '../../../components/skeletons/settingsLoading';
import SettingsContent from '../../../components/settings';

const SettingsPage = () => {
  return (
    <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
      <div className="max-w-7xl mx-auto p-8">
        <Suspense fallback={<SettingsLoading />}>
          <SettingsContent />
        </Suspense>
      </div>
    </main>
  );
};

export default SettingsPage;