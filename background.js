console.log("Hotstar Adblocker extension loaded (Timer-Based Mute)");

const defaultAdDuration = 25 * 1000; // 25 seconds (adjust as needed)
let mutedTabIds = new Set();

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const adName = url.searchParams.get("adName");

    if (adName) {
      console.log(`Ad detected: ${adName}`);

      const tabs = await chrome.tabs.query({ url: "*://*.hotstar.com/*" });

      for (const tab of tabs) {
        if (!tab.mutedInfo.muted) {
          chrome.tabs.update(tab.id, { muted: true });
          mutedTabIds.add(tab.id);
          console.log(`Muted tab ${tab.id}`);

          // Set a timer to unmute after a default duration
          setTimeout(() => {
            chrome.tabs.get(tab.id, (updatedTab) => {
              if (updatedTab && updatedTab.mutedInfo.muted && mutedTabIds.has(tab.id)) {
                chrome.tabs.update(tab.id, { muted: false });
                mutedTabIds.delete(tab.id);
                console.log(`Unmuted tab ${tab.id} (timer expired)`);
              }
            });
          }, defaultAdDuration);
        }
      }
    }
  },
  {
    urls: ["*://bifrost-api.hotstar.com/v1/events/track/ct_impression*"]
  }
);