"use client";

import { useState } from "react";

interface ReanalyzeButtonProps {
  replayId: string;
  currentStatus: string;
}

export function ReanalyzeButton({ replayId, currentStatus }: ReanalyzeButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleReanalyze = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`/api/replays/${replayId}/reanalyze`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Analysis failed");
        return;
      }

      setStatus("success");
      setMessage(`Analysis complete: ${data.snapshotCount} snapshots, ${data.keyMomentCount} key moments`);
      // Reload page to show new analysis
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  };

  const isFailed = currentStatus === "failed";
  const isPending = currentStatus === "pending";

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleReanalyze}
        disabled={status === "loading"}
        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
          isFailed || isPending
            ? "bg-yellow-700 hover:bg-yellow-600 text-white"
            : "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {status === "loading"
          ? "Analyzing..."
          : isFailed
            ? "Retry Analysis"
            : isPending
              ? "Run Analysis"
              : "Re-analyze"}
      </button>

      {message && (
        <span
          className={`text-sm ${
            status === "error" ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
