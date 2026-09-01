"use client";

import { useState } from "react";
import { GalleryGrid } from "./gallery-grid";
import { GalleryUpload } from "./gallery-upload";

export function GalleryView() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <GalleryUpload onUploaded={() => setRefreshKey((k) => k + 1)} />
      <GalleryGrid refreshKey={refreshKey} />
    </div>
  );
}
