"use client";

import { useAppData, User } from "@/context/AppContext";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatSidebar from "@/components/ChatSidebar";
import MessageInput from "@/components/MessageInput";
import PinnedMessages from "@/components/PinnedMessages";
import Loading from "@/components/Loading";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  // New fields for enhanced features
  replyTo?: {
    messageId: string;
    text: string;
    sender: string;
  };
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  reactions: {
    userId: string;
    emoji: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const ChatPage = () => {
  const { user, chats, users, logoutUser, fetchChats, isAuth, loading } = useAppData();
  const router = useRouter();

  // All hooks must be declared before any conditional returns
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  // Socket connection effect
  useEffect(() => {
    // Only set up socket if user exists and is authenticated
    if (!user || !isAuth) return;

    console.log("Setting up socket connection to:", process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002");
    const newSocket = io(process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.emit("setup", user);

    newSocket.on("newMessage", (message: Message) => {
      console.log("Received new message via socket:", message);
      setMessages((prev) => {
        if (!prev) return [message];
        return [...prev, message];
      });
    });

    newSocket.on("messagesSeen", (data: { chatId: string; seenBy: string; messageIds: string[] }) => {
      setMessages((prev) => {
        if (!prev) return prev;
        return prev.map((msg) => {
          if (data.messageIds.includes(msg._id)) {
            return { ...msg, seen: true, seenAt: new Date().toISOString() };
          }
          return msg;
        });
      });
    });

    newSocket.on("messagePinned", (data: { messageId: string; isPinned: boolean }) => {
      setMessages((prev) => {
        if (!prev) return prev;
        return prev.map((msg) => {
          if (msg._id === data.messageId) {
            return { 
              ...msg, 
              isPinned: data.isPinned,
              pinnedAt: data.isPinned ? new Date().toISOString() : undefined
            };
          }
          return msg;
        });
      });

      // Update pinned messages list
      if (data.isPinned) {
        setPinnedMessages((prev) => {
          const message = messages?.find(m => m._id === data.messageId);
          if (message && !prev.find(m => m._id === data.messageId)) {
            return [...prev, { ...message, isPinned: true, pinnedAt: new Date().toISOString() }];
          }
          return prev;
        });
      } else {
        setPinnedMessages((prev) => prev.filter(m => m._id !== data.messageId));
      }
    });

    newSocket.on("messageReaction", (data: { messageId: string; reactions: any[] }) => {
      setMessages((prev) => {
        if (!prev) return prev;
        return prev.map((msg) => {
          if (msg._id === data.messageId) {
            return { ...msg, reactions: data.reactions };
          }
          return msg;
        });
      });
    });

    return () => {
      newSocket.close();
    };
  }, [user, isAuth]);

  // useCallback hooks must also be declared before any conditional returns
  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;

    setIsLoadingMessages(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}/api/v1/message/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched existing messages:", response.data.messages);
      setMessages(response.data.messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        logoutUser();
      } else if (error.response?.status === 404) {
        console.log("Chat not found, this might be a new conversation");
        setMessages([]);
      } else {
        console.error("Unexpected error:", error.response?.data || error.message);
        setMessages([]);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, [selectedUser]);

  const fetchPinnedMessages = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}/api/v1/chat/${selectedUser}/pinned`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPinnedMessages(response.data.pinnedMessages);
    } catch (error: any) {
      console.error("Error fetching pinned messages:", error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        logoutUser();
      }
    }
  }, [selectedUser]);

  // Fetch messages when selectedUser changes - MOVED HERE after functions are defined
  useEffect(() => {
    if (selectedUser) {
      console.log("Selected user changed, fetching messages for:", selectedUser);
      fetchMessages();
      fetchPinnedMessages();
    } else {
      // Clear messages when no user is selected
      setMessages(null);
      setPinnedMessages([]);
    }
  }, [selectedUser, fetchMessages, fetchPinnedMessages]);

  // Early returns after all hooks are declared
  if (loading) return <Loading />;
  if (!isAuth || !user) return <Loading />;

  const handleSendMessage = async (text: string, image?: File) => {
    if (!selectedUser || !user) return;

    // Create a temporary message object for immediate display
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      chatId: selectedUser,
      sender: user._id,
      text: text,
      messageType: "text",
      seen: false,
      replyTo: replyToMessage ? {
        messageId: replyToMessage._id,
        text: replyToMessage.text || "Image",
        sender: replyToMessage.sender
      } : undefined,
      isPinned: false,
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add image if present
    if (image) {
      tempMessage.messageType = "image";
      tempMessage.image = {
        url: URL.createObjectURL(image),
        publicId: "temp"
      };
    }

    // Immediately add the message to the local state
    setMessages((prev) => {
      if (!prev) return [tempMessage];
      return [...prev, tempMessage];
    });

    try {
      console.log("Sending message to backend:", { text, selectedUser, replyToMessage });
      
      const formData = new FormData();
      formData.append("chatId", selectedUser);
      formData.append("text", text);
      
      if (replyToMessage) {
        formData.append("replyToMessageId", replyToMessage._id);
      }
      
      if (image) {
        formData.append("image", image);
      }

      const endpoint = replyToMessage ? "/api/v1/message/reply" : "/api/v1/message";
      const token = Cookies.get("token");

      console.log("Making request to:", `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}${endpoint}`);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Backend response:", response.data);

      // Replace the temporary message with the real one from the server
      if (response.data.message) {
        setMessages((prev) => {
          if (!prev) return [response.data.message];
          return prev.map(msg => 
            msg._id === tempMessage._id ? response.data.message : msg
          );
        });
      }

      // Clear reply state after sending
      setReplyToMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove the temporary message if sending failed
      setMessages((prev) => {
        if (!prev) return prev;
        return prev.filter(msg => msg._id !== tempMessage._id);
      });
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}/api/v1/message/${messageId}/pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      console.log("Adding reaction:", { messageId, emoji });
      const token = Cookies.get("token");
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}/api/v1/message/${messageId}/reaction`,
        { emoji },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Reaction response:", response.data);
      
      // Update the message locally with the new reaction
      setMessages((prev) => {
        if (!prev) return prev;
        return prev.map((msg) => {
          if (msg._id === messageId) {
            const newReaction = {
              userId: user._id,
              emoji: emoji,
              createdAt: new Date().toISOString()
            };
            
            const existingReactions = msg.reactions || [];
            const existingReactionIndex = existingReactions.findIndex(
              r => r.userId === user._id && r.emoji === emoji
            );
            
            let updatedReactions;
            if (existingReactionIndex >= 0) {
              // Remove existing reaction if same emoji
              updatedReactions = existingReactions.filter((_, index) => index !== existingReactionIndex);
            } else {
              // Add new reaction
              updatedReactions = [...existingReactions, newReaction];
            }
            
            return { ...msg, reactions: updatedReactions };
          }
          return msg;
        });
      });
      
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleReplyMessage = (message: Message) => {
    setReplyToMessage(message);
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const handleUnpinMessage = async (messageId: string) => {
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}/api/v1/message/${messageId}/pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error unpinning message:", error);
    }
  };

  const createChat = async (selectedUser: User) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://54.80.194.225:5002"}/api/v1/chat/new`,
        {
          otherUserId: selectedUser._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Set the selected user to the new chat
      setSelectedUser(response.data.chatId);
      
      // Refresh the chats list to include the new chat
      // Wait a bit for the backend to process, then refresh
      setTimeout(() => {
        fetchChats();
      }, 500);
      
      console.log("Chat created successfully:", response.data);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please login to continue</h1>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutUser();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={users}
        loggedInUser={user}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header */}
            <ChatHeader 
              user={(() => {
                // Find the chat and get the other user's information
                const chat = chats?.find(c => c.chat._id === selectedUser);
                if (chat) {
                  return chat.user; // This is the other user in the chat
                }
                return null;
              })()}
              setSidebarOpen={setSidebarOpen}
              isTyping={isTyping}
              onlineUsers={onlineUsers}
              // Group chat properties
              isGroupChat={(() => {
                const chat = chats?.find(c => c.chat._id === selectedUser);
                return chat?.user.isGroup || chat?.chat.chatType === 'group';
              })()}
              groupMembers={(() => {
                const chat = chats?.find(c => c.chat._id === selectedUser);
                return chat?.chat.users || [];
              })()}
              memberCount={(() => {
                const chat = chats?.find(c => c.chat._id === selectedUser);
                return chat?.user.memberCount || chat?.chat.users?.length || 0;
              })()}
              groupName={(() => {
                const chat = chats?.find(c => c.chat._id === selectedUser);
                return chat?.chat.groupName || chat?.user.name;
              })()}
              // Pass all users to get member details
              allUsers={users || []}
            />

            {/* Pinned Messages */}
            {showPinnedMessages && pinnedMessages.length > 0 && (
              <PinnedMessages
                pinnedMessages={pinnedMessages}
                loggedInUser={user}
                onUnpinMessage={handleUnpinMessage}
                onClose={() => setShowPinnedMessages(false)}
              />
            )}

            {/* Messages */}
            <ChatMessages
              selectedUser={selectedUser}
              messages={messages}
              loggedInUser={user}
              isLoading={isLoadingMessages}
              otherUser={(() => {
                // Find the chat and get the other user's information
                const chat = chats?.find(c => c.chat._id === selectedUser);
                if (chat) {
                  return chat.user; // This is the other user in the chat
                }
                return null;
              })()}
              onReplyMessage={handleReplyMessage}
              onPinMessage={handlePinMessage}
              onAddReaction={handleAddReaction}
            />

            {/* Input */}
            <MessageInput
              selectedUser={selectedUser}
              loggedInUser={user}
              onSendMessage={handleSendMessage}
              replyToMessage={replyToMessage}
              onCancelReply={handleCancelReply}
            />
          </>
                 ) : (
            <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{backgroundColor: '#FFF1F2'}}>
              {/* Subtle background patterns */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-5" 
                     style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full opacity-5" 
                     style={{background: 'linear-gradient(45deg, #F472B6, #A78BFA)'}}></div>
                <div className="absolute top-1/2 left-10 w-16 h-16 rounded-full opacity-5" 
                     style={{background: 'linear-gradient(90deg, #A78BFA, #F472B6)'}}></div>
              </div>

              {/* Main content */}
              <div className="text-center space-y-8 p-8 relative z-10">
                {/* Message Icon */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                  <div className="w-full h-full rounded-2xl shadow-xl flex items-center justify-center transform rotate-6" 
                       style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}>
                    <svg 
                      className="w-12 h-12 text-white transform -rotate-6" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                  
                  {/* Small decorative dots */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" 
                       style={{backgroundColor: '#F472B6'}}></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-pulse" 
                       style={{backgroundColor: '#A78BFA', animationDelay: '0.5s'}}></div>
                </div>

                {/* Welcome Text */}
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold" 
                      style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    Welcome to Zelo
                  </h1>
                  
                  <div className="space-y-2">
                    <p className="text-lg" style={{color: '#374151'}}>
                      Your modern chat experience starts here
                    </p>
                    <p className="text-base" style={{color: '#6B7280'}}>
                      Select a user from the sidebar to begin your conversation
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="px-8 py-3 text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Open Sidebar</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
       </div>
     </div>
   );
 };

 export default ChatPage;
