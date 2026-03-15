function formatRuntime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

chrome.storage.local.get({ videos: [] }, (result) => {
  const videos = result.videos;
  const totalSeconds = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

  document.getElementById("count").textContent = videos.length;
  document.getElementById("runtime").textContent = formatRuntime(totalSeconds);
});

document.getElementById("viewHistory").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("history.html") });
});

document.getElementById("clearHistory").addEventListener("click", () => {
  if (confirm("Clear all video history?")) {
    chrome.storage.local.set({ videos: [] }, () => {
      document.getElementById("count").textContent = "0";
      document.getElementById("runtime").textContent = "0m";
    });
  }
});
