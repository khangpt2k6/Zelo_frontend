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
  Check,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import Cookies from "js-cookie";

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
  // Filter logic: Show all users in "People" view, but visually indicate which ones already have chats
  // This provides transparency while preventing confusion about duplicate entries
  // Note: The chats array might contain duplicate user entries due to backend data structure
  // We filter out duplicates in the "Chats" view to ensure each user appears only once
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showGroupCreation, setShowGroupCreation] = useState(false);
  const [groupCreationStep, setGroupCreationStep] = useState<'form' | 'members'>('form');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Debug: Log chats to see if there are duplicates
  React.useEffect(() => {
    if (chats && chats.length > 0) {
      const userIds = chats.map(chat => chat.user._id);
      const uniqueIds = new Set(userIds);
      if (userIds.length !== uniqueIds.size) {
        console.log('Duplicate users detected in chats:', {
          total: userIds.length,
          unique: uniqueIds.size,
          duplicates: userIds.filter((id, index) => userIds.indexOf(id) !== index)
        });
      }
    }
  }, [chats]);

  const handleNextStep = () => {
    if (groupName.trim()) {
      setGroupCreationStep('members');
    }
  };

  const handleBackToForm = () => {
    setGroupCreationStep('form');
  };

  const resetGroupCreation = () => {
    setGroupCreationStep('form');
    setGroupName('');
    setGroupDescription('');
    setSelectedUsers([]);
    setShowGroupCreation(false);
    setIsCreatingGroup(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) return;
    
    setIsCreatingGroup(true);
    
    try {
      // Get token from cookies
      const token = Cookies.get("token");

      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      // Create group chat
      const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}/api/v1/chat/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupName: groupName.trim(),
          groupDescription: groupDescription.trim(),
          userIds: selectedUsers,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Group created:', result);
        
        // Show success message
        alert('Group created successfully!');
        
        // Reset form and go back to chats view
        resetGroupCreation();
        setShowAllUsers(false);
        
        // TODO: Refresh chats list or add new group to the list
      } else if (response.status === 401) {
        // Handle authentication error
        console.error('Authentication failed - token may be expired');
        alert('Authentication failed. Please login again.');
        // You might want to call handleLogout() here if available
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create group:', errorData);
        alert(`Failed to create group: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group. Please try again.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

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
        {/* Three Tab Navigation */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-full p-1.5 shadow-xl border border-white/50">
            <div className="flex relative">
              <button
                onClick={() => setShowAllUsers(false)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
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
                onClick={() => {
                  setShowAllUsers(true);
                  setShowGroupCreation(false);
                }}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  showAllUsers && !showGroupCreation
                    ? "text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor: showAllUsers && !showGroupCreation ? '#F472B6' : 'transparent'
                }}
              >
                <UserCircle className="w-4 h-4" />
                <span>People</span>
              </button>
              <button
                onClick={() => {
                  setShowAllUsers(true);
                  setShowGroupCreation(true);
                }}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  showAllUsers && showGroupCreation
                    ? "text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor: showAllUsers && showGroupCreation ? '#F472B6' : 'transparent'
                }}
              >
                <Users className="w-4 h-4" />
                <span>Group</span>
                {chats && chats.filter(chat => chat.user.isGroup || chat.chat.chatType === 'group').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full font-medium">
                    {chats.filter(chat => chat.user.isGroup || chat.chat.chatType === 'group').length}
                  </span>
                )}
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
                      {loggedInUser.avatar ? (
                        <img
                          src={loggedInUser.avatar}
                          alt={loggedInUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {loggedInUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" style={{color: '#374151'}}>{loggedInUser.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span className="text-xs text-gray-600">Active</span>
                    </div>
                  </div>
                  
                  {/* Profile Settings Button */}
                  <Link
                    href="/profile"
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300"
                    style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}
                  >
                    <UserCircle className="w-4 h-4 text-white" />
                  </Link>
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

            {showGroupCreation ? (
              <>
                {groupCreationStep === 'form' ? (
                  /* Step 1: Group Details Form */
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg" style={{color: '#374151'}}>Create New Group</h3>
                      <button
                        onClick={resetGroupCreation}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    
                    {/* Group Name Input */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                      <input
                        type="text"
                        placeholder="Enter group name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>

                    {/* Group Description Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                      <textarea
                        placeholder="Enter group description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={2}
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                      />
                    </div>

                    {/* Next Button */}
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                        groupName.trim()
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={handleNextStep}
                      disabled={!groupName.trim()}
                    >
                      <Users className="w-4 h-4 inline mr-2" />
                      Next: Add Members
                    </button>
                  </div>
                ) : (
                  /* Step 2: Member Selection */
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg" style={{color: '#374151'}}>Select Group Members</h3>
                      <button
                        onClick={resetGroupCreation}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Group Info Display */}
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-1">{groupName}</h4>
                      {groupDescription && (
                        <p className="text-sm text-purple-600">{groupDescription}</p>
                      )}
                    </div>

                    {/* Selected Members Count */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Selected Members</span>
                        <span className="text-sm text-purple-600 font-medium">{selectedUsers.length}</span>
                      </div>
                    </div>

                    {/* Create Group Button */}
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg mb-4 ${
                        selectedUsers.length >= 1 && !isCreatingGroup
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={handleCreateGroup}
                      disabled={selectedUsers.length < 1 || isCreatingGroup}
                    >
                      {isCreatingGroup ? (
                        <>
                          <div className="w-4 h-4 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating Group...
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 inline mr-2" />
                          Create Group ({selectedUsers.length} members)
                        </>
                      )}
                    </button>

                    {/* Back Button */}
                    <button
                      onClick={handleBackToForm}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      ← Back to Group Details
                    </button>
                  </div>
                )}

                {/* User Selection for Group - Only show in members step */}
                {groupCreationStep === 'members' && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="font-semibold text-sm" style={{color: '#374151'}}>Select Members</h4>
                     <span className="text-xs text-gray-500">
                       {users ? users.filter(u => u._id !== loggedInUser?._id).length : 0} users available
                     </span>
                   </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {users
                      ?.filter(u => 
                        u._id !== loggedInUser?._id
                      )
                      .map((u, index) => {
                        // Check if this user already has a chat
                        const existingChat = chats?.find(chat => chat.user._id === u._id);
                        
                        return (
                          <button
                            key={u._id}
                            className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${
                              selectedUsers.includes(u._id) 
                                ? 'bg-purple-100 border border-purple-300' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (selectedUsers.includes(u._id)) {
                                setSelectedUsers(prev => prev.filter(id => id !== u._id));
                              } else {
                                setSelectedUsers(prev => [...prev, u._id]);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                                   style={{background: `linear-gradient(${135 + index * 30}deg, #A78BFA, #F472B6)`}}>
                                {u.avatar ? (
                                  <img
                                    src={u.avatar}
                                    alt={u.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <span className="text-white font-semibold text-sm">
                                    {u.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                                                             <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                   <span className="text-sm font-medium" style={{color: '#374151'}}>{u.name}</span>
                                 </div>
                               </div>
                              {selectedUsers.includes(u._id) && (
                                <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
                )}
              </>
            ) : (
              <>
                                 {/* User Count Display */}
                 <div className="text-center mb-4">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-white/50">
                     <Users className="w-4 h-4" style={{color: '#A78BFA'}} />
                     <span className="text-sm font-medium" style={{color: '#374151'}}>
                       {!users ? (
                         <span className="text-gray-400">Loading users...</span>
                       ) : searchQuery ? (
                         <>
                           Found {users.filter(u => 
                             u._id !== loggedInUser?._id && 
                             u.name.toLowerCase().includes(searchQuery.toLowerCase())
                           ).length} of {users.filter(u => u._id !== loggedInUser?._id).length} users
                         </>
                       ) : (
                         `Connect with ${users.filter(u => u._id !== loggedInUser?._id).length} users`
                       )}
                     </span>
                   </div>
                 </div>

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
                    .map((u, index) => {
                      // Check if this user already has a chat
                      const existingChat = chats?.find(chat => chat.user._id === u._id);
                      
                      return (
                                                 <button
                           key={u._id}
                           className="w-full text-left group relative overflow-hidden"
                           onClick={() => {
                             createChat(u);
                             // Switch to chats view after creating chat
                             setShowAllUsers(false);
                           }}
                         >
                          <div className={`bg-white/60 backdrop-blur-sm rounded-xl p-3 border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${
                            existingChat ? 'border-orange-200 bg-orange-50/60' : 'border-white/50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden"
                                     style={{background: `linear-gradient(${135 + index * 30}deg, #A78BFA, #F472B6)`}}>
                                  {u.avatar ? (
                                    <img
                                      src={u.avatar}
                                      alt={u.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-white font-semibold">
                                      {u.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                {onlineUsers.includes(u._id) && (
                                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-sm"></div>
                                )}
                              </div>

                                                             <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                   <h4 className="font-semibold truncate text-sm" style={{color: '#374151'}}>{u.name}</h4>
                                 </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(u._id) ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                  <span className="text-xs text-gray-600">
                                    {onlineUsers.includes(u._id) ? "Available" : "Away"}
                                  </span>
                                </div>
                              </div>

                                                             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                 <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{backgroundColor: '#F472B6'}}>
                                   <MessageCircle className="w-3.5 h-3.5 text-white" />
                                 </div>
                               </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        ) : chats && chats.length > 0 ? (
          <>
            {/* Chats Count Display */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-white/50">
                <MessageCircle className="w-4 h-4" style={{color: '#A78BFA'}} />
                <span className="text-sm font-medium" style={{color: '#374151'}}>
                  {chats.length} conversation{chats.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="h-full overflow-y-auto overflow-x-hidden pb-4 space-y-2 custom-scrollbar">
            {(() => {
              // Create a Map to ensure unique users by ID
              const uniqueChats = new Map();
              
              chats.forEach(chat => {
                if (!uniqueChats.has(chat.user._id)) {
                  uniqueChats.set(chat.user._id, chat);
                } else {
                  // If we already have this user, keep the one with the most recent message
                  const existingChat = uniqueChats.get(chat.user._id);
                  const existingDate = existingChat.chat.updatedAt ? new Date(existingChat.chat.updatedAt) : new Date(0);
                  const newDate = chat.chat.updatedAt ? new Date(chat.chat.updatedAt) : new Date(0);
                  
                  if (newDate > existingDate) {
                    uniqueChats.set(chat.user._id, chat);
                  }
                }
              });
              
              const uniqueChatsArray = Array.from(uniqueChats.values());
              
              return uniqueChatsArray.map((chat, index) => {
              const latestMessage = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isSentByMe = latestMessage?.sender === loggedInUser?._id;
              const unseenCount = chat.chat.unseenCount || 0;
              
              // Check if this is a group chat
              const isGroupChat = chat.user.isGroup || chat.chat.chatType === 'group';
              const memberCount = chat.user.memberCount || (isGroupChat ? chat.chat.users?.length : 0);

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
                        {isGroupChat ? (
                          /* Group Chat Avatar - Show overlapped member avatars */
                          <div className="w-11 h-11 relative">
                            {/* Get first two members for overlapped display */}
                            {(() => {
                              const memberIds = chat.chat.users || [];
                              const firstMember = users?.find(u => u._id === memberIds[0]);
                              const secondMember = users?.find(u => u._id === memberIds[1]);
                              
                              return (
                                <>
                                  {/* First member avatar (bottom layer) */}
                                  <div className="absolute bottom-0 left-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-md overflow-hidden"
                                       style={{background: `linear-gradient(${135 + index * 25}deg, #A78BFA, #F472B6)`}}>
                                    {firstMember?.avatar ? (
                                      <img
                                        src={firstMember.avatar}
                                        alt={firstMember.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white font-semibold text-xs">
                                        {firstMember?.name?.charAt(0).toUpperCase() || 'G'}
                                      </span>
                                    )}
                                  </div>
                                  {/* Second member avatar (top layer, overlapping) */}
                                  <div className="absolute top-0 right-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-md overflow-hidden border-2 border-white"
                                       style={{background: `linear-gradient(${(135 + index * 25 + 180) % 360}deg, #F472B6, #A78BFA)`}}>
                                    {secondMember?.avatar ? (
                                      <img
                                        src={secondMember.avatar}
                                        alt={secondMember.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white font-semibold text-xs">
                                        {secondMember?.name?.charAt(0).toUpperCase() || (memberCount > 2 ? '+' : 'G')}
                                      </span>
                                    )}
                                  </div>
                                  {/* Member count badge */}
                                  {memberCount > 2 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center border-2 border-white shadow-sm">
                                      <span className="text-white text-xs font-bold">{memberCount}</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          /* Individual Chat Avatar - Show single user avatar */
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden ${
                            isSelected ? 'ring-2 ring-purple-200' : ''
                          }`}
                               style={{background: `linear-gradient(${135 + index * 25}deg, #A78BFA, #F472B6)`}}>
                            {chat.user.avatar ? (
                              <img
                                src={chat.user.avatar}
                                alt={chat.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {chat.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Online status indicator - only for individual chats */}
                        {!isGroupChat && onlineUsers.includes(chat.user._id) && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-sm">
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate text-sm" style={{color: '#374151'}}>
                              {chat.user.name}
                            </h4>
                            {isGroupChat && (
                              <Users className="w-3 h-3 text-purple-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isGroupChat && (
                              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                                <Users className="w-3 h-3 text-purple-500" />
                              </div>
                            )}
                            {unseenCount > 0 && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
                                   style={{background: 'linear-gradient(135deg, #F472B6, #A78BFA)'}}>
                                {unseenCount > 9 ? "9+" : unseenCount}
                              </div>
                            )}
                          </div>
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
                              {latestMessage.text || null}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            });
            })()}
            </div>
          </>
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
      <div className="relative z-10 p-3">
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