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