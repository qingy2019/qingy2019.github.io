import {Swal} from 'sweetalert2';
let word = '';
let guessedLetters = [];
let wrongGuesses = 0;

Swal.fire({
    title: "Good job!",
    text: "You clicked the button!",
    icon: "success"
});