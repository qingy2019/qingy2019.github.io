import {initializeApp} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {getDatabase, ref, set, get, child} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
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


let playAgainButton = document.getElementById('play-again-button');

// Fetch the word from "word.txt"

export function guessLetter() {
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
    } else {
        wrongGuesses++;
        document.getElementById('hangman-image').src = `hangmanStages/hangman${wrongGuesses - 1}.png`;
    }

    let points = Math.max(word.length - Math.floor(3 * wrongGuesses), 0)*10;
    if (!document.getElementById('word-to-guess').textContent.includes('_')) {
        Swal.fire({
            title: "You won!",
            text: `+${points} points`,
            type: "success",
            allowEnterKey: false
        })
        editOne(localStorage["currentUser"], "totalPoints", points, true);
        document.getElementById("leaderboard-frame").style.display = "block";
        localStorage["lastWord"] = "Finished";
    } else if (wrongGuesses === 6) {
        Swal.fire({
            title: "You lost",
            text: `The word was ${word} | -15 points`,
            type: "error",
            allowEnterKey: false
        })
        editOne(localStorage["currentUser"], "totalPoints", -15, true);
        document.getElementById("you-died-text").style.display = "block";
        document.getElementById("leaderboard-frame").style.display = "block";
        localStorage["lastWord"] = "Finished";
    }

    if (!document.getElementById('word-to-guess').textContent.includes('_') || wrongGuesses === 6) {
        document.getElementById('word-to-guess').textContent = word.split('').join(' ');
        document.getElementById('guessing-inputs').style.display = 'none';

        let red = false;
        setInterval(() => {
            document.getElementById('you-died-text').style.color = red ? 'black' : 'red';
            red = !red;
        }, 500);
        if (playAgainButton) {
            playAgainButton.style.display = 'block';
        }
    }
}

async function initialize(wordToDo) {
    word = wordToDo;
    guessedLetters = ['a', 'e', 'i', 'o', 'u'];
    wrongGuesses = 0;
    document.getElementById('hangman-image').src

    document.getElementById('you-died-text').style.display = 'none';
    document.getElementById('guessing-inputs').style.display = 'block';
    if (playAgainButton) playAgainButton.style.display = 'none';
    document.getElementById('hangman-image').src = 'hangmanStages/hangmanStart.png';
    if (localStorage["lastWord"] !== "Finished") {
        alert("You were caught cheating. You lost 20 points.")
        editOne(localStorage["currentUser"], "totalPoints", -15, true);
    } else localStorage["lastWord"] = word;
}

async function getWord() {
    fetch('word.txt')
        .then(response => response.text())
        .then(data => {
            const words = data.split('\n');
            const randomIndex = Math.floor(Math.random() * words.length);
            word = words[randomIndex].trim();
            console.log(word);
            document.getElementById('word-to-guess').textContent = '_ '.repeat(word.length);
            const wordToGuess = document.getElementById('word-to-guess');
            let updatedWord = '';
            for (const char of word) {
                updatedWord += guessedLetters.includes(char) ? `${char} ` : '_ ';
            }
            wordToGuess.textContent = updatedWord;
            localStorage["TESTT"] = word;
        });
}

playAgainButton?.addEventListener("click", function () {
    initialize(getWord());
    document.getElementById("leaderboard-frame").style.display = "none";
});
// document.getElementById("guess-button").addEventListener("click", guessLetter);
document.getElementById("letter-input").addEventListener("keydown", function (e) {
    if (e.key === 'Enter') {
        guessLetter();
    }
});

document.getElementById("guess-letter-button").onclick = guessLetter;

document.getElementById("signed-in-as-text").textContent = "Signed in as: " + localStorage["currentUser"];

document.getElementById("back-to-menu").addEventListener("click", function () {
    window.location.href = "hangman.html";
});
localStorage["TEST"]= "test";
initialize(getWord());