const audio = new Audio();
audio.preload = "auto";

browser.runtime.onMessage.addListener((message) => {

    if (message.type !== "PLAY_SOUND") return;

    const src = browser.runtime.getURL(message.src);

    audio.pause();
    audio.currentTime = 0;

    audio.src = src;

    audio.play().catch(err => {
        console.log("Audio error:", err);
    });
});