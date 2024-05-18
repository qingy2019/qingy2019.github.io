import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set,get,child } from "firebase/database";

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


function writeUserData(userId, name, email, score) {
    set(ref(database, 'users/' + userId), {
        username: name,
        email: email,
        score: score
    });
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Initialize Firebase

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
            await new Promise(r => setTimeout(r, 1000));
            transitionToGame()
        })
        .catch((error) => {
            // There was an error creating the user
            // Highlight the input fields in red
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
            // The user has been created successfully
            const user = userCredential.user;
            console.log("User signed in: ", user);
            emailInput.style.border = '2px solid green';
            passwordInput.style.border = '2px solid green';
            await new Promise(r => setTimeout(r, 1000));
            transitionToGame()
        })
        .catch((error) => {
            // There was an error creating the user
            // Highlight the input fields in red
            emailInput.style.border = '2px solid red';
            passwordInput.style.border = '2px solid red';
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error creating user: ", errorCode, errorMessage);
        });
}

function transitionToGame() {
    document.getElementById('login-register').style.display = 'none';
    document.getElementById('hangman-game').style.display = 'block';
    writeUserData("1", "test", emailInput.value, 0);
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


class Data {
    constructor(badges, score) {
        this.badges = badges;
        this.score = score;
    }

}

let word = "test";
async function getAndUpdateDailyChallenge() {
    console.log("START")
    const today = new Date().toISOString().slice(0, 10);
    const dbRef = ref(getDatabase());
    return await get(child(dbRef, 'dailyChallenge')).then(async (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            if (!data || data.date !== today) {
                // If the daily challenge word doesn't exist or it was last updated on a different date, generate a new challenge word
                // const challengeWord = generateChallengeWord();
                console.log("generated")
                console.log("RETURNED")
                await set(ref(database, 'dailyChallenge'), {
                    word: word,
                    date: today
                })
            } else {
                get(child(dbRef, 'dailyChallenge')).then((snapshot) => {
                    if (snapshot.exists()) {
                        console.log(snapshot.val().word);
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        } else {
            console.log("generated")
            console.log("RETURNED")
            await set(ref(database, 'dailyChallenge'), {
                word: word,
                date: today
            }).then(() => {
                console.log("SUCCESS")
            }).catch((error) => {
                console.error(error);
            });
        }
    }).catch((error) => {
        console.error(error);
    });
}

async function wait() {
    await new Promise(r => setTimeout(r, 1000));
}

console.log("HERE 1")
await wait();
console.log("HERE")

await getAndUpdateDailyChallenge()
