import React, { useState, useEffect, useRef } from "react";

export default function Recipe({ recipe, setScript, setRecipe }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const speechSynth = useRef(null);
  const utteranceRef = useRef(null);

  function removeEmojis(text) {
    return text.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    );
  }

  useEffect(() => {
    speechSynth.current = window.speechSynthesis;

    // Cleanup speech on component unmount
    return () => {
      if (speechSynth.current.speaking) {
        speechSynth.current.cancel();
      }
    };
  }, []);

  const speakRecipe = () => {
    if (!recipe) return;

    if (isSpeaking) {
      // Stop speaking
      speechSynth.current.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(removeEmojis(recipe));
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Get available voices and try to use a pleasant one
    const voices = speechSynth.current.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Karen") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Google")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Event listeners
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    // Start speaking
    speechSynth.current.speak(utterance);
    setCurrentUtterance(utterance);
  };

  const pauseResumeSpeech = () => {
    if (!speechSynth.current) return;

    if (speechSynth.current.speaking) {
      speechSynth.current.pause();
      setIsSpeaking(false);
    } else {
      speechSynth.current.resume();
      setIsSpeaking(true);
    }
  };

  const formatRecipeText = (text) => {
    if (!text) return [];

    // Split into paragraphs and add formatting
    return text.split("\n").filter((paragraph) => paragraph.trim().length > 0);
  };

  const handleReset = () => {
    if (speechSynth.current.speaking) {
      speechSynth.current.cancel();
    }
    setScript("");
    setRecipe("");
  };

  useEffect(() => {
    speakRecipe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent mb-2">
            Your Recipe
          </h1>
        </div>

        {/* Recipe Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Speech Controls */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={speakRecipe}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                    isSpeaking
                      ? "bg-red-600 shadow-lg shadow-red-200"
                      : "bg-green-600 shadow-lg shadow-green-200"
                  }`}
                >
                  <span>{isSpeaking ? "Stop Reading" : "Read Recipe"}</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={pauseResumeSpeech}
                    className="flex items-center space-x-3 px-6 py-3 bg-white text-orange-600 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <span>Pause</span>
                  </button>
                )}
              </div>

              <div className="hidden sm:flex items-center space-x-2 text-white">
                <span className="font-medium">Text-to-Speech</span>
              </div>
            </div>
          </div>

          {/* Recipe Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              {formatRecipeText(recipe).map((paragraph, index) => (
                <div
                  key={index}
                  className="mb-4 sm:mb-5 lg:mb-6 p-3 sm:p-4 bg-amber-50 rounded-xl sm:rounded-2xl border-l-4 border-orange-400 transition-all duration-300 hover:bg-amber-100 hover:shadow-sm sm:hover:shadow-md"
                >
                  <p className="text-gray-800 leading-relaxed text-base sm:text-lg">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={handleReset}
            className="group flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            <span>New Recipe</span>
          </button>

          <button
            onClick={() => window.print()}
            className="group flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            <span>Print Recipe</span>
          </button>
        </div>
      </div>
    </div>
  );
}
