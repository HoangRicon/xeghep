export interface MediaSize {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  filesize?: number | null;
  filename?: string | null;
}

export interface MediaSizes {
  card?: MediaSize;
  hero?: MediaSize;
  og?: MediaSize;
}

export interface MediaDoc {
  id: number;
  title?: string | null;
  alt: string;
  caption?: string | null;
  description?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: MediaSizes;
  createdAt: string;
  updatedAt: string;
}
