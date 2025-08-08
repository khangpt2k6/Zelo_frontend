import React from "react";

const Loading = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "#FFF1F2" }} // Background: Blush
    >
      <div
        className="h-12 w-12 border-4 rounded-full animate-spin"
        style={{
          borderColor: "#A78BFA", // Primary: Purple
          borderTopColor: "#F472B6", // Accent: Soft Pink
        }}
      />
    </div>
  );
};

export default Loading;
