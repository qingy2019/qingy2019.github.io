import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, set,get, child } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAGZZocT50YPmsGvLIg4Yvx9Vj1Vedy_1Y",
    authDomain: "profile-shadow37.firebaseapp.com",
    projectId: "profile-shadow37",
    storageBucket: "profile-shadow37.appspot.com",
    messagingSenderId: "514283251344",
    appId: "1:514283251344:web:3e7afd3c63f1e67fa5da15",
    measurementId: "G-RMVCBHJ3L4",
    databaseURL: "https://profile-shadow37-default-rtdb.firebaseio.com/",
};

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);


function writeUserData(userId, dailyTimeScore, badges, totalPoints, lastDaily) {
    set(ref(database, 'users/' + userId), {
        dailyTimeScore: dailyTimeScore,
        totalPoints: totalPoints,
        lastDaily: lastDaily,
        badges: badges
    });
}

// Element Definitions ------------
const signUpButton = document.getElementById('register-button');
const logInButton = document.getElementById('login-button');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
// Title Screen Elements
const titleScreen = document.getElementById('title-screen');
const leaderboardButton = document.getElementById('show-leaderboard-button');
const dailyChallengeButton = document.getElementById('play-daily-challenge');
const normalGameButton = document.getElementById('play-normal-game');
const logoutButton = document.getElementById('logout-button');
const playChillGameButton = document.getElementById('play-chill-game');
const playRifleGameButton = document.getElementById('play-rifle-game');
const markAsReadButton = document.getElementById('mark-as-read-button');
const messageDiv = document.getElementById('message-div');


const auth = getAuth();

function createUser() {
    let email = emailInput.value;
    let password = passwordInput.value;
    createUserWithEmailAndPassword(auth, email+"@gmail.com", password)
        .then(async (userCredential) => {
            // The user has been created successfully
            const user = userCredential.user;
            console.log("User created: ", user);
            emailInput.style.border = '2px solid green';
            passwordInput.style.border = '2px solid green';
            await new Promise(r => setTimeout(r, 500));
            await writeUserData(email, 0, [0], 0, "2024-01-01");
            localStorage["currentUser"] = email;
            await transitionToTitle()
        })
        .catch((error) => {
            emailInput.style.border = '2px solid red';
            passwordInput.style.border = '2px solid red';
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error creating user: ", errorCode, errorMessage);
        });
}
function logIn() {
    let email = emailInput.value;
    let password = passwordInput.value;
    signInWithEmailAndPassword(auth, email+"@gmail.com", password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log("User signed in: ", user);
            emailInput.style.border = '2px solid green';
            passwordInput.style.border = '2px solid green';
            await new Promise(r => setTimeout(r, 1000));
            localStorage["currentUser"] = email;
            await transitionToTitle()
        })
        .catch((error) => {
            emailInput.style.border = '2px solid red';
            passwordInput.style.border = '2px solid red';
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error creating user: ", errorCode, errorMessage);
        });
}

async function transitionToTitle() {
    document.getElementById('login-register').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
}
export function getScores() {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, 'users')).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}


if (signUpButton) {
    signUpButton.onclick = createUser;
    logInButton.onclick = logIn;
    dailyChallengeButton.onclick = async () => {
        let canGo = true;
        await get(child(ref(database), 'users/' + localStorage["currentUser"])).then((snapshot) => {
            if (snapshot.exists()) {
                let data = snapshot.val().lastDaily;
                if (data !== new Date().toISOString().slice(0, 10)) {
                    canGo = true;
                } else {
                    canGo = false;
                    showToast("You have already played today's daily challenge");
                }
            }
        });
        if (canGo) window.location.href = './dailychallenge.html';
        else showToast("You have already played today's daily challenge");
    }
}
function showToast(message, duration = 3000) {
    // Create a new div element
    const toast = document.createElement('div');

    const toastContainer = document.createElement('div');

    // Set its text content to the message
    toast.textContent = message;

    // Style the toast so it looks like an Android Toast
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.backgroundColor = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px';
    toast.style.borderRadius = '5px';
    toast.style.opacity = '0.9';

    // Add the slide-up animation class to the toast
    toast.classList.add('toast');

    toastContainer.classList.add('centered');
    toastContainer.appendChild(toast);

    // Add the toast to the body of the document
    document.body.appendChild(toastContainer);

    // After 'duration' milliseconds, apply the slide-down animation and then remove the toast
    setTimeout(() => {
        toast.style.animation = 'slide-down 0.5s forwards';
        setTimeout(() => {
            toast.remove();
        }, 500); // This should match the duration of the slide-down animation
    }, duration);
}
leaderboardButton.addEventListener('click', function () {
    window.location.href = './leaderboardframe.html';
});
normalGameButton.addEventListener('click', function () {
    window.location.href = './normalgame.html';
});
playRifleGameButton.addEventListener('click', function () {
    window.location.href = './riflegame.html';
});

logoutButton.addEventListener('click', function () {
    localStorage.removeItem("currentUser");
    window.location.reload();
});
playChillGameButton.addEventListener('click', function () {
    window.location.href = './chillgame.html';
});

markAsReadButton.addEventListener('click', function () {
    messageDiv.style.display = 'none';
    localStorage["messageRead"] = true;
    get(child(ref(database), 'users/' + localStorage["currentUser"])).then((snapshot) => {
        let data = snapshot.val();
        data["messageRead"] = true;
        set(ref(database, 'users/' + localStorage["currentUser"]), data);
    });
});
if (localStorage["messageRead"]) {
    messageDiv.style.display = 'none';
}

if (localStorage["currentUser"]) {
    await transitionToTitle();
}