/**
 * Google Drive utilities for extracting file IDs and generating download URLs
 */

/**
 * Extract file ID from Google Drive share link
 * Supports formats like:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 */
export function extractFileId(url: string): string {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)\//,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  throw new Error("Invalid Google Drive URL format");
}

/**
 * Generate direct download URL from file ID
 */
export function getDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Generate preview URL from file ID
 */
export function getPreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
