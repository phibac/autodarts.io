// Funktion für Sprachausgabe
function speak(current){
    const msg = new SpeechSynthesisUtterance(current);
    msg.lang = "en-US";

    const voices = speechSynthesis.getVoices();
    if(voices.length > 0){
        msg.voice = voices.find(v => v.lang === "en-US") || voices[0];
    }

    speechSynthesis.speak(msg);
}

// Funktion Anzeige und Wiedergabe von Video
function play_video(src) {
    


    // var video = "/videos/nod.mp4"""
    video.play(src);
}

// Funktion für Wiedergabe der Audiodatei
function play(src) {
    const audio = new Audio(chrome.runtime.getURL(src));
    audio.play();
}

let lastActivePlayer = null;

const getActivePlayerElement = () => {
    console.log(document.querySelector(".ad-ext-player.ad-ext-player-active").innerText);

    var playerInfo = document.querySelector(".ad-ext-player.ad-ext-player-active").innerText;
    console.log(playerInfo.length)

    if(playerInfo[0] == 1 && playerInfo[1] == 8 && playerInfo[2] == 0){
        console.log("Player can finish the game")
        var videoElement = document.createElement("video");
        videoElement.style.width = "320px";
        videoElement.style.height = "180px";
        // document.querySelector(".ad-ext-player.ad-ext-player-active").appendChild(videoElement);
        play_video("/videos/nod.mp4")
    }

    return document.querySelector(".ad-ext-player.ad-ext-player-active");
};

const getActivePlayerName = (activeElement) => {
    if (!activeElement) return null;

    const nameElement = activeElement.querySelector(".ad-ext-player-name");

    if (!nameElement) return null;

    return nameElement.innerText.trim();
};

const observerCallback = () => {
    const activeElement = getActivePlayerElement();
    const current = getActivePlayerName(activeElement);

    if (!current) return;

    // Delay für Sprachausgabe oder Wiedergabe von Audiodatei
    setTimeout(() => {

        if (current !== lastActivePlayer) {
            
            console.log("Aktiver Spieler:", current);

            if(current.toLowerCase() === "stefan"){
                play("/sounds/stefan.wav")
            } else {
                
                speak(current);
                
            }   
            lastActivePlayer = current;
        }
    }  , 1000);
};

const waitForTargetNode = (selector, callback) => {
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
};

waitForTargetNode("#root", (targetNode) => {
    const observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
    console.log("MutationObserver für aktiven Spieler läuft...");
});
