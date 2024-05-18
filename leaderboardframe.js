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



function generateDailyLeaderboard(data) {
    const leaderboard = document.getElementById('daily-leaderboard');
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    leaderboard.innerHTML = '';

    sortedData.forEach((entry, index) => {
        const div = document.createElement('div');

        div.style.borderBottom = '1px solid grey';
        div.style.padding = '5px 10px';
        div.style.fontFamily = 'NovaSquare, Product Sans, sans-serif';
        div.textContent = `${index + 1}. ${entry[0]} - ${entry[1]} points`;

        leaderboard.appendChild(div);
    });
}
function generateLifetimeLeaderboard(data) {
    const leaderboard = document.getElementById('normal-leaderboard');
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    leaderboard.innerHTML = '';

    sortedData.forEach((entry, index) => {
        const div = document.createElement('div');

        div.style.borderBottom = '1px solid grey';
        div.style.padding = '5px 10px';
        div.style.fontFamily = 'NovaSquare, Product Sans, sans-serif';
        div.textContent = `${index + 1}. ${entry[0]} - ${entry[1]} points`;

        leaderboard.appendChild(div);
    });
}
async function loadLeaderboardDaily() {
    let scores = await getScores();
    console.log(scores);

    let data = {};
    for (let scoresKey in scores) {
        data[scoresKey] = scores[scoresKey].dailyTimeScore;
    }
    generateDailyLeaderboard(data);
}
async function loadLeaderboardNormal() {
    let scores = await getScores();
    console.log(scores);

    let data = {};
    for (let scoresKey in scores) {
        data[scoresKey] = scores[scoresKey].totalPoints;
    }
    generateLifetimeLeaderboard(data);
}
function getScores() {
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

await loadLeaderboardDaily();
await loadLeaderboardNormal();

setInterval(async () => {
    await loadLeaderboardDaily();
    await loadLeaderboardNormal();
}, 1000);