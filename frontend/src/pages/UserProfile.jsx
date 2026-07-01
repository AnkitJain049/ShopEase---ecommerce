import React, { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import EditProfile from "../components/EditProfile";
import ToggleUserData from "../components/ToggleUserData";

function UserProfile() {
  const { data: user } = useFetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/user/profile`
  );
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-20 transition-colors duration-300">
      {!editing ? (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-md p-8 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="flex flex-col items-center">
            <img
              className="w-24 h-24 mb-4 rounded-full shadow-md object-cover border-2 border-gray-100 dark:border-gray-700"
              src={profile.profilePic}
              alt={profile.name}
            />
            <h5 className="mb-1 text-2xl font-extrabold text-gray-900 dark:text-white font-display">
              {profile.name}
            </h5>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {profile.email}
            </span>
            <div className="flex mt-6">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-6 py-2.5 text-sm font-bold font-display text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm hover:shadow cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EditProfile
          user={profile}
          onCancel={() => setEditing(false)}
          onUpdate={(updatedUser) => {
            setProfile(updatedUser);
            setEditing(false);
          }}
        />
      )}
      <ToggleUserData />
    </div>
  );
}

export default UserProfile;
