const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

function normalizeUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function isYouTubeVideoUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    return url.pathname.replace(/^\//, "").split("/").filter(Boolean).length > 0;
  }
  if (!host.endsWith("youtube.com")) return false;
  if (url.pathname.startsWith("/watch")) {
    return Boolean(url.searchParams.get("v"));
  }
  if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
    return url.pathname.split("/").filter(Boolean).length >= 2;
  }
  return false;
}

function isGoogleDriveVideoUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (!DRIVE_HOSTS.has(host)) return false;
  if (host === "drive.google.com") {
    return /\/file\/d\/[^/]+/i.test(url.pathname) || url.searchParams.has("id");
  }
  return false;
}

export function isAllowedPresentationVideoUrl(raw: string): boolean {
  const url = normalizeUrl(raw);
  if (!url) return false;
  return isYouTubeVideoUrl(url) || isGoogleDriveVideoUrl(url);
}

export function validatePresentationVideoUrl(raw: string): { ok: true } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Paste a YouTube or Google Drive video link to continue." };
  }
  const url = normalizeUrl(trimmed);
  if (!url) {
    return { ok: false, message: "Enter a valid YouTube or Google Drive video URL." };
  }
  if (!isYouTubeVideoUrl(url) && !isGoogleDriveVideoUrl(url)) {
    return {
      ok: false,
      message:
        "Use a YouTube watch/shorts link or a Google Drive file link where your presentation video is stored.",
    };
  }
  return { ok: true };
}
