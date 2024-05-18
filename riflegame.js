import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, set,get, child, onValue } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";

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

let gameCode = 29384

let ref2 = ref(database, "riflegames/" + gameCode);

onValue(ref2, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
    if (data && !(data.shooter === localStorage["currentUser"])) {
        bullets.push(data);
    }
})
var scoreCounter = 0;
document.getElementById('score').textContent = 'Score: ' + scoreCounter;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];

// Function to generate particles at a given position
function createParticles(x, y) {
    const numParticles = 30;
    const angleStep = (2 * Math.PI) / numParticles;

    for (let i = 0; i < numParticles; i++) {
        const angle = i * angleStep;
        const speed = Math.random() * 4 + 2;

        const particle = {
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            lifeSpan: 1 // Life span of 1 second
        };


        if (particles.length <= 500) particles.push(particle);

    }
}

const rifleImg = new Image();
rifleImg.onload = function () {
    init();
};
let good = false;
rifleImg.onerror = function () {
    console.error("Failed to load rifle image.");
};
rifleImg.src = 'rifle.png';

let bulletRadius = 15;
let bullets = [];

let bulletsNoHarm = [];
let bulletSpeed = 15;
let gunHeight = 100;
let gunRPM = 100;

let rifle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 100,
    height: 50,
    angle: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    dx: 2,
    dy: 2,
    gravity: 0.2,
    dampening: 1
};

function init() {
    document.addEventListener('mousemove', handleMouseMove);
    draw();
}

// setInterval(() => {
//     if (good) shoot();
// }, 200); // 1000 milliseconds = 1 second
let lastTime = false;
let dragging = false;

canvas.addEventListener('mousedown', function (event) {
    const dx = event.clientX - canvas.getBoundingClientRect().left - rifle.x;
    const dy = event.clientY - canvas.getBoundingClientRect().top - rifle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < rifle.width / 2) {
        dragging = true;
    }
});

canvas.addEventListener('mousemove', function (event) {
    if (dragging) {
        rifle.x = event.clientX - canvas.getBoundingClientRect().left;
        rifle.y = event.clientY - canvas.getBoundingClientRect().top;
    }
});

canvas.addEventListener('mouseup', function (event) {
    dragging = false;
});

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Update particle position
        particle.x += particle.dx;
        particle.y += particle.dy;

        // Decrease particle life span
        particle.lifeSpan -= 0.02; // Decrease by 0.02 each frame to last about 1 second

        // Remove particle if its life span reaches 0
        if (particle.lifeSpan <= 0) {
            particles.splice(i, 1);
            console.log("Removed");
            i--; // Adjust index after removing element
            continue;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
        // Set color based on life span (transition from yellow to red)
        ctx.fillStyle = `hsl(${particle.lifeSpan * 60}, 100%, 50%)`;
        ctx.fill();
    }
}

function updateBall() {
    ball.dy += ball.gravity;
    ball.dy *= ball.dampening; // Dampen vertical velocity
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Handle ball collisions with screen boundaries
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1.05; // Reverse horizontal direction and add a small bounce
    }
    if (ball.y + ball.radius > canvas.height) {
        // Prevent the ball from sinking into the ground
        ball.y = canvas.height - ball.radius;
        ball.dy *= -1.05; // Reverse vertical direction and add a small bounce
        ball.dy *= ball.dampening; // Dampen vertical velocity
    }
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1.05; // Reverse vertical direction and add a small bounce
    }
    let maxSpeed = 10
    ball.dx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.dx));
    ball.dy = Math.max(-maxSpeed, Math.min(maxSpeed, ball.dy));
}


function animateSunShotBullet(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.sunShotBulletRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'orange';
    ctx.fill();

    // Check if bullet hits the ball


    // Check if bullet hits the ball
    const dx2 = bullet.x - ball.x;
    const dy2 = bullet.y - ball.y;
    const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (distance2 < bullet.sunShotBulletRadius + ball.radius && bullet.visible && !bullet.shotByBall) {
        // Bullet hits the ball, adjust ball's velocity accordingly
        const angle = Math.atan2(dy2, dx2);
        ball.dx -= Math.cos(angle) * bulletSpeed * 0.2;
        ball.dy -= Math.sin(angle) * bulletSpeed * 0.4;
        scoreCounter++;
        document.getElementById('score').textContent = 'Score: ' + scoreCounter;
        createParticles(ball.x, ball.y);
        // Make bullet invisible
        bullet.visible = false;
        if (!bullet.shotByBall) {
            bullet.visible = false;
        }
    }

// Update bullet velocity based on the new angle
    bullet.dx = Math.cos(bullet.angle) * bulletSpeed;
    bullet.dy = Math.sin(bullet.angle) * bulletSpeed;
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    bullet.sunShotBulletRadius += 0.4;
}


setInterval(updateBall, 1000 / 60); // 60 frames per second (FPS
function draw() {
    const ball2 = {
        x: ball.x,
        y: ball.y,
        radius: 20,
        dx: ball.dx,
        dy: ball.dy,
        gravity: ball.gravity,
        dampening: ball.dampening
    };
    let good2 = false;
    let bulletX = rifle.x + Math.cos(rifle.angle) * rifle.width / 2;
    let bulletDX = Math.cos(rifle.angle) * bulletSpeed;
    let bulletY = rifle.y + Math.sin(rifle.angle) * rifle.width / 2;
    let bulletDY = Math.sin(rifle.angle) * bulletSpeed;
    let angle = rifle.angle;
    for (let t = 0; t < 100; t++) {
        let bullets2 = structuredClone(bullets);
        for (let i = 0; i < bullets2.length; i++) {
            if (bullets2[i].visible) {

                // Check if bullet hits the ball


                // Check if bullet hits the ball
                const dx2 = bullets2[i].x - ball2.x;
                const dy2 = bullets2[i].y - ball2.y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (distance2 < bulletRadius + ball2.radius && bullets2[i].visible && !bullets2[i].shotByBall) {
                    // Bullet hits the ball, adjust ball's velocity accordingly
                    const angle = Math.atan2(dy2, dx2);
                    ball2.dx -= Math.cos(angle) * bulletSpeed * 0.1;
                    ball2.dy -= Math.sin(angle) * bulletSpeed * 0.1;
                    // Make bullet invisible
                    bullets2[i].visible = false;
                    if (!bullets2[i].shotByBall) {
                        bullets2[i].visible = false;
                    }
                }

                // Move bullet
                bullets2[i].x += Math.cos(bullets2[i].angle) * bulletSpeed;
                bullets2[i].y += Math.sin(bullets2[i].angle) * bulletSpeed;

                // Remove bullet if it goes out of the canvas
                if (
                    bullets2[i].x < 0 ||
                    bullets2[i].x > canvas.width ||
                    bullets2[i].y < 0 ||
                    bullets2[i].y > canvas.height
                ) {
                    bullets2.splice(i, 1);
                    // Adjust index after removing element
                    i--;
                }
            } else {
                bullets2.splice(i, 1);
                // Adjust index after removing element
                i--;
            }
        }
        ball2.dy += ball2.gravity;
        ball2.dy *= ball2.dampening; // Dampen vertical velocity
        ball2.x += ball2.dx;
        ball2.y += ball2.dy;

        // Handle ball collisions with screen boundaries
        if (ball2.x + ball2.radius > canvas.width || ball2.x - ball2.radius < 0) {
            ball2.dx *= -0.96; // Reverse horizontal direction
        }
        if (ball2.y + ball2.radius > canvas.height) {
            // Prevent the ball from sinking into the ground
            ball2.y = canvas.height - ball2.radius;
            ball2.dy *= -0.96; // Reverse vertical direction
            ball2.dy *= ball2.dampening; // Dampen vertical velocity
        }
        if (ball2.y - ball2.radius < 0) {
            ball2.dy *= -0.96; // Reverse vertical direction
        }


        bulletDX = Math.cos(angle) * bulletSpeed;
        bulletDY = Math.sin(angle) * bulletSpeed;
        bulletX += bulletDX;
        bulletY += bulletDY;

        // Check if bullet hits the ball
        const dx2 = bulletX - ball2.x;
        const dy2 = bulletY - ball2.y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (distance2 <= bulletRadius + ball2.radius) {
            good2 = true;
            break
        }
        // bulletsNoHarm.push(bullet);
    }
    good = good2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update rifle angle based on mouse position
    const dx = mouseX - rifle.x;
    const dy = mouseY - rifle.y;
    rifle.angle = Math.atan2(dy, dx);

    let aspectRatio = rifleImg.width / rifleImg.height;
    let desiredHeight = gunHeight; // or whatever height you want
    let calculatedWidth = desiredHeight * aspectRatio;

// Draw rifle
    ctx.save();
    ctx.translate(rifle.x, rifle.y);
    ctx.rotate(rifle.angle);
    ctx.drawImage(rifleImg, -calculatedWidth / 2, -desiredHeight / 2, calculatedWidth, desiredHeight);
    ctx.restore();
    ctx.save();
    ctx.setLineDash([5, 15]); // Set line style to dashed

    if (good) {
        if (weapons[currentWeaponIndex] === 'sunshot.png') {
            ctx.strokeStyle = 'orange';
        } else {
            ctx.strokeStyle = 'green';
        }
        ctx.lineWidth = 10;
        // if (!lastTime) shoot();
    } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

    }
    lastTime = good;
    ctx.beginPath();
    ctx.moveTo(rifle.x, rifle.y); // Start at the rifle's position

    // Calculate the distance between the place where the bullets exit the gun and the ball
    const dx2 = ball.x - (rifle.x + Math.cos(rifle.angle) * rifle.width / 2);
    const dy2 = ball.y - (rifle.y + Math.sin(rifle.angle) * rifle.width / 2);
    const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    // Draw a line in the direction where the bullet will go
    // The end point of the line is calculated using the rifle's angle and half of the distance
    ctx.lineTo(rifle.x + Math.cos(rifle.angle) * distance, rifle.y + Math.sin(rifle.angle) * distance);
    ctx.stroke(); // Draw the line
    ctx.restore();

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();

    // Update ball position


    // Draw bullets
    console.log(bullets.length)
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].visible) {
            if (bullets[i].isSunShot) {
                animateSunShotBullet(bullets[i]);
            } else {
                if (weapons[currentWeaponIndex] === 'osteostriga.png') {
                    // Draw a dark green diamond for the bullet
                    ctx.beginPath();
                    ctx.moveTo(bullets[i].x, bullets[i].y - bulletRadius);
                    ctx.lineTo(bullets[i].x + bulletRadius * 2, bullets[i].y); // Increase distance for right point
                    ctx.lineTo(bullets[i].x, bullets[i].y + bulletRadius);
                    ctx.lineTo(bullets[i].x - bulletRadius * 2, bullets[i].y); // Increase distance for left point
                    ctx.closePath();
                    ctx.fillStyle = 'darkgreen';
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(bullets[i].x, bullets[i].y, bulletRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                }

                // Check if bullet hits the ball


                // Check if bullet hits the ball
                const dx2 = bullets[i].x - ball.x;
                const dy2 = bullets[i].y - ball.y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (distance2 < bulletRadius + ball.radius && bullets[i].visible && !bullets[i].shotByBall) {
                    // Bullet hits the ball, adjust ball's velocity accordingly
                    const angle = Math.atan2(dy2, dx2);
                    ball.dx -= Math.cos(angle) * bulletSpeed * 0.2;
                    ball.dy -= Math.sin(angle) * bulletSpeed * 0.2;
                    scoreCounter++;
                    document.getElementById('score').textContent = 'Score: ' + scoreCounter;

                    createParticles(ball.x, ball.y);
                    // Make bullet invisible
                    bullets[i].visible = false;
                }

// Update bullet velocity based on the new angle
                bullets[i].dx = Math.cos(bullets[i].angle) * bulletSpeed;
                bullets[i].dy = Math.sin(bullets[i].angle) * bulletSpeed;
                bullets[i].x += bullets[i].dx;
                bullets[i].y += bullets[i].dy;
                // Remove bullet if it goes out of the canvas
                if (
                    bullets[i].x < 0 ||
                    bullets[i].x > canvas.width ||
                    bullets[i].y < 0 ||
                    bullets[i].y > canvas.height
                ) {
                    bullets.splice(i, 1);
                    // Adjust index after removing element
                    i--;
                }
            }
        } else {
            bullets.splice(i, 1);
            // Adjust index after removing element
            i--;
        }
    }
    for (let i = 0; i < bulletsNoHarm.length; i++) {
        ctx.beginPath();
        ctx.arc(bulletsNoHarm[i].x, bulletsNoHarm[i].y, bulletRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }
    updateParticles();

}

setInterval(draw, 1000 / 60); // 60 frames per second (FPS)


let recoilDistance = 10; // The distance the gun will move back when a shot is fired
let recoilSpeed = 2; // The speed at which the gun will move back and then forward again

let canShoot = true

function recoil() {
    let recoilBack = setInterval(function () {
        // Move the gun back in the opposite direction it's aiming
        rifle.x -= recoilSpeed * Math.cos(rifle.angle);
        rifle.y -= recoilSpeed * Math.sin(rifle.angle);
        canShoot = false;
        recoilDistance -= recoilSpeed;
        if (recoilDistance <= 0) {
            clearInterval(recoilBack); // Stop moving the gun back
            let recoilForward = setInterval(function () {
                // Move the gun forward in the direction it's aiming
                rifle.x += recoilSpeed * Math.cos(rifle.angle);
                rifle.y += recoilSpeed * Math.sin(rifle.angle);
                recoilDistance += recoilSpeed;
                canShoot = true;
                if (recoilDistance >= 10) {
                    clearInterval(recoilForward); // Stop moving the gun forward
                }
            }, 1000 / 60); // 60 frames per second (FPS)
        }
    }, 1000 / 60); // 60 frames per second (FPS)
}


function shoot() {
    if (!canShoot) return;

    let shootSound = new Audio(weapons[currentWeaponIndex].split('.')[0] + '.wav');
    // Play the shooting sound
    shootSound.play();
    let bullet = {
        x: rifle.x + Math.cos(rifle.angle) * rifle.width / 2,
        y: rifle.y + Math.sin(rifle.angle) * rifle.width / 2,
        angle: rifle.angle,
        visible: true,
        shooter: localStorage["currentUser"]
    };
    // special cases -----

    if (weapons[currentWeaponIndex] === 'sunshot.png') {
        bullet.isSunShot = true;
        bullet.sunShotBulletRadius = 5;
    }

    // -------------------
    bullets.push(bullet);
    // write the bullets array, with the bullet information, to the database (riflegames/gameCode)
    set(ref2, bullet);
}

function handleMouseMove(event) {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
}

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

let keys = {
    'w': false,
    'a': false,
    's': false,
    'd': false,
    ' ': false
};
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    console.log(key);
    if (key in keys) {
        console.log("test");
        keys[key] = true;
        console.log(keys)
    }
    let moveSpeed = 20
    if (keys['w']) {
        console.log("test333");
        rifle.y -= moveSpeed;
    }
    if (keys['s']) {
        rifle.y += moveSpeed;
    }
    if (keys['a']) {
        rifle.x -= moveSpeed;
    }
    if (keys['d']) {
        rifle.x += moveSpeed;
    }
});
let shootIntervalId = null;

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key] = true;
    }
    if (keys[' ']) {
        // Calculate the interval between shots in milliseconds
        const shootInterval = 60000 / gunRPM;
        // Start shooting
        if (shootIntervalId === null) {
            shoot();
            recoil();
            shootIntervalId = setInterval(function () {
                shoot();
                recoil();
            }, shootInterval);
        }
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key] = false;
    }
    if (key === ' ') {
        // Stop shooting
        if (shootIntervalId !== null) {
            clearInterval(shootIntervalId);
            shootIntervalId = null;
        }
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key] = false;
    }

});
let weapons = ['rifle.png', 'machinegun.png', 'ak47.png', 'sunshot.png', 'osteostriga.png', 'aceofspades.png']; // Add the paths to your weapon images here
let currentWeaponIndex = 0;

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'e') {
        // Switch to the next weapon
        currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
        if (weapons[currentWeaponIndex] === 'rifle.png') {
            bulletSpeed = 15;
            gunHeight = 100;
            gunRPM = 180;
            bulletRadius = 15;
            console.log("Bullet Speed: " + bulletSpeed)
        } else if (weapons[currentWeaponIndex] === 'machinegun.png') {
            bulletSpeed = 6;
            gunHeight = 100;
            gunRPM = 2000;
            bulletRadius = 5;
        } else if (weapons[currentWeaponIndex] === 'ak47.png') {
            bulletSpeed = 10;
            gunHeight = 100;
            gunRPM = 600;
            bulletRadius = 8;
        } else if (weapons[currentWeaponIndex] === "sunshot.png") {
            bulletSpeed = 14;
            gunHeight = 100;
            gunRPM = 150;
            bulletRadius = 16;
        } else if (weapons[currentWeaponIndex] === "osteostriga.png") {
            bulletSpeed = 10;
            gunHeight = 100;
            gunRPM = 900;
            bulletRadius = 10;
        } else if (weapons[currentWeaponIndex] === "aceofspades.png") {
            bulletSpeed = 15;
            gunHeight = 100;
            gunRPM = 120;
            bulletRadius = 10;
        }
        bullets = [];
        rifleImg.src = weapons[currentWeaponIndex];
    }
});