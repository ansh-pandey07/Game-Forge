"use client";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [activeTab, setActiveTab] =
  useState<"preview" | "code">("preview");
  type GameHistory = {
  id: number;
  prompt: string;
  code: string;
};
const enhancePrompt = async () => {
  try {
    const response = await fetch("/api/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const data = await response.json();

    if (data.prompt) {
      setEnhancedPrompt(data.prompt);
      setShowEnhancer(true);
    }
  } catch (error) {
    console.error(error);
  }
};


const [history, setHistory] =
  useState<GameHistory[]>([]);

  useEffect(() => {
  const savedGames = localStorage.getItem("gameforge-history");

  if (savedGames) {
    setHistory(JSON.parse(savedGames));
  }
}, []);

const generateGame = async () => {
  try {
    setLoading(true);

    console.log("Prompt Being Sent:");
    console.log(enhancedPrompt || prompt);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt || prompt,
      }),
    });

    console.log("Response Status:", response.status);

    const data = await response.json();

if (!response.ok) {
  alert(data.error || "Enhance failed");
  return;
}

    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      alert("API Error");
      return;
    }

    if (!data.code) {
      console.log("No code returned!");
      alert("No game code returned from API");
      return;
    }

    setGameCode(data.code);

    const newGame = {
      id: Date.now(),
      prompt,
      code: data.code,
    };

    const updatedHistory = [newGame, ...history].slice(0, 10);

    setHistory(updatedHistory);

    localStorage.setItem(
      "gameforge-history",
      JSON.stringify(updatedHistory)
    );

  } catch (error) {
    console.error("Generate Error:", error);
    alert("Failed to generate game");
  } finally {
    setLoading(false);
  }
};

  const downloadGame = () => {
    const blob = new Blob([gameCode], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "gameforge-game.html";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-6xl font-bold text-center mb-8">
          🎮 GameForge AI
        </h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your game..."
          className="w-full h-40 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none resize-none"
        />
        <button
  onClick={enhancePrompt}
  className="mt-3 ml-3 px-5 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl"
>
  ✨ Enhance Prompt
</button>
        <div className="flex flex-wrap gap-3 mt-4">
        {[
          "Create a football game",
          "Create a racing game",
          "Create a horror maze game",
          "Create a dino runner game",
          "Create an archer game",
        ].map((example) => (
          <button
            key={example}
            onClick={() => setPrompt(example)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600"
          >
            {example}
          </button>
        ))}
      </div>
      
        <button
          onClick={generateGame}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Game"}
        </button>
        <div className="mt-8">
        
  <h2 className="text-2xl font-bold mb-4">
    📚 Recent Games
  </h2>

  <div className="grid md:grid-cols-2 gap-3">
    {history.map((game) => (
      <div
        key={game.id}
        className="bg-slate-800 border border-slate-700 rounded-xl p-4"
      >
        <h3 className="font-semibold truncate">
          {game.prompt}
        </h3>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              setPrompt(game.prompt);
              setGameCode(game.code);
            }}
            className="px-3 py-2 bg-blue-600 rounded-lg"
          >
            Open
          </button>

          <button
            onClick={() => {
              const updated = history.filter(
                (g) => g.id !== game.id
              );

              setHistory(updated);

              localStorage.setItem(
                "gameforge-history",
                JSON.stringify(updated)
              );
            }}
            className="px-3 py-2 bg-red-600 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

        {gameCode && (
          <div className="mt-8">

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-5 py-2 rounded-xl font-semibold ${
                  activeTab === "preview"
                    ? "bg-blue-600"
                    : "bg-slate-700"
                }`}
              >
                🎮 Preview
              </button>

              <button
                onClick={() => setActiveTab("code")}
                className={`px-5 py-2 rounded-xl font-semibold ${
                  activeTab === "code"
                    ? "bg-blue-600"
                    : "bg-slate-700"
                }`}
              >
                📜 Code
              </button>
            </div>

            {/* Preview Tab */}
            {activeTab === "preview" ? (
              <>
                <div className="flex justify-end mb-3">
                  <button
                    onClick={downloadGame}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    ⬇ Download Game
                  </button>
                </div>

                <iframe
                  srcDoc={gameCode}
                  title="Game Preview"
                  className="w-full h-[70vh] rounded-2xl bg-white border border-slate-700 shadow-2xl"
                />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border border-slate-700 rounded-t-2xl">
                  <span className="font-semibold">
                    Generated Game Code
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={downloadGame}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                    >
                      ⬇ Download
                    </button>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(gameCode)
                      }
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      📋 Copy Code
                    </button>
                  </div>
                </div>

                <Editor
                  height="850px"
                  defaultLanguage="html"
                  value={gameCode}
                  theme="vs-dark"
                  options={{
                    minimap: {
                      enabled: false,
                    },
                    readOnly: true,
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
        {showEnhancer && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="w-[900px] max-h-[80vh] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">

      <div className="flex justify-between items-center px-5 py-4 border-b border-slate-700">
        <h2 className="text-2xl font-bold">
          ✨ Enhanced Prompt
        </h2>

        <button
          onClick={() => setShowEnhancer(false)}
          className="text-red-400"
        >
          ✕
        </button>
      </div>

      <div className="p-5 overflow-y-auto max-h-[60vh]">
        <pre className="whitespace-pre-wrap text-slate-200">
          {enhancedPrompt}
        </pre>
      </div>

      <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
        <button
          onClick={() =>
            navigator.clipboard.writeText(enhancedPrompt)
          }
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          📋 Copy
        </button>

        <button
          onClick={() => {
            setPrompt(enhancedPrompt);
            setShowEnhancer(false);
          }}
          className="px-4 py-2 bg-green-600 rounded-lg"
        >
          ✅ Use Prompt
        </button>
      </div>

    </div>
  </div>
)}
    </main>
  );

}