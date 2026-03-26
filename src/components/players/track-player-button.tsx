"use client";

import { useState } from "react";

export function TrackPlayerButton({
  playerName,
  isTracked: initialTracked,
}: {
  playerName: string;
  isTracked: boolean;
}) {
  const [tracked, setTracked] = useState(initialTracked);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      if (tracked) {
        await fetch(`/api/players?name=${encodeURIComponent(playerName)}`, {
          method: "DELETE",
        });
        setTracked(false);
      } else {
        await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: playerName }),
        });
        setTracked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded transition-colors ${
        tracked
          ? "bg-green-800/50 text-green-300 hover:bg-red-800/50 hover:text-red-300"
          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
      } disabled:opacity-50`}
      title={tracked ? "Untrack player" : "Track player"}
    >
      {loading ? "..." : tracked ? "Tracked" : "Track"}
    </button>
  );
}
