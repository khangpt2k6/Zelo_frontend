import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import React, { useEffect, useMemo, useRef } from "react";
import moment from "moment";
import { Check, CheckCheck, Heart } from "lucide-react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full max-h-[calc(100vh-215px)] overflow-y-auto p-4 space-y-4 custom-scroll">
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Start a conversation now ....
            </h3>

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
                  className={`flex gap-3 ${
                    isSentByMe ? "justify-end" : "justify-start"
                  }`}
                  key={uniqueKey}
                >
                  {/* Avatar for received messages */}
                  {!isSentByMe && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600">
                          {message.sender?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-sm ${
                      isSentByMe ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isSentByMe
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                          : "bg-purple-50 text-gray-800 border border-purple-100 rounded-bl-md"
                      }`}
                    >
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