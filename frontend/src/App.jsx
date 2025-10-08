import React, { useState } from "react";
import "./App.css";
import SpeechToText from "./components/speechToText";
import Loader from "./components/Loader";
import Recipe from "./components/recipe";
import Header from "./components/Header";

export default function App() {
  const [recipe, setrecipe] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    console.log(script);

    setLoading(true);

    // prevent sending empty or whitespace-only queries
    if (!script.trim()) {
      setLoading(false);
      return;
    }

    try {
      const result = await fetch(
        "https://voice-controlled-cooking-assistant-six.vercel.app/api/recipe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword: script }),
        }
      );

      if (!result.ok) {
        console.error("Failed to fetch recipe:", result.statusText);
        return;
      }

      const res = await result.json();

      setrecipe(res?.recipe || "");
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Recipe recipe={recipe} setRecipe={setrecipe} setScript={setScript} />
          <SpeechToText setScript={setScript} handleSubmit={handleSubmit} />
        </>
      )}
    </div>
  );
}
