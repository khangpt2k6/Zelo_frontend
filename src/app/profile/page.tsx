"use client";
import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { ArrowLeft, Save, User, UserCircle, Edit3, Check, X, Settings, Crown, Camera, Upload, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { user, isAuth, loading, setUser } = useAppData();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState<string | undefined>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const router = useRouter();

  const editHandler = () => {
    setIsEdit(!isEdit);
    setName(user?.name);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    const token = Cookies.get("token");
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    setIsUploadingAvatar(true);
    try {
      const { data } = await axios.post(
        `${user_service}/api/v1/update/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      toast.success(data.message);
      setUser(data.user);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const submitHandler = async (e: any) => {
    e.preventDefault();
    const token = Cookies.get("token");
    try {
      const { data } = await axios.post(
        `${user_service}/api/v1/update/user`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      toast.success(data.message);
      setUser(data.user);
      setIsEdit(false);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  if (loading) return <Loading />;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50" style={{backgroundColor: '#FFF1F2'}}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-10" style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}></div>
        <div className="absolute top-1/2 -left-32 w-48 h-48 rounded-full opacity-10" style={{background: 'linear-gradient(45deg, #F472B6, #A78BFA)'}}></div>
        <div className="absolute -bottom-20 right-1/4 w-40 h-40 rounded-full opacity-10" style={{background: 'linear-gradient(90deg, #A78BFA, #F472B6)'}}></div>
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8 pt-8">
            <button
              onClick={() => router.push("/chat")}
              className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <ArrowLeft className="w-5 h-5" style={{color: '#374151'}} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8" style={{color: '#A78BFA'}} />
                <h1 className="text-4xl font-bold" style={{color: '#374151'}}>Profile Settings</h1>
              </div>
              <p className="text-gray-600">Customize your account and preferences</p>
            </div>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50" style={{backgroundColor: '#EDE9FE'}}>
            {/* Profile Header */}
            <div className="relative p-8 pb-6" style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl overflow-hidden">
                        {user?.avatar || avatarPreview ? (
                          <img
                            src={avatarPreview || user?.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-16 h-16 text-white" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Avatar Upload Button */}
                      <label className="absolute inset-0 cursor-pointer group" title="Upload profile picture">
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          aria-label="Upload profile picture"
                        />
                      </label>
                    </div>
                    <div className="text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold">
                          {user?.name || "User"}
                        </h2>
                        <Crown className="w-6 h-6 text-yellow-300" />
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Active now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative wave */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8">
                  <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#EDE9FE"></path>
                  <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#EDE9FE"></path>
                  <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#EDE9FE"></path>
                </svg>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Section */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Avatar Upload Section */}
                  {avatarFile && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#A78BFA'}}>
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold" style={{color: '#374151'}}>Upload Avatar</h3>
                          <p className="text-sm text-gray-500">Preview and upload your new profile picture</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 shadow-lg"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={uploadAvatar}
                            disabled={isUploadingAvatar}
                            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}
                          >
                            {isUploadingAvatar ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                          </button>
                          <button
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview("");
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 font-semibold rounded-xl transition-all duration-300"
                            style={{color: '#374151'}}
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#A78BFA'}}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold" style={{color: '#374151'}}>Display Name</h3>
                        <p className="text-sm text-gray-500">How others see you in conversations</p>
                      </div>
                    </div>

                    {isEdit ? (
                      <form onSubmit={submitHandler} className="space-y-4">
                        <div className="relative">
                          <label htmlFor="display-name" className="sr-only">Display Name</label>
                          <input
                            id="display-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                            style={{color: '#374151'}}
                            placeholder="Enter your display name"
                            aria-label="Enter your display name"
                          />
                          <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}
                          >
                            <Check className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={editHandler}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 font-semibold rounded-xl transition-all duration-300"
                            style={{color: '#374151'}}
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300">
                        <span className="font-semibold text-xl" style={{color: '#374151'}}>
                          {user?.name || "Not set"}
                        </span>
                        <button
                          onClick={editHandler}
                          className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{backgroundColor: '#F472B6'}}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats/Info Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold mb-4" style={{color: '#374151'}}>Account Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium" style={{color: '#374151'}}>Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Account Type</span>
                        <span className="text-sm font-medium px-2 py-1 rounded-lg" style={{backgroundColor: '#A78BFA', color: 'white'}}>Premium</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Member Since</span>
                        <span className="text-sm font-medium" style={{color: '#374151'}}>2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Upload Instructions */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold mb-4" style={{color: '#374151'}}>Profile Picture</h3>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Click on your profile picture above to upload a new avatar. 
                        Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Camera className="w-4 h-4" />
                        <span>Hover over your avatar to upload</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;