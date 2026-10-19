'use strict';

const DRIVE_HOSTS = new Set(['drive.google.com', 'docs.google.com']);

function normalizeUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

function isYouTubeVideoUrl(url) {
  const host = url.hostname.toLowerCase();
  if (host === 'youtu.be') {
    return url.pathname.replace(/^\//, '').split('/').filter(Boolean).length > 0;
  }
  if (!host.endsWith('youtube.com')) return false;
  if (url.pathname.startsWith('/watch')) {
    return Boolean(url.searchParams.get('v'));
  }
  if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
    return url.pathname.split('/').filter(Boolean).length >= 2;
  }
  return false;
}

function isGoogleDriveVideoUrl(url) {
  const host = url.hostname.toLowerCase();
  if (!DRIVE_HOSTS.has(host)) return false;
  if (host === 'drive.google.com') {
    return (
      /\/file\/d\/[^/]+/i.test(url.pathname)
      || url.searchParams.has('id')
    );
  }
  return false;
}

function isAllowedPresentationVideoUrl(raw) {
  const url = normalizeUrl(raw);
  if (!url) return false;
  return isYouTubeVideoUrl(url) || isGoogleDriveVideoUrl(url);
}

function validatePresentationVideoUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) {
    return { ok: false, message: 'Presentation video link is required' };
  }
  const url = normalizeUrl(trimmed);
  if (!url) {
    return { ok: false, message: 'Enter a valid YouTube or Google Drive video URL' };
  }
  if (!isYouTubeVideoUrl(url) && !isGoogleDriveVideoUrl(url)) {
    return {
      ok: false,
      message: 'Link must be a YouTube video or a Google Drive video link (with sharing enabled)',
    };
  }
  return { ok: true, normalized: url.href };
}

module.exports = {
  isAllowedPresentationVideoUrl,
  validatePresentationVideoUrl,
};
