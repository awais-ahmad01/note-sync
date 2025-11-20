
export const SettingsPageSkeleton = () => {
  return (
    <main className="flex-1 overflow-y-auto min-h-screen bg-[#1a1b23]">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-[#252837] rounded-xl border border-gray-700 overflow-hidden animate-pulse">
       
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="h-8 bg-gray-600 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-96"></div>
          </div>

          <div className="flex flex-col md:flex-row">
           
            <div className="md:w-64 bg-[#1f202e] border-r border-gray-700">
              <nav className="p-4 space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="w-full flex items-center px-3 py-3 rounded-lg bg-gray-600">
                    <div className="w-6 h-6 bg-gray-500 rounded-full mr-3"></div>
                    <div className="h-4 bg-gray-500 rounded w-20"></div>
                  </div>
                ))}
              </nav>
            </div>

           
            <div className="flex-1 p-6">
              <ProfileSettingsSkeleton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export const ProfileSettingsSkeleton = () => {
  return (
    <div className="space-y-6">
    
      <div>
        <div className="h-7 bg-gray-600 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-600 rounded w-96"></div>
      </div>

    
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-gray-600 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <div className="h-10 bg-gray-600 rounded w-32"></div>
            <div className="h-10 bg-gray-600 rounded w-24"></div>
          </div>
          <div className="h-3 bg-gray-600 rounded w-48"></div>
        </div>
      </div>

    
      <div>
        <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
        <div className="h-12 bg-gray-600 rounded w-full"></div>
      </div>

   <div>
        <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
        <div className="h-12 bg-gray-600 rounded w-full"></div>
        <div className="h-3 bg-gray-600 rounded w-64 mt-2"></div>
      </div>

    
      <div className="flex justify-end pt-4">
        <div className="h-12 bg-gray-600 rounded w-32"></div>
      </div>
    </div>
  );
};
