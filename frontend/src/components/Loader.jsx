import React from "react";

export default function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Premium Loading Animation */}
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-2xl flex items-center justify-center relative">
            {/* Outer rotating ring */}
            <div className="absolute -inset-4 border-4 border-purple-200 rounded-3xl animate-ping-slow"></div>

            {/* Inner rotating element */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-blue-400 animate-spin-slow">
              <div className="absolute inset-2 bg-white rounded-xl"></div>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Text */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            Crafting Your Recipe
          </h1>
        </div>

        {/* Fun Facts */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <p className="text-gray-600 text-sm italic">
              "Good food is all the sweeter when shared with good friends"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
