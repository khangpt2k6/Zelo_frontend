import { User } from "@/context/AppContext";
import {
  CornerDownRight,
  CornerUpLeft,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  UserCircle,
  X,
  Settings,
  Users,
  Sparkles,
  Globe,
  Bell,
  Heart,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showAllUsers: boolean;
  setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
  createChat: (user: User) => void;
  onlineUsers: string[];
}

const ChatSidebar = ({
  sidebarOpen,
  setShowAllUsers,
  setSidebarOpen,
  showAllUsers,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogout,
  createChat,
  onlineUsers,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside
      className={`fixed z-30 sm:static top-0 left-0 h-screen w-80 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 transition-all duration-500 ease-out flex flex-col relative overflow-hidden`}
      style={{backgroundColor: '#FFF1F2'}}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-10 animate-pulse" 
             style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)', animationDuration: '4s'}}></div>
        <div className="absolute top-1/2 -right-20 w-32 h-32 rounded-full opacity-10 animate-pulse" 
             style={{background: 'linear-gradient(45deg, #F472B6, #A78BFA)', animationDuration: '6s', animationDelay: '2s'}}></div>
        <div className="absolute -bottom-16 left-1/4 w-24 h-24 rounded-full opacity-10 animate-pulse" 
             style={{background: 'linear-gradient(90deg, #A78BFA, #F472B6)', animationDuration: '8s', animationDelay: '4s'}}></div>
      </div>

      {/* Floating close button for mobile */}
      <div className="sm:hidden absolute top-4 right-4 z-10">
        <button
          onClick={() => setSidebarOpen(false)}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border border-white/50 hover:scale-110 transition-transform duration-300"
        >
          <X className="w-5 h-5" style={{color: '#374151'}} />
        </button>
      </div>

      {/* Compact Header Design */}
      <div className="relative z-10 p-4 pt-6">
        {/* Floating mode toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-full p-1.5 shadow-xl border border-white/50">
            <div className="flex relative">
              <button
                onClick={() => setShowAllUsers(false)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  !showAllUsers
                    ? "text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor: !showAllUsers ? '#A78BFA' : 'transparent'
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chats</span>
              </button>
              <button
                onClick={() => setShowAllUsers(true)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  showAllUsers
                    ? "text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor: showAllUsers ? '#F472B6' : 'transparent'
                }}
              >
                <Users className="w-4 h-4" />
                <span>People</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact User Profile Card */}
        {loggedInUser && (
          <div className="relative mb-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-3 shadow-lg border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 opacity-20 transform rotate-12">
                <Sparkles className="w-full h-full" style={{color: '#A78BFA'}} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden" 
                         style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}>
                      <span className="text-white font-bold text-lg">
                        {loggedInUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" style={{color: '#374151'}}>{loggedInUser.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span className="text-xs text-gray-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          margin: 8px 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #A78BFA, #F472B6);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 4px rgba(167, 139, 250, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          box-shadow: 0 4px 8px rgba(167, 139, 250, 0.4);
          transform: scale(1.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #7C3AED, #DB2777);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #A78BFA rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Content Area - Expanded */}
      <div className="flex-1 overflow-hidden px-4 relative z-10">
        {showAllUsers ? (
          <div className="h-full space-y-3">
            {/* Futuristic Search */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl" style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)', padding: '1px'}}>
                <div className="w-full h-full bg-white rounded-xl"></div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{color: '#A78BFA'}} />
                <input
                  type="text"
                  placeholder="Discover amazing people..."
                  className="w-full pl-10 pr-10 py-3 bg-transparent rounded-xl font-medium placeholder-gray-500 focus:outline-none text-sm"
                  style={{color: '#374151'}}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{backgroundColor: '#F472B6'}}>
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Users Grid - Optimized Layout */}
            <div className="overflow-y-auto overflow-x-hidden h-full pb-4 space-y-2 custom-scrollbar">
              {users
                ?.filter(
                  (u) =>
                    u._id !== loggedInUser?._id &&
                    u.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((u, index) => (
                  <button
                    key={u._id}
                    className="w-full text-left group relative overflow-hidden"
                    onClick={() => createChat(u)}
                  >
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 hover:bg-white/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden"
                               style={{background: `linear-gradient(${135 + index * 30}deg, #A78BFA, #F472B6)`}}>
                            <span className="text-white font-semibold">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {onlineUsers.includes(u._id) && (
                            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-sm"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate text-sm" style={{color: '#374151'}}>{u.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(u._id) ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                            <span className="text-xs text-gray-600">
                              {onlineUsers.includes(u._id) ? "Available" : "Away"}
                            </span>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{backgroundColor: '#F472B6'}}>
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="h-full overflow-y-auto overflow-x-hidden pb-4 space-y-2 custom-scrollbar">
            {chats.map((chat, index) => {
              const latestMessage = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isSentByMe = latestMessage?.sender === loggedInUser?._id;
              const unseenCount = chat.chat.unseenCount || 0;

              return (
                <button
                  key={chat.chat._id}
                  onClick={() => {
                    setSelectedUser(chat.chat._id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left group relative overflow-hidden transition-all duration-300 ${
                    isSelected ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                  }`}
                >
                  <div className={`rounded-xl p-3 border transition-all duration-300 relative ${
                    isSelected
                      ? "bg-white shadow-lg border-2"
                      : "bg-white/60 backdrop-blur-sm border-white/50 hover:bg-white/80 hover:shadow-md"
                  }`}
                  style={{
                    borderColor: isSelected ? '#A78BFA' : undefined,
                    background: isSelected ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(244, 114, 182, 0.1))' : undefined
                  }}>
                    {isSelected && (
                      <div className="absolute inset-0 rounded-xl opacity-20" 
                           style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}></div>
                    )}
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden ${
                          isSelected ? 'ring-2 ring-purple-200' : ''
                        }`}
                             style={{background: `linear-gradient(${135 + index * 25}deg, #A78BFA, #F472B6)`}}>
                          <span className="text-white font-semibold">
                            {chat.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {onlineUsers.includes(chat.user._id) && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-sm">
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold truncate text-sm" style={{color: '#374151'}}>{chat.user.name}</h4>
                          {unseenCount > 0 && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
                                 style={{background: 'linear-gradient(135deg, #F472B6, #A78BFA)'}}>
                              {unseenCount > 9 ? "9+" : unseenCount}
                            </div>
                          )}
                        </div>

                        {latestMessage && (
                          <div className="flex items-center gap-2">
                            {isSentByMe ? (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#A78BFA'}}>
                                <CornerUpLeft size={10} className="text-white" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#F472B6'}}>
                                <CornerDownRight size={10} className="text-white" />
                              </div>
                            )}
                            <span className="text-xs text-gray-600 truncate flex-1 font-medium">
                              {latestMessage.text || "📷 Photo"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center relative">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden"
                   style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}>
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Heart className="w-6 h-6" style={{color: '#F472B6'}} />
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-2" style={{color: '#374151'}}>Ready to Connect?</h3>
            <p className="text-gray-600 mb-5 max-w-44 text-sm">
              Your conversations will appear here. Start chatting with amazing people!
            </p>
            
            <button
              onClick={() => setShowAllUsers(true)}
              className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}
            >
              <Sparkles className="w-4 h-4" />
              <span>Discover People</span>
            </button>
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="relative z-10 p-3 space-y-2">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-0.5 shadow-md border border-white/50">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
                 style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}>
              <UserCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-sm" style={{color: '#374151'}}>Profile Settings</span>
            </div>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white/80 backdrop-blur-lg rounded-xl p-0.5 shadow-md border border-white/50 hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300"
                 style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}>
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium text-sm" style={{color: '#A78BFA'}}>Sign Out</span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default ChatSidebar;