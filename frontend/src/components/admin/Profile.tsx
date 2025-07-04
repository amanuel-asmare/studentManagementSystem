
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaUser, FaCog, FaGlobe, FaSun, FaMoon, FaBell, FaClock, FaUpload, FaLock, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface Settings {
  language: string;
  theme: "light" | "dark";
  notifications: boolean;
  timeZone: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const languages = ["English", "Amharic"];
const timeZones = ["Africa/Addis_Ababa", "UTC", "America/New_York", "Europe/London"];

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [profile, setProfile] = useState<AdminProfile>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "admin",
    profileImage: user?.profileImage || "",
  });
  const [settings, setSettings] = useState<Settings>(
    user?.settings || {
      language: "English",
      theme: "light",
      notifications: true,
      timeZone: "Africa/Addis_Ababa",
    }
  );
  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState<Partial<AdminProfile>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChange>>({});
  const [settingsErrors, setSettingsErrors] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  // Fetch admin profile on mount
  useEffect(() => {
    isMounted.current = true;
    const fetchProfile = async () => {
      if (!isMounted.current) return;
      setLoading(true);
      setFetchError(null);
      try {
        console.log("Fetching admin profile...");
        const token = localStorage.getItem("token");
        if (!token) {
          setShowErrorToast(t("session_expired"));
          setTimeout(() => isMounted.current && navigate("/login"), 3000);
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile fetched:", response.data);
        if (isMounted.current) {
          setProfile(response.data);
          setSettings(response.data.settings || settings);
          updateUser(response.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        if (isMounted.current) {
          if (error.response?.status === 401) {
            setShowErrorToast(t("session_expired"));
            setTimeout(() => isMounted.current && navigate("/login"), 3000);
          } else {
            setFetchError(t("fetch_profile_failed"));
          }
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      isMounted.current = false;
    };
  }, [navigate, t]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  // Validate profile form
  const validateProfile = () => {
    const newErrors: Partial<AdminProfile> = {};
    if (!profile.name.trim()) newErrors.name = t("name_required");
    else if (profile.name.length < 2) newErrors.name = t("name_min_length");
    if (!profile.email.trim()) newErrors.email = t("email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) newErrors.email = t("email_invalid");
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password change
  const validatePassword = () => {
    const newErrors: Partial<PasswordChange> = {};
    if (!passwordChange.currentPassword) newErrors.currentPassword = t("current_password_required");
    if (!passwordChange.newPassword) newErrors.newPassword = t("new_password_required");
    else if (passwordChange.newPassword.length < 6) newErrors.newPassword = t("new_password_min_length");
    if (passwordChange.newPassword !== passwordChange.confirmPassword)
      newErrors.confirmPassword = t("passwords_not_match");
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate settings
  const validateSettings = () => {
    const newErrors: Partial<Settings> = {};
    if (!settings.language) newErrors.language = t("language_required");
    if (!settings.timeZone) newErrors.timeZone = t("time_zone_required");
    setSettingsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name as keyof AdminProfile]) {
      setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle settings changes
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (settingsErrors[name as keyof Settings]) {
      setSettingsErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordChange((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name as keyof PasswordChange]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setShowErrorToast(t("image_format_invalid"));
      setTimeout(() => setShowErrorToast(null), 3000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setShowErrorToast(t("image_size_exceeded"));
      setTimeout(() => setShowErrorToast(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);
    setLoading(true);
    try {
      console.log("Uploading profile image...");
      const token = localStorage.getItem("token");
      if (!token) {
        setShowErrorToast(t("session_expired"));
        setTimeout(() => navigate("/login"), 3000);
        return;
      }
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload-profile-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedProfile = { ...profile, profileImage: response.data.imageUrl };
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setShowSuccessToast(t("profile_image_updated"));
      setTimeout(() => setShowSuccessToast(null), 3000);
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      const errorMessage = error.response?.data?.message || t("image_upload_failed");
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 3000);
      if (error.response?.status === 401) {
        setTimeout(() => navigate("/login"), 3000);
      }
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateProfile()) {
      setLoading(true);
      try {
        console.log("Updating profile:", profile);
        const token = localStorage.getItem("token");
        if (!token) {
          setShowErrorToast(t("session_expired"));
          setTimeout(() => navigate("/login"), 3000);
          return;
        }
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/update-admin-profile`, profile, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        updateUser(response.data);
        setShowSuccessToast(t("profile_updated"));
        setTimeout(() => setShowSuccessToast(null), 3000);
      } catch (error: any) {
        console.error("Error updating profile:", error);
        const errorMessage = error.response?.data?.message || t("profile_update_failed");
        setShowErrorToast(errorMessage);
        setTimeout(() => setShowErrorToast(null), 3000);
        if (error.response?.status === 401) {
          setTimeout(() => navigate("/login"), 3000);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword()) {
      setLoading(true);
      try {
        console.log("Changing password...");
        const token = localStorage.getItem("token");
        if (!token) {
          setShowErrorToast(t("session_expired"));
          setTimeout(() => navigate("/login"), 3000);
          return;
        }
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/change-password`,
          {
            currentPassword: passwordChange.currentPassword,
            newPassword: passwordChange.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShowSuccessToast(t("password_changed"));
        setPasswordChange({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setShowSuccessToast(null), 3000);
      } catch (error: any) {
        console.error("Error changing password:", error);
        const errorMessage = error.response?.data?.message || t("password_change_failed");
        setShowErrorToast(errorMessage);
        setTimeout(() => setShowErrorToast(null), 3000);
        if (error.response?.status === 401) {
          setTimeout(() => navigate("/login"), 3000);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle settings submission
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSettings()) {
      setLoading(true);
      try {
        console.log("Updating settings:", settings);
        const token = localStorage.getItem("token");
        if (!token) {
          setShowErrorToast(t("session_expired"));
          setTimeout(() => navigate("/login"), 3000);
          return;
        }
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/update-admin-profile`,
          { settings },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Settings updated from backend:", response.data.settings);
        setSettings(response.data.settings);
        updateUser({ ...user!, settings: response.data.settings });
        // Apply language immediately
        const langCode = response.data.settings.language === "Amharic" ? "am" : "en";
        import('i18next').then((i18n) => {
          i18n.default.changeLanguage(langCode);
          console.log("Language changed to:", langCode);
        });
        // Apply theme immediately
        document.documentElement.classList.toggle("dark", response.data.settings.theme === "dark");
        setShowSuccessToast(t("settings_updated"));
        setTimeout(() => setShowSuccessToast(null), 3000);
      } catch (error: any) {
        console.error("Error updating settings:", error);
        const errorMessage = error.response?.data?.message || t("settings_update_failed");
        setShowErrorToast(errorMessage);
        setTimeout(() => setShowErrorToast(null), 3000);
        if (error.response?.status === 401) {
          setTimeout(() => navigate("/login"), 3000);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle retry for fetching profile
  const handleRetry = () => {
    setFetchError(null);
    const fetchProfile = async () => {
      if (!isMounted.current) return;
      setLoading(true);
      try {
        console.log("Retrying fetch admin profile...");
        const token = localStorage.getItem("token");
        if (!token) {
          setShowErrorToast(t("session_expired"));
          setTimeout(() => isMounted.current && navigate("/login"), 3000);
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile fetched:", response.data);
        if (isMounted.current) {
          setProfile(response.data);
          setSettings(response.data.settings || settings);
          updateUser(response.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        if (isMounted.current) {
          if (error.response?.status === 401) {
            setShowErrorToast(t("session_expired"));
            setTimeout(() => isMounted.current && navigate("/login"), 3000);
          } else {
            setFetchError(t("fetch_profile_failed"));
          }
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-800">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaUser className="mr-2" />
          {showSuccessToast}
        </div>
      )}
      {showErrorToast && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {showErrorToast}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={() => setShowErrorToast(null)}
          >
            <FaSync />
          </button>
        </div>
      )}
      {fetchError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {fetchError}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 dark:bg-gray-700">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold ${
              activeTab === "profile" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            {t("profile")}
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold ${
              activeTab === "settings" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            {t("settings")}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "profile" ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center dark:text-blue-400">
                <FaUser className="mr-2" /> {t("admin_profile")}
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaUser className="mr-2 text-blue-600" /> {t("name")}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        profileErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder={t("enter_name")}
                      required
                    />
                    {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaUser className="mr-2 text-blue-600" /> {t("email")}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        profileErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder={t("enter_email")}
                      required
                    />
                    {profileErrors.email && <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> {t("role")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 mt-1 border-2 border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white cursor-not-allowed"
                    value={profile.role}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUpload className="mr-2 text-blue-600" /> {t("profile_image")}
                  </label>
                  <div className="flex items-center space-x-4">
                    {profile.profileImage ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${profile.profileImage}?t=${Date.now()}`}
                        alt={t("profile")}
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-600"
                        onError={() => console.error(`Failed to load image: ${profile.profileImage}`)}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {t("no_image")}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/jpeg,image/png"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                      disabled={loading}
                    >
                      {t("upload_image")}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? t("saving") : t("save_profile")}
                  </button>
                </div>
              </form>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center dark:text-blue-400">
                <FaLock className="mr-2" /> {t("change_password")}
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaLock className="mr-2 text-blue-600" /> {t("current_password")}
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                      passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    value={passwordChange.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder={t("enter_current_password")}
                    required
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaLock className="mr-2 text-blue-600" /> {t("new_password")}
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      value={passwordChange.newPassword}
                      onChange={handlePasswordChange}
                      placeholder={t("enter_new_password")}
                      required
                    />
                    {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaLock className="mr-2 text-blue-600" /> {t("confirm_password")}
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      value={passwordChange.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder={t("confirm_new_password")}
                      required
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? t("changing") : t("change_password")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center dark:text-blue-400">
              <FaCog className="mr-2" /> {t("settings")}
            </h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaGlobe className="mr-2 text-blue-600" /> {t("language")}
                  </label>
                  <select
                    id="language"
                    name="language"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                      settingsErrors.language ? "border-red-500" : "border-gray-300"
                    }`}
                    value={settings.language}
                    onChange={handleSettingsChange}
                    required
                  >
                    <option value="">{t("select_language")}</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  {settingsErrors.language && <p className="text-red-500 text-sm mt-1">{settingsErrors.language}</p>}
                </div>
                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaClock className="mr-2 text-blue-600" /> {t("time_zone")}
                  </label>
                  <select
                    id="timeZone"
                    name="timeZone"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                      settingsErrors.timeZone ? "border-red-500" : "border-gray-300"
                    }`}
                    value={settings.timeZone}
                    onChange={handleSettingsChange}
                    required
                  >
                    <option value="">{t("select_time_zone")}</option>
                    {timeZones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  {settingsErrors.timeZone && <p className="text-red-500 text-sm mt-1">{settingsErrors.timeZone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaSun className="mr-2 text-blue-600" /> {t("theme")}
                </label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={settings.theme === "light"}
                      onChange={handleSettingsChange}
                      className="mr-2"
                    />
                    {t("light")}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={settings.theme === "dark"}
                      onChange={handleSettingsChange}
                      className="mr-2"
                    />
                    {t("dark")}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaBell className="mr-2 text-blue-600" /> {t("notifications")}
                </label>
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleSettingsChange}
                    className="mr-2"
                  />
                  {t("enable_notifications")}
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? t("saving") : t("save_settings")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


/*
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaUser, FaCog, FaGlobe, FaSun, FaMoon, FaBell, FaClock, FaUpload, FaLock, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface Settings {
  language: string;
  theme: "light" | "dark";
  notifications: boolean;
  timeZone: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const languages = ["English", "Amharic"];
const timeZones = ["Africa/Addis_Ababa", "UTC", "America/New_York", "Europe/London"];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
    role: "Admin",
    profileImage: "",
  });
  const [settings, setSettings] = useState<Settings>({
    language: "English",
    theme: "light",
    notifications: true,
    timeZone: "Africa/Addis_Ababa",
  });
  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState<Partial<AdminProfile>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChange>>({});
  const [settingsErrors, setSettingsErrors] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch admin profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        console.log("Fetching admin profile...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin-profile`);
        console.log("Profile fetched:", response.data);
        setProfile(response.data);
        setSettings(response.data.settings || settings);
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        setFetchError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  // Validate profile form
  const validateProfile = () => {
    const newErrors: Partial<AdminProfile> = {};
    if (!profile.name.trim()) newErrors.name = "Name is required";
    else if (profile.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!profile.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) newErrors.email = "Invalid email format";
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password change
  const validatePassword = () => {
    const newErrors: Partial<PasswordChange> = {};
    if (!passwordChange.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwordChange.newPassword) newErrors.newPassword = "New password is required";
    else if (passwordChange.newPassword.length < 6) newErrors.newPassword = "New password must be at least 6 characters";
    if (passwordChange.newPassword !== passwordChange.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate settings
  const validateSettings = () => {
    const newErrors: Partial<Settings> = {};
    if (!settings.language) newErrors.language = "Language is required";
    if (!settings.timeZone) newErrors.timeZone = "Time zone is required";
    setSettingsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name as keyof AdminProfile]) {
      setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle settings changes
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (settingsErrors[name as keyof Settings]) {
      setSettingsErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordChange((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name as keyof PasswordChange]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setShowErrorToast("Only JPEG or PNG images are allowed.");
      setTimeout(() => setShowErrorToast(null), 3000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setShowErrorToast("Image size must be less than 2MB.");
      setTimeout(() => setShowErrorToast(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);
    setLoading(true);
    try {
      console.log("Uploading profile image...");
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload-profile-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, profileImage: response.data.imageUrl }));
      setShowSuccessToast("Profile image updated successfully!");
      setTimeout(() => setShowSuccessToast(null), 3000);
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      setShowErrorToast(error.response?.data?.message || "Failed to upload image. Please try again.");
      setTimeout(() => setShowErrorToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateProfile()) {
      setLoading(true);
      try {
        console.log("Updating profile:", profile);
        await axios.post(`${import.meta.env.VITE_API_URL}/api/update-admin-profile`, profile);
        setShowSuccessToast("Profile updated successfully!");
        setTimeout(() => setShowSuccessToast(null), 3000);
      } catch (error: any) {
        console.error("Error updating profile:", error);
        setShowErrorToast(error.response?.data?.message || "Failed to update profile. Please try again.");
        setTimeout(() => setShowErrorToast(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword()) {
      setLoading(true);
      try {
        console.log("Changing password...");
        await axios.post(`${import.meta.env.VITE_API_URL}/api/change-password`, {
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
        });
        setShowSuccessToast("Password changed successfully!");
        setPasswordChange({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setShowSuccessToast(null), 3000);
      } catch (error: any) {
        console.error("Error changing password:", error);
        setShowErrorToast(error.response?.data?.message || "Failed to change password. Please try again.");
        setTimeout(() => setShowErrorToast(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle settings submission
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSettings()) {
      setLoading(true);
      try {
        console.log("Updating settings:", settings);
        await axios.post(`${import.meta.env.VITE_API_URL}/api/update-admin-profile`, { settings });
        setShowSuccessToast("Settings updated successfully!");
        setTimeout(() => setShowSuccessToast(null), 3000);
      } catch (error: any) {
        console.error("Error updating settings:", error);
        setShowErrorToast(error.response?.data?.message || "Failed to update settings. Please try again.");
        setTimeout(() => setShowErrorToast(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle retry for fetching profile
  const handleRetry = () => {
    setFetchError(null);
    const fetchProfile = async () => {
      setLoading(true);
      try {
        console.log("Retrying fetch admin profile...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin-profile`);
        console.log("Profile fetched:", response.data);
        setProfile(response.data);
        setSettings(response.data.settings || settings);
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        setFetchError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-800">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaUser className="mr-2" />
          {showSuccessToast}
        </div>
      )}
      {showErrorToast && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {showErrorToast}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      {fetchError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {fetchError}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 dark:bg-gray-700">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold ${
              activeTab === "profile" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold ${
              activeTab === "settings" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "profile" ? (
          <div className="space-y-8">
           // {/* Profile Section }
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center dark:text-blue-400">
                <FaUser className="mr-2" /> Admin Profile
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaUser className="mr-2 text-blue-600" /> Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        profileErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your name"
                      required
                    />
                    {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaUser className="mr-2 text-blue-600" /> Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        profileErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email"
                      required
                    />
                    {profileErrors.email && <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Role
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 mt-1 border-2 border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white cursor-not-allowed"
                    value={profile.role}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUpload className="mr-2 text-blue-600" /> Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-600"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/jpeg,image/png"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                      disabled={loading}
                    >
                      Upload Image
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
           // {/* Password Change Section }
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center dark:text-blue-400">
                <FaLock className="mr-2" /> Change Password
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaLock className="mr-2 text-blue-600" /> Current Password
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                      passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    value={passwordChange.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaLock className="mr-2 text-blue-600" /> New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      value={passwordChange.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                    />
                    {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      <FaLock className="mr-2 text-blue-600" /> Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                        passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      value={passwordChange.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center dark:text-blue-400">
              <FaCog className="mr-2" /> Settings
            </h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaGlobe className="mr-2 text-blue-600" /> Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                      settingsErrors.language ? "border-red-500" : "border-gray-300"
                    }`}
                    value={settings.language}
                    onChange={handleSettingsChange}
                    required
                  >
                    <option value="">Select language</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  {settingsErrors.language && <p className="text-red-500 text-sm mt-1">{settingsErrors.language}</p>}
                </div>
                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaClock className="mr-2 text-blue-600" /> Time Zone
                  </label>
                  <select
                    id="timeZone"
                    name="timeZone"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white ${
                      settingsErrors.timeZone ? "border-red-500" : "border-gray-300"
                    }`}
                    value={settings.timeZone}
                    onChange={handleSettingsChange}
                    required
                  >
                    <option value="">Select time zone</option>
                    {timeZones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  {settingsErrors.timeZone && <p className="text-red-500 text-sm mt-1">{settingsErrors.timeZone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaSun className="mr-2 text-blue-600" /> Theme
                </label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={settings.theme === "light"}
                      onChange={handleSettingsChange}
                      className="mr-2"
                    />
                    Light
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={settings.theme === "dark"}
                      onChange={handleSettingsChange}
                      className="mr-2"
                    />
                    Dark
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaBell className="mr-2 text-blue-600" /> Notifications
                </label>
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleSettingsChange}
                    className="mr-2"
                  />
                  Enable Notifications
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
*/