import { Loader2, Paperclip, Send, X, Smile, Image } from "lucide-react";
import React, { useState } from "react";

interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (message: string) => void;
  handleMessageSend: (e: any, imageFile?: File | null) => void;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    setIsUploading(true);
    await handleMessageSend(e, imageFile);
    setImageFile(null);
    setIsUploading(false);
  };

  if (!selectedUser) return null;

  return (
    <div className="border-t border-pink-100/50 bg-white/80 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Image preview */}
        {imageFile && (
          <div className="relative w-fit">
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-3 border border-purple-100">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="w-32 h-32 object-cover rounded-xl shadow-sm"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setImageFile(null)}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600 font-medium">
              Ready to send
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-3">
          {/* Attachment button */}
          <label className="cursor-pointer group">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-2xl transition-all shadow-sm hover:shadow-md">
              <Paperclip className="w-5 h-5 text-purple-600 group-hover:rotate-12 transition-transform" />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.type.startsWith("image/")) {
                  setImageFile(file);
                }
              }}
            />
          </label>

          {/* Message input */}
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full bg-white border border-purple-100 rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all shadow-sm pr-12"
              placeholder={
                imageFile 
                  ? "Add a caption..." 
                  : "Type your message..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            
            {/* Emoji button */}
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-purple-50 rounded-full transition-colors"
            >
              <Smile className="w-5 h-5 text-purple-400 hover:text-purple-600" />
            </button>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={(!imageFile && !message.trim()) || isUploading}
            className={`p-4 rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center min-w-[56px] ${
              (!imageFile && !message.trim()) || isUploading
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl text-purple-600 font-medium transition-all border border-purple-100"
            >
              👋 Wave
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl text-purple-600 font-medium transition-all border border-purple-100"
            >
              ❤️ Heart
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl text-purple-600 font-medium transition-all border border-purple-100"
            >
              👍 Like
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;