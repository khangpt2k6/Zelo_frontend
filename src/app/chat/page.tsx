"use client";

import { useAppData, User } from "@/context/AppContext";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatSidebar from "@/components/ChatSidebar";
import MessageInput from "@/components/MessageInput";
import PinnedMessages from "@/components/PinnedMessages";
import { useEffect, useState } from "react";
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
  const { user, chats, users, logoutUser } = useAppData();
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

  useEffect(() => {
    if (user) {
      console.log("Setting up socket connection to:", process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002");
      const newSocket = io(process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002");
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
    }
  }, [user]);

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
      
      console.log("Making request to:", `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002"}${endpoint}`);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002"}${endpoint}`,
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
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002"}/api/v1/message/${messageId}/pin`,
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
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002"}/api/v1/message/${messageId}/reaction`,
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
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002"}/api/v1/message/${messageId}/pin`,
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

  const fetchMessages = async () => {
    if (!selectedUser) return;

    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002"}/api/v1/message/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched existing messages:", response.data.messages);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchPinnedMessages = async () => {
    if (!selectedUser) return;

    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE || "http://localhost:5002"}/api/v1/chat/${selectedUser}/pinned`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPinnedMessages(response.data.pinnedMessages);
    } catch (error) {
      console.error("Error fetching pinned messages:", error);
    }
  };

  const createChat = async (selectedUser: User) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${"http://localhost:5002"}/api/v1/chat/new`,
        {
          otherUserId: selectedUser._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedUser(response.data.chatId);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      // Clear previous messages when switching chats
      setMessages(null);
      fetchMessages();
      fetchPinnedMessages();
    }
  }, [selectedUser]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please login to continue</h1>
        </div>
      </div>
    );
  }

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
        handleLogout={logoutUser}
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Select a chat to start messaging
              </h2>
              <p className="text-gray-500">
                Choose a user from the sidebar to begin your conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
