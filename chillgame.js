import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@8/src/sweetalert2.js'

let word = '';
let guessedLetters = [];
let wrongGuesses = 0;

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
            text: `Congrats, the word was ${word}`,
            type: "success",
            allowEnterKey: false
        })
    } else if (wrongGuesses === 6) {
        Swal.fire({
            title: "You lost",
            text: `The word was ${word}`,
            type: "error",
            allowEnterKey: false
        })
        document.getElementById("you-died-text").style.display = "block";
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

function initialize(wordToDo) {
    word = wordToDo;
    guessedLetters = ['a','e','i','o','u'];
    wrongGuesses = 0;
    document.getElementById('hangman-image').src

    document.getElementById('you-died-text').style.display = 'none';
    document.getElementById('guessing-inputs').style.display = 'block';
    if (playAgainButton) playAgainButton.style.display = 'none';
    document.getElementById('hangman-image').src = 'hangmanStages/hangmanStart.png';
}

async function getWord() {
    fetch('word.txt')
        .then(response => response.text())
        .then(data => {
            const words = data.split('\n');
            const randomIndex = Math.floor(Math.random() * words.length);
            word = words[randomIndex].trim();
            document.getElementById('word-to-guess').textContent = '_ '.repeat(word.length);
            const wordToGuess = document.getElementById('word-to-guess');
            let updatedWord = '';
            for (const char of word) {
                updatedWord += guessedLetters.includes(char) ? `${char} ` : '_ ';
            }
            wordToGuess.textContent = updatedWord;
        });
}

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

playAgainButton.addEventListener('click', () => {
    initialize(getWord());
});

initialize(getWord());