export function getClientTrackingData() {
  // Simple Fingerprint: Hash of UserAgent + Screen + Timezone
  const rawFingerprint = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}-${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  
  // Basic hash function
  let fingerprint = 0;
  for (let i = 0; i < rawFingerprint.length; i++) {
    fingerprint = ((fingerprint << 5) - fingerprint) + rawFingerprint.charCodeAt(i);
    fingerprint = fingerprint & fingerprint; // Convert to 32bit integer
  }

  // Session ID: Random UUID stored in sessionStorage for the duration of the tab
  let sessionId = sessionStorage.getItem("app_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("app_session_id", sessionId);
  }

  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    ('standalone' in window.navigator && (window.navigator as any).standalone === true) ||
    document.referrer.includes('android-app://');

  const clientPlatform = isStandalone ? "PWA App" : "Web Browser";

  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    deviceFingerprint: Math.abs(fingerprint).toString(16),
    sessionId,
    referrer: document.referrer || "Direct",
    clientPlatform
  };
}
