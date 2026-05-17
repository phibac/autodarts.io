chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "change") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Playername geändert",
      message: msg.text
    });
  }
});

browser.runtime.onInstalled.addListener(async () => {

    const tabs = await browser.tabs.query({});

    const exists = tabs.some(t => t.url?.includes("player.html"));

    if (!exists) {

        browser.tabs.create({
            url: browser.runtime.getURL("player.html"),
            active: false
        });

    }
});