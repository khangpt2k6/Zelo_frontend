import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import React, { useState, useRef, useEffect } from "react";
import { Send, Image, X } from "lucide-react";

interface MessageInputProps {
  selectedUser: string | null;
  loggedInUser: User | null;
  onSendMessage: (text: string, image?: File) => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
}

const MessageInput = ({
  selectedUser,
  loggedInUser,
  onSendMessage,
  replyToMessage,
  onCancelReply,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !image) return;

    onSendMessage(message, image || undefined);
    setMessage("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!selectedUser) {
    return (
      <div className="p-4 border-t bg-white">
        <div className="text-center text-gray-500">
          Select a chat to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="bg-purple-50 border-b border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-purple-700">
                Replying to {replyToMessage.sender === loggedInUser?._id ? 'yourself' : 'message'}
              </span>
            </div>
            <button
              onClick={onCancelReply}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-1 text-sm text-gray-600 truncate">
            {replyToMessage.text || "Image"}
          </div>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-lg"
              />
              <span className="text-sm text-gray-600">{image?.name}</span>
            </div>
            <button
              onClick={removeImage}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-3">
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={1}
              style={{
                minHeight: "48px",
                maxHeight: "120px",
              }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() && !image}
            className={`p-3 rounded-full transition-colors ${
              message.trim() || image
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;