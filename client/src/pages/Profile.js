import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [editingSkillsHave, setEditingSkillsHave] = useState(false);
  const [skillsHaveInput, setSkillsHaveInput] = useState([]);
  const [editingSkillsWant, setEditingSkillsWant] = useState(false);
  const [skillsWantInput, setSkillsWantInput] = useState([]);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        console.log('Profile API response:', data);
        if (!response.ok || !data || !data._id) {
          setError('Failed to load profile. Please log in again or contact support.');
          setLoading(false);
          return;
        }
        setUserData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error fetching profile. Please try again.');
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setError('Not logged in. Please log in again.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (userData) {
      setNameInput(userData.name);
      setSkillsHaveInput(userData.skillsHave || []);
      setSkillsWantInput(userData.skillsWant || []);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div>
              <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="w-48 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded-full" />
                ))}
              </div>
            </div>
            <div>
              <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="text-center mt-8">No user data found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {toast && (
        <Toast message={toast} type={toastType} onClose={() => setToast('')} />
      )}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <label className="relative cursor-pointer group">
            <img
              src={avatarPreview || userData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random&size=96`}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border group-hover:opacity-80 transition"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  setAvatarFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarPreview(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <span className="absolute bottom-0 left-0 w-full text-xs text-center bg-black/60 text-white py-1 rounded-b opacity-0 group-hover:opacity-100 transition">Change</span>
          </label>
          {avatarFile && (
            <button
              className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
              onClick={async () => {
                try {
                  const updated = await updateProfile({ profilePicture: avatarPreview });
                  setUserData(updated);
                  setAvatarFile(null);
                  setToastType('success');
                  setToast('Profile picture updated!');
                  setTimeout(() => setToast(''), 2000);
                } catch (err) {
                  setToastType('error');
                  setToast('Error updating picture');
                  setTimeout(() => setToast(''), 2000);
                }
              }}
            >Save</button>
          )}
          <div>
            {editingName ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const updated = await updateProfile({ name: nameInput });
                    setUserData(updated);
                    setEditingName(false);
                    setToastType('success');
                    setToast('Name updated!');
                    setTimeout(() => setToast(''), 2000);
                  } catch (err) {
                    setToastType('error');
                    setToast('Error updating name');
                    setTimeout(() => setToast(''), 2000);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="border rounded px-2 py-1 text-lg"
                  autoFocus
                />
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition">Save</button>
                <button type="button" onClick={() => setEditingName(false)} className="text-gray-500 px-2">Cancel</button>
              </form>
            ) : (
              <h2 className="text-xl font-semibold cursor-pointer hover:underline" onClick={() => setEditingName(true)}>{userData.name}</h2>
            )}
            <p className="text-gray-600">{userData.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Skills I Have</h3>
            {editingSkillsHave ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const updated = await updateProfile({ skillsHave: skillsHaveInput });
                    setUserData(updated);
                    setEditingSkillsHave(false);
                    setToastType('success');
                    setToast('Skills updated!');
                    setTimeout(() => setToast(''), 2000);
                  } catch (err) {
                    setToastType('error');
                    setToast('Error updating skills');
                    setTimeout(() => setToast(''), 2000);
                  }
                }}
                className="flex flex-wrap gap-2 items-center"
              >
                <input
                  value={skillsHaveInput.join(', ')}
                  onChange={e => setSkillsHaveInput(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="border rounded px-2 py-1 text-sm w-64"
                  autoFocus
                />
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition">Save</button>
                <button type="button" onClick={() => setEditingSkillsHave(false)} className="text-gray-500 px-2">Cancel</button>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2 cursor-pointer" onClick={() => setEditingSkillsHave(true)}>
                {userData.skillsHave && userData.skillsHave.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm animate-skillBar"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {skill}
                  </span>
                ))}
                {(!userData.skillsHave || userData.skillsHave.length === 0) && <span className="text-gray-400">Click to add skills</span>}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Skills I Want to Learn</h3>
            {editingSkillsWant ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const updated = await updateProfile({ skillsWant: skillsWantInput });
                    setUserData(updated);
                    setEditingSkillsWant(false);
                    setToastType('success');
                    setToast('Skills updated!');
                    setTimeout(() => setToast(''), 2000);
                  } catch (err) {
                    setToastType('error');
                    setToast('Error updating skills');
                    setTimeout(() => setToast(''), 2000);
                  }
                }}
                className="flex flex-wrap gap-2 items-center"
              >
                <input
                  value={skillsWantInput.join(', ')}
                  onChange={e => setSkillsWantInput(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="border rounded px-2 py-1 text-sm w-64"
                  autoFocus
                />
                <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition">Save</button>
                <button type="button" onClick={() => setEditingSkillsWant(false)} className="text-gray-500 px-2">Cancel</button>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2 cursor-pointer" onClick={() => setEditingSkillsWant(true)}>
                {userData.skillsWant && userData.skillsWant.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm animate-skillBar"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {skill}
                  </span>
                ))}
                {(!userData.skillsWant || userData.skillsWant.length === 0) && <span className="text-gray-400">Click to add skills</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;