let lastVideoId = null;
let currentUrl = location.href;

function getVideoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("v");
}

function getVideoDuration() {
  const el = document.querySelector("video");
  if (el && el.duration && isFinite(el.duration)) {
    return Math.round(el.duration);
  }
  return 0;
}

function getVideoTitle() {
  const titleEl =
    document.querySelector(
      "yt-formatted-string.style-scope.ytd-watch-metadata"
    ) ||
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
    document.querySelector("h1.title yt-formatted-string");
  if (titleEl) return titleEl.textContent.trim();

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) return ogTitle.content;

  return document.title.replace(" - YouTube", "").trim();
}

function reportVideo() {
  const videoId = getVideoId();
  if (!videoId || videoId === lastVideoId) return;
  lastVideoId = videoId;

  // Wait for the page to fully load title and duration
  setTimeout(() => {
    const title = getVideoTitle();
    const duration = getVideoDuration();
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    chrome.runtime.sendMessage({
      type: "VIDEO_WATCHED",
      data: { videoId, title, url, duration },
    });

    // Retry once after a few seconds to capture duration if it wasn't ready
    setTimeout(() => {
      const updatedDuration = getVideoDuration();
      if (updatedDuration > 0) {
        chrome.runtime.sendMessage({
          type: "VIDEO_WATCHED",
          data: {
            videoId,
            title: getVideoTitle(),
            url,
            duration: updatedDuration,
          },
        });
      }
    }, 5000);
  }, 2000);
}

// Poll for URL changes — catches SPA navigation reliably
setInterval(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    reportVideo();
  }
}, 1000);

// Also watch for YouTube's SPA navigation via DOM changes
const observer = new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    reportVideo();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial report
reportVideo();
