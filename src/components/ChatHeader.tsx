import { User } from "@/context/AppContext";
import { Menu, UserCircle, Phone, Video, MoreHorizontal, Users, X } from "lucide-react";
import React, { useState } from "react";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
  // Group chat properties
  isGroupChat?: boolean;
  groupMembers?: string[];
  memberCount?: number;
  groupName?: string;
  // Add users array to get member details
  allUsers?: User[];
}

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
  isGroupChat = false,
  groupMembers = [],
  memberCount = 0,
  groupName,
  allUsers = [],
}: ChatHeaderProps) => {
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const isOnlineUser = user && !isGroupChat && onlineUsers.includes(user._id);
  
  // Debug logging
  console.log('ChatHeader props:', {
    isGroupChat,
    groupMembers: groupMembers.length,
    memberCount,
    groupName,
    allUsers: allUsers.length,
    user: user?.name
  });
  
  const handleMoreClick = () => {
    console.log('More button clicked!');
    console.log('isGroupChat:', isGroupChat);
    console.log('groupMembers:', groupMembers);
    console.log('memberCount:', memberCount);
    
    if (isGroupChat) {
      console.log('Setting dropdown to:', !showMembersDropdown);
      setShowMembersDropdown(!showMembersDropdown);
    } else {
      console.log('Not a group chat, no dropdown action');
    }
    // For individual chats, you can add other actions here
  };

  // Get actual user details for group members
  const getMemberDetails = (memberId: string) => {
    return allUsers.find(u => u._id === memberId) || null;
  };

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
      <div className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-pink-100/50 p-6 shadow-sm relative">
        <div className="flex items-center justify-between">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {isGroupChat ? (
                    /* Group Chat Avatar - Show overlapped member avatars */
                    <div className="w-14 h-14 relative">
                      {/* Get first two members for overlapped display */}
                      {(() => {
                        const memberIds = groupMembers || [];
                        const firstMember = allUsers?.find(u => u._id === memberIds[0]);
                        const secondMember = allUsers?.find(u => u._id === memberIds[1]);
                        
                        return (
                          <>
                            {/* First member avatar (bottom layer) */}
                            <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center ring-2 ring-purple-200/50 overflow-hidden">
                              {firstMember?.avatar ? (
                                <img
                                  src={firstMember.avatar}
                                  alt={firstMember.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {firstMember?.name?.charAt(0).toUpperCase() || 'G'}
                                </span>
                              )}
                            </div>
                            {/* Second member avatar (top layer, overlapping) */}
                            <div className="absolute top-0 right-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center ring-2 ring-purple-200/50 overflow-hidden border-2 border-white">
                              {secondMember?.avatar ? (
                                <img
                                  src={secondMember.avatar}
                                  alt={secondMember.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {secondMember?.name?.charAt(0).toUpperCase() || (memberCount > 2 ? '+' : 'G')}
                                </span>
                              )}
                            </div>
                            {/* Member count badge */}
                            {memberCount > 2 && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-white text-xs font-bold">{memberCount}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Individual Chat Avatar - Show single user avatar */
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center ring-2 ring-purple-200/50 overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-8 h-8 text-purple-400" />
                      )}
                    </div>
                  )}
                  
                  {/* Online status - only for individual chats */}
                  {!isGroupChat && isOnlineUser && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 border-3 border-white shadow-sm">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60"></div>
                    </div>
                  )}
                </div>

                {/* User/Group info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-800 truncate">
                      {isGroupChat ? groupName || user.name : user.name}
                    </h2>
                    {isGroupChat && (
                      <span className="text-sm text-purple-600 font-medium bg-purple-100 px-3 py-1 rounded-full">
                        Group
                      </span>
                    )}
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
                        {isGroupChat ? (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-purple-600 font-medium">
                              {memberCount} member{memberCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
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
                <button 
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100 relative"
                  onClick={handleMoreClick}
                >
                  <MoreHorizontal className="w-5 h-5 text-purple-600" />
                  {isGroupChat && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500"></div>
                  )}
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

        {/* Group Members Dropdown */}
        {isGroupChat && showMembersDropdown && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-purple-200 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Group Members</h3>
                <button
                  onClick={() => setShowMembersDropdown(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {groupMembers.map((memberId) => {
                  const memberUser = getMemberDetails(memberId);
                  return (
                    <div key={memberId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                        {memberUser?.avatar ? (
                          <img
                            src={memberUser.avatar}
                            alt={memberUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-purple-600">
                            {memberUser?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {memberUser?.name || 'Unknown User'}
                        </p>
                      </div>
                      {onlineUsers.includes(memberId) && (
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {memberCount} total member{memberCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatHeader;