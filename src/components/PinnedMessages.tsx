import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import React from "react";
import moment from "moment";
import { Pin, X } from "lucide-react";

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  loggedInUser: User | null;
  onUnpinMessage?: (messageId: string) => void;
  onClose?: () => void;
}

const PinnedMessages = ({
  pinnedMessages,
  loggedInUser,
  onUnpinMessage,
  onClose,
}: PinnedMessagesProps) => {
  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div className="bg-purple-50 border-b border-purple-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            Pinned Messages ({pinnedMessages.length})
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {pinnedMessages.map((message) => {
          const isSentByMe = message.sender === loggedInUser?._id;
          
          return (
            <div
              key={message._id}
              className="flex items-center justify-between bg-white rounded-lg p-2 border border-purple-100"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600">
                      {message.sender?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {isSentByMe ? "You" : "Other"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {moment(message.pinnedAt || message.createdAt).format("MMM D, h:mm A")}
                  </span>
                </div>
                
                <div className="text-sm text-gray-800 truncate">
                  {message.messageType === "image" ? (
                    <span className="flex items-center gap-1">
                      <span>📷</span>
                      <span>{message.text || "Image"}</span>
                    </span>
                  ) : (
                    message.text
                  )}
                </div>
              </div>

              {onUnpinMessage && (
                <button
                  onClick={() => onUnpinMessage(message._id)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Unpin message"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PinnedMessages;
