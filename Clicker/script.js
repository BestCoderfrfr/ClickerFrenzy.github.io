import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update,
    push,
    onChildAdded
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD33M3fFUa1fTwnuSQRb902zdpk2no0HvA",
  authDomain: "catch-the-clicker.firebaseapp.com",
  databaseURL: "https://catch-the-clicker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "catch-the-clicker",
  storageBucket: "catch-the-clicker.firebasestorage.app",
  messagingSenderId: "553275613302",
  appId: "1:553275613302:web:d61697cab8e0767678ff57"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const authMessage = document.getElementById("authMessage");

const authScreen = document.getElementById("authScreen");
const gameUI = document.getElementById("gameUI");

const ball = document.getElementById("ball");
const gameBox = document.getElementById("gameBox");
const clicksDisplay = document.getElementById("clicks");
const multiplierDisplay = document.getElementById("multiplier");

const messagesDiv = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

let clicks = 0;
let multiplier = 1;
let currentUser = null;
let username = "";

// Convert username into hidden email
function usernameToEmail(name) {
    return name + "@clickerfrenzy.com";
}

// SIGN UP
signupBtn.onclick = async () => {
    try {
        const email = usernameToEmail(usernameInput.value);

        const userCred = await createUserWithEmailAndPassword(
            auth,
            email,
            passwordInput.value
        );

        await set(ref(db, "users/" + userCred.user.uid), {
            username: usernameInput.value,
            clicks: 0,
            multiplier: 1
        });

        // Immediately log in and load game
        loadGame(userCred.user);

    } catch (err) {
        authMessage.textContent = err.message;
    }
};

// LOGIN
loginBtn.onclick = async () => {
    try {
        const email = usernameToEmail(usernameInput.value);

        const userCred = await signInWithEmailAndPassword(
            auth,
            email,
            passwordInput.value
        );

        loadGame(userCred.user);

    } catch (err) {
        authMessage.textContent = err.message;
    }
};

// LOAD GAME
async function loadGame(user) {
    currentUser = user;
    authScreen.style.display = "none";
    gameUI.style.display = "block";

    const snapshot = await get(ref(db, "users/" + user.uid));
    const data = snapshot.val();

    clicks = data.clicks;
    multiplier = data.multiplier;
    username = data.username;

    updateUI();
    centerBall();
    loadChat();
}

function updateUI() {
    clicksDisplay.textContent = clicks;
    multiplierDisplay.textContent = multiplier;
}

function centerBall() {
    ball.style.left = "225px";
    ball.style.top = "175px";
}

ball.addEventListener("click", async () => {
    clicks += multiplier;
    if (clicks % 50 === 0) multiplier++;

    updateUI();

    await update(ref(db, "users/" + currentUser.uid), {
        clicks,
        multiplier
    });

    const randomX = Math.random() * (gameBox.clientWidth - ball.offsetWidth);
    const randomY = Math.random() * (gameBox.clientHeight - ball.offsetHeight);

    ball.style.left = randomX + "px";
    ball.style.top = randomY + "px";
});

// CHAT
function loadChat() {
    onChildAdded(ref(db, "chat"), (data) => {
        const msg = data.val();
        const div = document.createElement("div");
        div.textContent = msg.username + ": " + msg.text;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

sendBtn.onclick = sendMessage;

function sendMessage() {
    if (chatInput.value.trim() === "") return;

    push(ref(db, "chat"), {
        username: username,
        text: chatInput.value
    });

    chatInput.value = "";
}
