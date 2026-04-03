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

// Funktion für Wiedergabe der Audiodatei
// function play(src, duration) {
//     const audio = new Audio(chrome.runtime.getURL(src));
//     audio.play();

//     // ⏱️ nach 3 Sekunden stoppen
//     setTimeout(() => {
//         audio.pause();
//         audio.currentTime = 0; // optional: zurücksetzen
//     }, duration);
// }

let currentAudio = null; // global

function play(src, duration) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
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

let lastActivePlayer = null;

const getActivePlayerElement = () => {
    // console.log(document.querySelector(".ad-ext-player.ad-ext-player-active").innerText);

    var playerInfo = document.querySelector(".ad-ext-player.ad-ext-player-active").innerText;
    console.log(playerInfo.length)
    
    return document.querySelector(".ad-ext-player.ad-ext-player-active");
};

const getActivePlayerWinner = () => {
    var allPlayerElement = document.getElementById("ad-ext-player-display");
    var allPlayerElements = allPlayerElement.querySelectorAll("div, p");
    for(var i=0; i < allPlayerElements.length; i++){
        if(allPlayerElements[i].className == "winnerAnimation css-re1vv9"){
            play("/sounds/finish.wav", 10000);
        }
        else{
            console.log("No winner at the moment")
        }
    }
    return document.querySelector(".chakra-text .ad-ext-player-score .css-1r7jzhgy");
}

const getActivePlayerScore = (activeElement) => {
    console.log("Player Score", activeElement.querySelector("*"))
    var subNode = activeElement.querySelector("*");
    var playerScore = subNode.querySelector("*");
    var winnerScore = playerScore.querySelector("*")
    return playerScore.innerText;
    // console.log(winnerScore)
    // return winnerScore.innerText;
}

const getActivePlayerName = (activeElement) => {    
    if (!activeElement) return null;

    const nameElement = activeElement.querySelector(".ad-ext-player-name");

    if (!nameElement) return null;

    return nameElement.innerText.trim();
};

const getMissingThrow = () => {
    var activePlayerParent = document.querySelector(".ad-ext-player.ad-ext-player-active");
    console.log("Player Parent Element", activePlayerParent);

    var activePlayerParentChildren = activePlayerParent.children;
    for(var i = 0; i < activePlayerParentChildren.length; i++){
        console.log("Children Element of Active Player Parent Element", activePlayerParentChildren[i], activePlayerParentChildren[i].className)
    }

    var allElements_activePlayerParent = activePlayerParent.querySelectorAll("div, p");
    console.log("All Elements", allElements_activePlayerParent)

    for(let i = 0; i < allElements_activePlayerParent.length; i++){
        console.log("All Elements Content", allElements_activePlayerParent[i].innerText);
    }

 
}

const getPlayerThrows = () =>{
    // Throw Score
    var throwScoreElement = document.getElementById("ad-ext-turn");
    var throwScores = throwScoreElement.querySelectorAll("div, p");

    for(let i = 0; i < throwScores.length; i++){
        console.log("All Score Elements", throwScores[i].innerText);
        if(throwScores[i].innerText == "MISS"){
            setTimeout(() => {
                play("/sounds/miss.mp3", 5000)
            }, 2000);
        }
        if(throwScores[i].innerText == "T20"){
            setTimeout(() => {
                play("/sounds/nice.mp3", 5000)
            }, 2000);
        }
    }
}



const observerCallback = () => {
    const activeElement = getActivePlayerElement();
    const current = getActivePlayerName(activeElement);
    console.log(current);
    const activePlayerScore = getActivePlayerScore(activeElement);
    // console.log(getActiveWinner(activeElement))
    console.log("activePlayerScore:", activePlayerScore);
    getMissingThrow();

    if (!current) return;

    getPlayerThrows();
    getActivePlayerWinner();
    // if (current == lastActivePlayer){
    // if (Number(activePlayerScore) == 0) {
        
    //     setTimeout(() => {
    //         play("/sounds/finish.wav");
    //     }, 3000);
    // }
    // }



    var checkout_impossible = [169, 168, 166, 165, 163, 162, 159];

    if (current !== lastActivePlayer && Number(activePlayerScore) <= 180 && !checkout_impossible.includes(Number(activePlayerScore))) {
        console.log("Player can finish the game")

        var videoContainer = document.createElement("div");
        videoContainer.style.position = "fixed";
        videoContainer.style.top = "0";
        videoContainer.style.left = "0";
        videoContainer.style.width = "100vw";
        videoContainer.style.height = "100vh";
        videoContainer.style.backgroundColor = "rgba(0,0,0,0.8)";
        videoContainer.style.display = "flex";
        videoContainer.style.justifyContent = "center";
        videoContainer.style.alignItems = "center";
        videoContainer.style.zIndex = "999999"; // ganz oben

        var videoElement = document.createElement("video");
        videoElement.setAttribute("width", "320");
        videoElement.setAttribute("height", "160");
        videoElement.autoplay = true;
        videoElement.muted = true; // wichtig für Autoplay!
        videoElement.controls = false;
        videoElement.style.borderRadius = "12px";
        videoElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

        var videoSource = document.createElement("source");
        videoSource.src = browser.runtime.getURL("/videos/nod.mp4")
        videoSource.type = "video/mp4";

        videoElement.appendChild(videoSource);
        videoContainer.appendChild(videoElement);
        // document.body.appendChild(videoContainer);
        document.querySelector("body").appendChild(videoContainer);
        
        play("/sounds/nod.mp3", 10000)

        setTimeout(() => {
            videoElement.remove();
            videoContainer.remove();
        }, 10000);
    }

    // Map der Spieler zu ihren Sound-Dateien
    const playerSounds = {
        tabacso: "/sounds/tabacso_2.wav",
        stefan: "/sounds/stefan.wav",
        martin: "/sounds/martin.wav",
        axel: "/sounds/axel_2.mp3",
        max: "/sounds/max.wav",
        lukas: "/sounds/lukas.wav"
    };

    function handlePlayer(current) {
        const lowerName = current.toLowerCase();

        if (playerSounds[lowerName]) {
            // Wenn ein Sound existiert, abspielen
            play(playerSounds[lowerName], 15000);
        } else {
            // Sonst Namen sprechen
            speak(current);
        }
    }

    // Beispiel mit setTimeout
    setTimeout(() => {
        if (current !== lastActivePlayer) {
            console.log("Aktiver Spieler:", current);
            handlePlayer(current);
            lastActivePlayer = current;
        }
    }, 3000);
    // setTimeout(() => {

    //     if (current !== lastActivePlayer) {
            
    //         console.log("Aktiver Spieler:", current);

    //         if(current.toLowerCase() === "tabacso"){
    //             play("/sounds/tabacso.wav", 5000)
    //         }

    //         if(current.toLowerCase() === "stefan"){
    //             play("/sounds/stefan.wav", 5000)
    //         }
    //         if (current.toLowerCase() === "martin"){
    //             play("/sounds/martin.wav", 5000)
    //         } 
    //         else {
                
    //             speak(current);
    //         }   
    //         lastActivePlayer = current;
    //     }
    // }  , 3000);
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
