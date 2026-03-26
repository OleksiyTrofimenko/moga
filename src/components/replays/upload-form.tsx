"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("replay", file);

      const res = await fetch("/api/replays", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      if (data.parseStatus === "failed") {
        setError(`Parse error: ${data.parseError}`);
      } else if (data.analysisError) {
        setError(`Analysis error: ${data.analysisError}`);
      }

      router.refresh();
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragOver
          ? "border-blue-500 bg-blue-500/10"
          : "border-zinc-700 hover:border-zinc-500"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".w3g"
        onChange={handleFileChange}
        className="hidden"
        id="replay-upload"
      />

      {uploading ? (
        <div className="text-zinc-400">
          <div className="animate-pulse text-lg">Uploading & parsing...</div>
        </div>
      ) : (
        <label htmlFor="replay-upload" className="cursor-pointer block">
          <div className="text-zinc-400 mb-2">
            Drop a .w3g replay here or click to browse
          </div>
          <div className="text-sm text-zinc-600">
            Warcraft III replay files only
          </div>
        </label>
      )}

      {error && (
        <div className="mt-4 text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
}
