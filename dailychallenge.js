import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, set,get, child } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";

import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@8/src/sweetalert2.js'
let word = '';
let guessedLetters = [];
let wrongGuesses = 0;

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

const dailyChallengeStartButton = document.getElementById('start-button');
const dailyChallengeRealGuess = document.getElementById('real-guess');

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


let interval = 0;
let time = 0.0;


function writeUserData(userId, dailyTimeScore, badges, totalPoints, lastDaily) {
    set(ref(database, 'users/' + userId), {
        dailyTimeScore: dailyTimeScore,
        totalPoints: totalPoints,
        lastDaily: lastDaily,
        badges: badges
    });
}
function editOne(userId, key, value, add = false) {
    get(child(ref(database), 'users/' + userId)).then((snapshot) => {
        if (snapshot.exists()) {
            let data = snapshot.val();
            if (add) data[key] += value;
            else data[key] = value;
            set(ref(database, 'users/' + userId), data);
        }
    });
}


async function getAndUpdateDailyChallenge() {
    console.log("START")
    const today = new Date().toISOString().slice(0, 10);
    const dbRef = ref(getDatabase());
    await get(child(dbRef, 'dailyChallenge')).then(async (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            if (!data || data.date !== today) {
                await getWord()
                await set(ref(database, 'dailyChallenge'), {
                    word: word,
                    date: today
                })
            } else {
                await get(child(dbRef, 'dailyChallenge')).then((snapshot) => {
                    console.log("inside")

                    console.log(snapshot.val())
                    if (snapshot.exists()) word = snapshot.val().word;
                    console.log(word);
                }).catch((error) => {
                    console.error(error);
                });
            }
        } else {
            await getWord()
            await set(ref(database, 'dailyChallenge'), {
                word: word,
                date: today
            })
        }
    })
}



async function guessLetter() {
    const letterInput = document.getElementById('letter-input');
    const letter = letterInput.value.toLowerCase();
    letterInput.value = '';

    if (guessedLetters.includes(letter) || letter === '') {
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        const wordToGuess = document.getElementById('word-to-guess');
        let updatedWord = '';
        for (const char of word) {
            updatedWord += guessedLetters.includes(char) ? `${char} ` : '_ ';
        }
        wordToGuess.textContent = updatedWord;
    } else time += 10;

    if (!document.getElementById('word-to-guess').textContent.includes('_')) {
        Swal.fire({
            title: "Daily Challenge Complete!",
            text: `You won! +${Math.round(Math.max(1000 - time.toFixed(1), 50))} points`,
            type: "success",
            allowEnterKey: false
        })
        clearInterval(interval);
        editOne(localStorage["currentUser"], "dailyTimeScore", Math.round(Math.max(1000 - time.toFixed(1), 50)), true);
        document.getElementById("leaderboard-frame").style.display = "block";
    }

    if (!document.getElementById('word-to-guess').textContent.includes('_')) {
        document.getElementById('word-to-guess').textContent = word.split('').join(' ');
        document.getElementById('guessing-inputs').style.display = 'none';
    }
}
function initialize() {
    guessedLetters = [];
    document.getElementById('you-died-text').style.display = 'none';
    document.getElementById('guessing-inputs').style.display = 'block';
    document.getElementById('word-to-guess').textContent = '_ '.repeat(word.length);
}

async function getWord() {
    await fetch('word.txt')
        .then(response => response.text())
        .then(data => {
            const words = data.split('\n');
            const randomIndex = Math.floor(Math.random() * words.length);
            word = words[randomIndex].trim();
        });
}


dailyChallengeStartButton.addEventListener("click", async function () {
    let canGo = true;
    await get(child(ref(database), 'users/' + localStorage["currentUser"])).then((snapshot) => {
        if (snapshot.exists()) {
            let data = snapshot.val().lastDaily;
            if (data !== new Date().toISOString().slice(0, 10)) {
                canGo = true;
            } else {
                canGo = false;
                window.location.href = "hangman.html";
            }
        }
    });
    time = 0.0;

    await getAndUpdateDailyChallenge().then(async (d) => {
        initialize();
        document.getElementById('word-to-guess').textContent = '_ '.repeat(word.length);
        console.log(word)

        editOne(localStorage["currentUser"], "lastDaily", new Date().toISOString().slice(0, 10));
        dailyChallengeRealGuess.style.display = 'block';
        dailyChallengeStartButton.style.display = 'none';
        interval = setInterval(() => {
            time += 0.1;
            document.getElementById('timer').textContent = `${time.toFixed(1)}s`;
        }, 100);
    });
});

document.getElementById("letter-input").addEventListener("keydown", function(e) {
    if (e.key === 'Enter') {
        guessLetter();
    }
});

document.getElementById("guess-letter-button").onclick = guessLetter;

document.getElementById("signed-in-as-text").textContent = `Signed in as ${localStorage["currentUser"]}`
