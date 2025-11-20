
const NoteCardSkeleton = () => {
  return (
    <div className="bg-[#252837] rounded-xl p-6 border border-gray-700 animate-pulse">
     
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-16 h-6 bg-gray-600 rounded-full"></div>
          <div className="w-20 h-6 bg-gray-600 rounded-full"></div>
        </div>
      </div>

     
      <div className="mb-2">
        <div className="h-6 bg-gray-600 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
      </div>

    
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-600 rounded w-5/6"></div>
        <div className="h-4 bg-gray-600 rounded w-4/6"></div>
      </div>

      
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gray-600 rounded w-16"></div>
      </div>
    </div>
  );
};

export default NoteCardSkeleton;