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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 pt-20">
      {!editing ? (
        <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center">
            <img
              className="w-24 h-24 mb-3 rounded-full shadow-lg object-cover"
              src={profile.profilePic}
              alt={profile.name}
            />
            <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
              {profile.name}
            </h5>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {profile.email}
            </span>
            <div className="flex mt-4 md:mt-6">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
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
