const STARTED_KEY = "imready_foundation_intro_started";
const WATCHED_KEY = "imready_foundation_intro_watched";

function readFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function hasFoundationIntroStarted(): boolean {
  return readFlag(STARTED_KEY);
}

export function hasFoundationIntroWatched(): boolean {
  return readFlag(WATCHED_KEY);
}

export function markFoundationIntroStarted() {
  writeFlag(STARTED_KEY, true);
}

export function markFoundationIntroWatched() {
  writeFlag(STARTED_KEY, true);
  writeFlag(WATCHED_KEY, true);
}

export function clearFoundationIntroProgress() {
  writeFlag(STARTED_KEY, false);
  writeFlag(WATCHED_KEY, false);
}
