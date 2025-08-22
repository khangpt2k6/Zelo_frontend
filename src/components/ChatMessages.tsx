import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { Check, CheckCheck, Heart, Reply, Pin, Smile, MoreVertical } from "lucide-react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
  otherUser: User | null; // Add this to get the other user's info
  isLoading?: boolean; // Add loading state prop
  onReplyMessage?: (message: Message) => void;
  onPinMessage?: (messageId: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
}

const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
  otherUser,
  isLoading = false,
  onReplyMessage,
  onPinMessage,
  onAddReaction,
}: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🎉", "🔥", "💯"];



  // Remove duplicate messages
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((message) => {
      if (seen.has(message._id)) {
        return false;
      }
      seen.add(message._id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser, uniqueMessages]);

  const handleReactionClick = (messageId: string, emoji: string) => {
    onAddReaction?.(messageId, emoji);
    setShowReactionPicker(null);
  };

  const getReactionCount = (message: Message, emoji: string) => {
    return message.reactions?.filter(reaction => reaction.emoji === emoji).length || 0;
  };

  const hasUserReacted = (message: Message, emoji: string) => {
    return message.reactions?.some(reaction => 
      reaction.userId === loggedInUser?._id && reaction.emoji === emoji
    ) || false;
  };

  const renderReplyMessage = (replyTo: any) => {
    if (!replyTo) return null;
    
    return (
      <div className="bg-black/10 rounded-lg p-2 mb-2 border-l-4 border-purple-400">
        <div className="text-xs text-gray-600 mb-1">
          Replying to {replyTo.sender === loggedInUser?._id ? 'yourself' : otherUser?.name || 'message'}
        </div>
        <div className="text-sm truncate">
          {replyTo.text || "Image"}
        </div>
      </div>
    );
  };

  const renderReactions = (message: Message) => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionGroups = message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, any[]>);

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(reactionGroups).map(([emoji, reactions]) => (
          <button
            key={emoji}
            onClick={() => handleReactionClick(message._id, emoji)}
            className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
              hasUserReacted(message, emoji)
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{emoji}</span>
            <span>{reactions.length}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full max-h-[calc(100vh-215px)] overflow-y-auto p-4 space-y-4 custom-scroll">
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Start a conversation now ....
            </h3>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading messages...</h3>
            <p className="text-gray-500">Please wait while we fetch your conversation</p>
          </div>
        ) : uniqueMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500">Start the conversation by sending a message!</p>
          </div>
        ) : (
          <>
            {uniqueMessages.map((message, index) => {
              const isSentByMe = message.sender === loggedInUser?._id;
              const uniqueKey = `${message._id}-${index}`;
              const showAvatar = 
                index === 0 || 
                uniqueMessages[index - 1]?.sender !== message.sender;

              return (
                <div
                  className={`flex gap-3 group ${
                    isSentByMe ? "justify-end" : "justify-start"
                  }`}
                  key={uniqueKey}
                >
                  {/* Avatar for received messages */}
                  {!isSentByMe && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        {otherUser?.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-purple-600">
                            {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-sm relative ${
                      isSentByMe ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Message actions - visible on hover */}
                    <div className={`absolute top-0 ${isSentByMe ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                      <button
                        onClick={() => onReplyMessage?.(message)}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                        title="Reply"
                      >
                        <Reply className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowReactionPicker(showReactionPicker === message._id ? null : message._id)}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                        title="React"
                      >
                        <Smile className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowMessageMenu(showMessageMenu === message._id ? null : message._id)}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                        title="More"
                      >
                        <MoreVertical className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>

                    {/* Message menu */}
                    {showMessageMenu === message._id && (
                      <div className={`absolute top-6 ${isSentByMe ? 'left-0' : 'right-0'} bg-white rounded-lg shadow-lg border p-2 z-10`}>
                        <button
                          onClick={() => {
                            onPinMessage?.(message._id);
                            setShowMessageMenu(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded w-full"
                        >
                          <Pin className="w-4 h-4" />
                          {message.isPinned ? 'Unpin' : 'Pin'} message
                        </button>
                      </div>
                    )}

                    {/* Reaction picker */}
                    {showReactionPicker === message._id && (
                      <div className={`absolute top-full ${isSentByMe ? 'right-0' : 'left-0'} mt-2 bg-white rounded-lg shadow-lg border p-2 z-10`}>
                        <div className="flex gap-1">
                          {commonEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReactionClick(message._id, emoji)}
                              className="p-1 hover:bg-gray-100 rounded text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pinned indicator */}
                    {message.isPinned && (
                      <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isSentByMe
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                          : "bg-purple-50 text-gray-800 border border-purple-100 rounded-bl-md"
                      }`}
                    >
                      {/* Reply message */}
                      {message.replyTo && renderReplyMessage(message.replyTo)}

                      {/* Image message */}
                      {message.messageType === "image" && message.image && (
                        <div className="relative group mb-2">
                          <img
                            src={message.image.url}
                            alt="shared image"
                            className="max-w-full h-auto rounded-xl shadow-sm"
                          />
                        </div>
                      )}

                      {/* Text message */}
                      {message.text && (
                        <p className="leading-relaxed break-words">
                          {message.text}
                        </p>
                      )}
                    </div>

                    {/* Reactions */}
                    {renderReactions(message)}

                    {/* Message metadata */}
                    <div
                      className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                        isSentByMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <span className="font-medium">
                        {moment(message.createdAt).format("hh:mm A")}
                      </span>

                      {/* Read receipts for sent messages */}
                      {isSentByMe && (
                        <div className="flex items-center">
                          {message.seen ? (
                            <div className="flex items-center gap-1 text-purple-400">
                              <CheckCheck className="w-3.5 h-3.5" />
                              {message.seenAt && (
                                <span className="text-xs">
                                  {moment(message.seenAt).format("hh:mm A")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Check className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spacer for sent messages to balance layout */}
                  {isSentByMe && <div className="w-8"></div>}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;