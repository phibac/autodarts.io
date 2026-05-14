// Map der Spieler zu ihren Sound-Dateien
const playerSounds = {
    tabacso: "/sounds/tabacso_2.wav",
    stefan: "/sounds/stefan.wav",
    martin: "/sounds/martin.wav",
    axel: "/sounds/axel_2.mp3",
    max: "/sounds/max.wav",
    lukas: "/sounds/lukas.wav"
};

function getState() {
    const root = document.getElementById("root");
    if (!root) return null;

    // Aktiver Player
    const activePlayer = root.querySelector(
        ".ad-ext-player.ad-ext-player-active"
    );

    if (!activePlayer) return null;

    // Aktiver Player Name
    const activePlayerName =
        activePlayer
            ?.querySelector(".ad-ext-player-name")
            ?.textContent
            ?.trim() || null;

    // Punkte bis Sieg
    const activePlayerPointsLeft =
        activePlayer
            ?.querySelector(".ad-ext-player-score")
            ?.textContent
            ?.trim() || null;

    // Aktiver Zug
    const activePlayerTurn = root.querySelector("#ad-ext-turn");

    // Aktuelle Punkte
    const activePlayerCurrentScore =
        activePlayerTurn
            ?.querySelector(".ad-ext-turn-points")
            ?.textContent
            ?.trim() || null;

    // Würfe
    const activePlayerTurnThrows =
        [...activePlayerTurn?.querySelectorAll(".ad-ext-turn-throw") || []]
            .map(el => el.textContent.trim());

    const data = {
        activePlayerName,
        activePlayerPointsLeft,
        activePlayerCurrentScore,
        activePlayerTurnThrows
    };

    console.log("STATE:", data);

    return data;
}

function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";

    const voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
        msg.voice =
            voices.find(v => v.lang === "en-US") || voices[0];
    }

    speechSynthesis.speak(msg);
}

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

function handlePlayer(playerName) {
    const lowerName = playerName.toLowerCase();

    if (playerSounds[lowerName]) {
        play(playerSounds[lowerName], 1);
    } else {
        speak(playerName);
    }
}

let timeout = null;
let lastActivePlayer = null;

const observerCallback = () => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {

        const state = getState();

        if (!state) return;

        const currentPlayer = state.activePlayerName;

        if (!currentPlayer) return;

        // Kein Wechsel
        if (currentPlayer === lastActivePlayer) return;

        console.log("Aktiver Spieler:", currentPlayer);

        handlePlayer(currentPlayer);

        lastActivePlayer = currentPlayer;

    }, 300); // kleines debounce
};

function waitForTargetNode(selector, callback) {

    const node = document.querySelector(selector);

    if (node) {
        callback(node);
        return;
    }

    const tempObserver = new MutationObserver(() => {

        const node = document.querySelector(selector);

        if (node) {
            tempObserver.disconnect();
            callback(node);
        }
    });

    tempObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

waitForTargetNode("#root", (targetNode) => {

    const observer = new MutationObserver(observerCallback);

    observer.observe(targetNode, {
        childList: true,
        subtree: true,
        characterData: true
    });

    console.log("MutationObserver läuft...");
});