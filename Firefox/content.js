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

// Neuen Tab mit Video öffnen
// function openNewTab() {
//     window.open("videoDisplay.html", "_blank");
// }

// function play_video(src) {
//     var video = document.querySelector("video");
//     video.load();
//     video.play();
// }

// function play_video(src) {
//     // Container für Video erstellen
//     var videoContainer = document.createElement("div");
//     videoContainer.style.width = "50%";
//     videoContainer.style.position = "fixed";
//     videoContainer.style.top = "300px";
//     videoContainer.style.left = "50%";
//     videoContainer.style.transform = "translateX(-50%)"; // zentriert
//     videoContainer.style.zIndex = "9999"; // sicher über allem
//     videoContainer.style.backgroundColor = "black"; // optional für Sichtbarkeit

//     // Video-Element
//     var videoElement = document.createElement("video");
//     videoElement.width = "200px";
//     videoElement.height = "180px";
//     videoElement.muted = true;      // nötig für Autoplay
//     videoElement.autoplay = true;   // Autoplay einschalten
//     videoElement.playsInline = true;

//     // Source hinzufügen
//     var videoSource = document.createElement("source");
//     videoSource.src = src;
//     videoSource.type = "video/mp4"; // ✅ korrekt

//     videoElement.appendChild(videoSource);
//     videoContainer.appendChild(videoElement);
//     document.body.appendChild(videoContainer); // ✅ richtig einfügen

//     // Video laden und abspielen
//     videoElement.load();
//     videoElement.play().catch(err => console.log("Autoplay blockiert:", err));
// }

// Automatisch beim Laden starten
    // window.addEventListener('load', function() {
    //     play_video("videos/nod.mp4"); // Pfad zum Video prüfen!
    // });


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

    var score = playerInfo[0] + playerInfo[1] + playerInfo[2];
    console.log ("score: ", Number(score))

    if(Number(score) < 180){
        console.log("Player can finish the game")

        var root = document.getElementById(root);
        var video = document.createElement("div");
        video.innerText = "TEST";
        root.appendChild(video);
        // // openNewTab();
        // var videoContainer = document.createElement("div");
        // videoContainer.style.display = "flex";
        // videoContainer.style.justifyContent = "center";
        // videoContainer.style.marginTop = "20px";

        // var videoElement = document.createElement("video");
        // videoElement.setAttribute("width", "320");
        // videoElement.setAttribute("height", "180");
        // videoElement.setAttribute("controls", true);

        // var videoSource = document.createElement("source");
        // videoSource.src = "/videos/nod.mp4";
        // videoSource.type = "video/mp4";

        // videoElement.appendChild(videoSource);
        // videoContainer.appendChild(videoElement);
        // document.body.appendChild(videoContainer);

        // document.querySelector("body").appendChild(videoContainer);
        // play_video("/videos/nod.mp4")
    }

    return document.querySelector(".ad-ext-player.ad-ext-player-active");
};

const getActiveWinner = () => {
    return document.querySelector("#ad-ext-player-display");
}

const getActivePlayerScore = (activeElement) => {
    console.log("Player Score", activeElement.querySelector("*"))
    var subNode = activeElement.querySelector("*");
    var playerScore = subNode.querySelector("*");
    return playerScore.innerText;
}

const getActivePlayerName = (activeElement) => {    
    if (!activeElement) return null;

    const nameElement = activeElement.querySelector(".ad-ext-player-name");

    if (!nameElement) return null;

    return nameElement.innerText.trim();
};



const observerCallback = () => {
    const activeElement = getActivePlayerElement();
    const current = getActivePlayerName(activeElement);
    console.log(current);
    const activePlayerScore = getActivePlayerScore(activeElement);
    console.log(getActiveWinner())
    console.log("activePlayerScore:", activePlayerScore);

    // if (activePlayerScore == "0") {
        
    //     setTimeout(() => {
    //         play("/sounds/finish.wav");
    //     }, 3000);
    // }

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
    }  , 3000);
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
