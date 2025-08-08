import { User } from "@/context/AppContext";
import { Menu, UserCircle, Phone, Video, MoreHorizontal } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) => {
  const isOnlineUser = user && onlineUsers.includes(user._id);
  
  return (
    <>
      {/* Mobile menu toggle */}
      <div className="sm:hidden fixed top-4 right-4 z-30">
        <button
          className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white shadow-lg transition-all duration-200 border border-pink-100"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Chat header */}
      <div className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-pink-100/50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center ring-2 ring-purple-200/50">
                    <UserCircle className="w-8 h-8 text-purple-400" />
                  </div>
                  {/* Online status */}
                  {isOnlineUser && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 border-3 border-white shadow-sm">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60"></div>
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-800 truncate">
                      {user.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTyping ? (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-purple-600 font-medium">
                          typing...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isOnlineUser ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${
                            isOnlineUser ? "text-emerald-600" : "text-gray-500"
                          }`}
                        >
                          {isOnlineUser ? "Online" : "Offline"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100">
                  <Phone className="w-5 h-5 text-purple-600" />
                </button>
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100">
                  <Video className="w-5 h-5 text-purple-600" />
                </button>
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100">
                  <MoreHorizontal className="w-5 h-5 text-purple-600" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 mx-auto">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-purple-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-600 mb-1">
                  Zelo - Connect worldwide
                </h2>
                <p className="text-sm text-gray-500">
                  Choose a user from the sidebar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHeader;