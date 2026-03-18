"use client";

import { useState } from "react";
import { MediaLibrary } from "@/components/media/MediaLibrary";
import { MediaUploadButton } from "@/components/media/MediaUploadButton";

export default function MediaPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Media Library</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Upload images to use in your newsletters, blogs, and as logos.
          </p>
        </div>
        <MediaUploadButton onUploaded={() => setRefreshKey((k) => k + 1)} />
      </div>

      <MediaLibrary key={refreshKey} showUpload={false} />
    </div>
  );
}
