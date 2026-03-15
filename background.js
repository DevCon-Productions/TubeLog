chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "VIDEO_WATCHED") {
    const { videoId, title, url, duration } = message.data;

    chrome.storage.local.get({ videos: [] }, (result) => {
      const videos = result.videos;
      const existing = videos.find((v) => v.videoId === videoId);

      if (existing) {
        existing.title = title;
        existing.duration = duration;
        existing.lastWatched = Date.now();
      } else {
        videos.push({
          videoId,
          title,
          url,
          duration,
          lastWatched: Date.now(),
        });
      }

      chrome.storage.local.set({ videos });
    });
  }
});
