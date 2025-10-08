import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function SpeechToText({ handleSubmit, setScript }) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [isPulsing, setIsPulsing] = useState(false);
  const [words, setWords] = useState([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    setIsPulsing(listening);

    if (transcript) {
      const newWords = transcript.split(" ").filter((word) => word.length > 0);
      setWords(newWords);
      setScript(transcript);
    } else {
      setWords([]);
      setScript("");
    }
  }, [listening, transcript]);

  const handleClick = async () => {
    if (!listening) {
      setIsRequestingPermission(true);
      setPermissionDenied(false);

      try {
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // If we get the stream, we have permission - start listening
        if (stream) {
          // Stop all tracks to release the microphone immediately
          stream.getTracks().forEach((track) => track.stop());
          SpeechRecognition.startListening({
            continuous: true,
            language: "en-IN",
          });
        }
      } catch (error) {
        setPermissionDenied(true);
        SpeechRecognition.stopListening();
        console.error("Microphone permission denied:", error);
      } finally {
        setIsRequestingPermission(false);
      }
    } else {
      SpeechRecognition.stopListening()
        .then(handleSubmit())
        .catch((err) => console.log(err));
    }
  };

  const handleReset = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    }
    resetTranscript();
    setWords([]);
    setPermissionDenied(false);
  };

  // Function to manually retry permission
  const retryPermission = () => {
    setPermissionDenied(false);
    handleClick();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Browser Not Supported
          </h2>
          <p className="text-gray-600">
            Your browser doesn't support speech recognition. Please try Chrome,
            Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full transition-all duration-300 hover:shadow-2xl">
        {/* Permission Denied Message */}
        {permissionDenied && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-microphone-slash text-red-500 text-xl mr-3"></i>
                <div>
                  <h3 className="font-semibold text-red-800">
                    Microphone Access Required
                  </h3>
                  <p className="text-red-600 text-sm">
                    Please allow microphone access to use speech recognition.
                  </p>
                </div>
              </div>
              <button
                onClick={retryPermission}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className={`${listening ? "flex" : "hidden"} justify-center mb-8`}>
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center 
            ${
              listening
                ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-200"
                : isRequestingPermission
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-yellow-200"
                : "bg-gradient-to-r from-slate-200 to-slate-300"
            } transition-all duration-500`}
          >
            {/* Pulsing Animation */}
            <div
              className={`absolute inset-0 rounded-full ${
                isPulsing ? "animate-ping bg-green-400 opacity-70" : ""
              }`}
            ></div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              listening
                ? "bg-green-100 text-green-800 animate-pulse"
                : isRequestingPermission
                ? "bg-yellow-100 text-yellow-800"
                : "bg-slate-100 text-slate-800"
            } transition-colors duration-300`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                listening
                  ? "bg-green-500 animate-pulse"
                  : isRequestingPermission
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-slate-500"
              }`}
            ></span>
            {isRequestingPermission
              ? "Requesting Permission..."
              : listening
              ? "Listening..."
              : "Ready to listen"}
          </div>
        </div>

        {/* Main Control Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleClick}
            disabled={isRequestingPermission}
            className={`relative overflow-hidden group px-8 py-4 rounded-2xl font-semibold text-lg 
              transition-all duration-500 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed ${
                listening
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200"
                  : isRequestingPermission
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-200"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200"
              }`}
          >
            <span className="relative z-10 flex items-center">
              {isRequestingPermission ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Requesting Access...
                </>
              ) : listening ? (
                transcript ? (
                  <>
                    <i className="fas fa-stop mr-2"></i>
                    Fetch recipe 😋
                  </>
                ) : (
                  <>
                    <i className="fas fa-stop mr-2"></i>
                    Stop
                  </>
                )
              ) : (
                <>
                  <i className="fas fa-play mr-2"></i>
                  Start Recording
                </>
              )}
            </span>

            {/* Button Shine Effect */}
            {!isRequestingPermission && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent 
                transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-20"
              ></div>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm">
            {!listening && !isRequestingPermission && (
              <>
                Tap "Start Recording" to begin. You'll be asked for microphone
                permission.
              </>
            )}
            {isRequestingPermission && (
              <>Please allow microphone access when prompted by your browser.</>
            )}
          </p>
        </div>

        {/* Transcript Display */}
        <div className="mb-8">
          <div className="bg-slate-50 rounded-xl p-6 min-h-[120px] border border-slate-200 transition-all duration-300">
            {transcript ? (
              <div className="text-gray-700 leading-relaxed">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className="inline-block mr-1 transition-all duration-300 hover:scale-105 hover:text-purple-600"
                  >
                    {word}
                  </span>
                ))}
                {listening && (
                  <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
                )}
              </div>
            ) : (
              <div className="text-gray-400 italic text-center py-8">
                <i className="fas fa-comment-dots text-2xl mb-2 block"></i>
                {permissionDenied
                  ? "Microphone access denied. Please allow access to start transcribing."
                  : "Your speech will appear here..."}
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            disabled={(!transcript && !listening) || isRequestingPermission}
            className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              (transcript || listening) && !isRequestingPermission
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 hover:scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <i className="fas fa-undo mr-2"></i>
            Reset Transcription
          </button>
        </div>
      </div>

      {/* Browser Instructions */}
      {permissionDenied && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-2xl w-full">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            Can't find the permission prompt?
          </h3>
          <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
            <li>Check your browser's address bar for a microphone icon</li>
            <li>Look for a pop-up that might be blocked by your browser</li>
            <li>
              Ensure your microphone is connected and not being used by another
              app
            </li>
            <li>Check your browser settings for microphone permissions</li>
          </ul>
        </div>
      )}
    </div>
  );
}
