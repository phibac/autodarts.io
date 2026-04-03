// -------------------- Audio & Sprachausgabe --------------------
let currentAudio = null;

function play(src, duration) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(chrome.runtime.getURL(src));
    currentAudio.play().catch(err => console.log("Audio play error:", err));

    setTimeout(() => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }, duration);
}

function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        msg.voice = voices.find(v => v.lang === "en-US") || voices[0];
    }

    speechSynthesis.speak(msg);
}

// -------------------- Spieler Audio Mapping --------------------
const playerSounds = {
    tabacso: "/sounds/tabacso_2.wav",
    stefan: "/sounds/stefan.wav",
    martin: "/sounds/martin.wav",
    axel: "/sounds/axel_2.mp3",
    max: "/sounds/max.wav"
};

function handlePlayer(current) {
    const lowerName = current.toLowerCase();
    if (playerSounds[lowerName]) {
        play(playerSounds[lowerName], 5000);
    } else {
        speak(current);
    }
}

// -------------------- Aktiver Spieler --------------------
let lastActivePlayer = null;

function getActivePlayerElement() {
    return document.querySelector(".ad-ext-player.ad-ext-player-active");
}

function getActivePlayerName(activeElement) {
    if (!activeElement) return null;
    const nameElement = activeElement.querySelector(".ad-ext-player-name");
    return nameElement ? nameElement.innerText.trim() : null;
}

function getActivePlayerScore(activeElement) {
    if (!activeElement) return 0;
    const scoreElement = activeElement.querySelector(".ad-ext-player-score");
    return scoreElement ? Number(scoreElement.innerText.trim()) : 0;
}

// -------------------- Fehlwürfe prüfen --------------------
function getMissingThrow() {
    const activePlayerParent = getActivePlayerElement();
    if (!activePlayerParent) return;

    const children = Array.from(activePlayerParent.children);
    console.log("Direkte Kinder:", children);

    const allDivP = Array.from(activePlayerParent.querySelectorAll("div, p"));
    allDivP.forEach(el => console.log("Child content:", el.innerText.trim()));
}

// -------------------- Spielerwürfe prüfen --------------------
function getPlayerThrows() {
    const throwScoreElement = document.getElementById("ad-ext-turn");
    if (!throwScoreElement) return;

    const throwScores = Array.from(throwScoreElement.querySelectorAll("div, p"));
    throwScores.forEach(el => {
        console.log("Score Element:", el.innerText);
        if (el.innerText === "MISS") {
            setTimeout(() => play("/sounds/peinlich.wav", 5000), 2000);
        }
    });
}

// -------------------- Gewinner prüfen --------------------
function getActivePlayerWinner() {
    const allPlayerElement = document.getElementById("ad-ext-player-display");
    if (!allPlayerElement) return;

    const allPlayerElements = allPlayerElement.querySelectorAll("div, p");
    allPlayerElements.forEach(el => {
        if (el.className === "winnerAnimation css-re1vv9") {
            play("/sounds/finish.wav", 10000);
        }
    });
}

// -------------------- Video Overlay --------------------
function showVideoOverlay(src, duration = 10000) {
    if (document.getElementById("videoOverlay")) return;

    const videoContainer = document.createElement("div");
    videoContainer.id = "videoOverlay";
    Object.assign(videoContainer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "999999"
    });

    const videoElement = document.createElement("video");
    videoElement.width = 320;
    videoElement.height = 160;
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.controls = false;
    videoElement.style.borderRadius = "12px";
    videoElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

    const videoSource = document.createElement("source");
    videoSource.src = chrome.runtime.getURL(src);
    videoSource.type = "video/mp4";

    videoElement.appendChild(videoSource);
    videoContainer.appendChild(videoElement);
    document.body.appendChild(videoContainer);

    play("/sounds/nod.mp3", duration);

    setTimeout(() => {
        videoElement.remove();
        videoContainer.remove();
    }, duration);
}

// -------------------- Observer Callback --------------------
function observerCallback() {
    const activeElement = getActivePlayerElement();
    if (!activeElement) return;

    const current = getActivePlayerName(activeElement);
    if (!current) return;

    const activePlayerScore = getActivePlayerScore(activeElement);
    console.log("Aktiver Spieler:", current, "Score:", activePlayerScore);

    getMissingThrow();
    getPlayerThrows();
    getActivePlayerWinner();

    const checkoutImpossible = [169, 168, 166, 165, 163, 162, 159];

    if (current !== lastActivePlayer && activePlayerScore <= 180 && !checkoutImpossible.includes(activePlayerScore)) {
        showVideoOverlay("/videos/nod.mp4");
    }

    setTimeout(() => {
        if (current !== lastActivePlayer) {
            handlePlayer(current);
            lastActivePlayer = current;
        }
    }, 3000);
}

// -------------------- Observer starten --------------------
function waitForTargetNode(selector, callback) {
    const node = document.querySelector(selector);
    if (node) {
        callback(node);
    } else {
        const tempObserver = new MutationObserver(() => {
            const node = document.querySelector(selector);
            if (node) {
                tempObserver.disconnect();
                callback(node);
            }
        });
        tempObserver.observe(document.body, { childList: true, subtree: true });
    }
}

waitForTargetNode("#root", (targetNode) => {
    const observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
    console.log("MutationObserver für aktiven Spieler läuft...");
});