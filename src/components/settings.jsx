// 'use client';
// import { useState, useEffect} from 'react';
// import ProfileSettings from './profileSettings';
// import PasswordSettings from './passwordSettings';
// import AccountSettings from './accountSettings';
// import { getCurrentUserProfile } from '../lib/supabaseClient';
// import SettingsLoading from './skeletons/settingsLoading';

// const SettingsContent = () => {
//   const [activeTab, setActiveTab] = useState('profile');
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       setLoading(true);
//       const { data: profile, error } = await getCurrentUserProfile();
//       console.log("Loaded user profile:", profile);
      
//       if (error) throw error;
      
//       setUserData(profile);
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tabs = [
//     { id: 'profile', name: 'Profile', icon: '👤' },
//     { id: 'password', name: 'Password', icon: '🔒' },
//     { id: 'account', name: 'Account', icon: '⚙️' },
//   ];

//   if (loading) {
//     return <SettingsLoading />;
//   }

//   return (
//     <div className="bg-[#252837] rounded-xl border border-gray-700 overflow-hidden">
     
//       <div className="px-6 py-4 border-b border-gray-700">
//         <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
//         <p className="text-gray-400">
//           Manage your account settings and preferences
//         </p>
//       </div>

//       <div className="flex flex-col md:flex-row">
      
//         <div className="md:w-64 bg-[#1f202e] border-r border-gray-700">
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`w-full flex items-center px-3 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${
//                   activeTab === tab.id
//                     ? 'bg-[#252837] text-indigo-400 shadow-sm border border-gray-600'
//                     : 'text-gray-400 hover:text-white hover:bg-[#252837]'
//                 }`}
//               >
//                 <span className="mr-3 text-lg">{tab.icon}</span>
//                 {tab.name}
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="flex-1 p-6">
//           {activeTab === 'profile' && <ProfileSettings userData={userData} onProfileUpdate={loadUserData} />}
//           {activeTab === 'password' && <PasswordSettings />}
//           {activeTab === 'account' && <AccountSettings />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsContent;


'use client';
import { useState, useEffect} from 'react';
import ProfileSettings from './profileSettings';
import PasswordSettings from './passwordSettings';
import AccountSettings from './accountSettings';
import { getCurrentUserProfile } from '../lib/supabaseClient';
import SettingsLoading from './skeletons/settingsLoading';

const SettingsContent = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: profile, error } = await getCurrentUserProfile();
      console.log("Loaded user profile:", profile);
      
      if (error) throw error;
      
      setUserData(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'password', name: 'Password', icon: '🔒' },
    { id: 'account', name: 'Account', icon: '⚙️' },
  ];

  if (loading) {
    return <SettingsLoading />;
  }

  return (
    <div className="bg-[#F5F5F5] rounded-xl border border-[#E0E0E0] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E0E0E0]">
        <h1 className="text-3xl font-bold text-[#2E2E2E] mb-2">Settings</h1>
        <p className="text-[#666666]">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 bg-white border-r border-[#E0E0E0]">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#F5F5F5] text-[#B22222] shadow-sm border border-[#E0E0E0]'
                    : 'text-[#666666] hover:text-[#2E2E2E] hover:bg-[#F5F5F5]'
                }`}
              >
                <span className="mr-3 text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6 bg-white">
          {activeTab === 'profile' && <ProfileSettings userData={userData} onProfileUpdate={loadUserData} />}
          {activeTab === 'password' && <PasswordSettings />}
          {activeTab === 'account' && <AccountSettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;