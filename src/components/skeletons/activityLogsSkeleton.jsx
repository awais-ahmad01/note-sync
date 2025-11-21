
// const ActivityLogsSkeleton = ({ count = 6 }) => {
//   return (
//     <div className="space-y-3">
//       {Array.from({ length: count }, (_, index) => (
//         <div key={index} className="bg-[#252837] rounded-xl p-6 border border-gray-700 animate-pulse">
//           <div className="flex items-start gap-4">
          
//             <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-full"></div>
            
          
//             <div className="flex-1 min-w-0 space-y-2">
            
//               <div className="h-4 bg-gray-600 rounded w-3/4"></div>
//               <div className="h-3 bg-gray-600 rounded w-1/2"></div>
              
             
//               <div className="flex items-center gap-2 mt-2">
//                 <div className="w-3 h-3 bg-gray-600 rounded"></div>
//                 <div className="h-3 bg-gray-600 rounded w-16"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ActivityLogsSkeleton;



const ActivityLogsSkeleton = ({ count = 6 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-[#F5F5F5] rounded-xl p-6 border border-[#E0E0E0] animate-pulse">
          <div className="flex items-start gap-4">
            {/* Icon skeleton */}
            <div className="flex-shrink-0 w-10 h-10 bg-[#E0E0E0] rounded-full"></div>
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Main text skeleton */}
              <div className="h-4 bg-[#E0E0E0] rounded w-3/4"></div>
              <div className="h-3 bg-[#E0E0E0] rounded w-1/2"></div>
              
              {/* Timestamp skeleton */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 bg-[#E0E0E0] rounded"></div>
                <div className="h-3 bg-[#E0E0E0] rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLogsSkeleton;