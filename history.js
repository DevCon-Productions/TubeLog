function formatDuration(seconds) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatRuntime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

chrome.storage.local.get({ videos: [] }, (result) => {
  const videos = result.videos;
  const totalSeconds = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

  document.getElementById("totalVideos").textContent = videos.length;
  document.getElementById("totalRuntime").textContent = formatRuntime(totalSeconds);

  const list = document.getElementById("videoList");

  if (videos.length === 0) {
    list.innerHTML = '<div class="empty-state">No videos tracked yet. Go watch some YouTube!</div>';
    return;
  }

  // Show most recent first
  const sorted = [...videos].reverse();

  sorted.forEach((video, i) => {
    const num = videos.length - i;
    const item = document.createElement("div");
    item.className = "video-item";
    item.innerHTML = `
      <div class="video-number">${num}</div>
      <div class="video-info">
        <a class="video-title" href="${video.url}" target="_blank">${escapeHtml(video.title)}</a>
        <div class="video-meta">${formatDate(video.lastWatched)}</div>
      </div>
      <div class="video-duration">${formatDuration(video.duration)}</div>
    `;
    list.appendChild(item);
  });
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
