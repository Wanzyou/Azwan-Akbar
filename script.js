// SINGLE-PAGE PANEL NAVIGATION

const panels = Array.from(document.querySelectorAll(".panel"));
const navLinks = document.querySelectorAll(".nav-menu a");

let currentIndex = panels.findIndex(p => p.classList.contains("active"));
if(currentIndex === -1) currentIndex = 0;

const reduceMotionNav = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TRANSITION_MS = reduceMotionNav ? 0 : 850;

function setActiveLink(id){

    navLinks.forEach(link => {

        link.classList.remove("active-link");

        if(link.getAttribute("href") === `#${id}`){

            link.classList.add("active-link");

        }

    });

}

function goToPanel(targetIndex){

    if(targetIndex === currentIndex || targetIndex < 0 || targetIndex >= panels.length) return;

    const oldPanel = panels[currentIndex];
    const newPanel = panels[targetIndex];
    const goingForward = targetIndex > currentIndex;

    newPanel.classList.remove("enter-from-right","enter-from-left","exit-to-left","exit-to-right");
    newPanel.classList.add(goingForward ? "enter-from-right" : "enter-from-left");

    // force layout so the browser registers the starting position before animating
    // eslint-disable-next-line no-unused-expressions
    newPanel.offsetHeight;

    requestAnimationFrame(() => {

        oldPanel.classList.remove("active");
        oldPanel.classList.add(goingForward ? "exit-to-left" : "exit-to-right");

        newPanel.classList.remove("enter-from-right","enter-from-left");
        newPanel.classList.add("active");

    });

    setTimeout(() => {

        oldPanel.classList.remove("exit-to-left","exit-to-right");

    }, TRANSITION_MS);

    currentIndex = targetIndex;

    setActiveLink(newPanel.id);

}

navLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        const targetId = link.getAttribute("href").replace("#","");
        const targetIndex = panels.findIndex(p => p.id === targetId);

        goToPanel(targetIndex);

    });

});

// CURSOR EFFECT

const cursor = document.querySelector(".cursor-light");

document.addEventListener("mousemove", (e) => {

    cursor.style.left = e.clientX + "px";

    cursor.style.top = e.clientY + "px";

});

// HEADER (always solid — no scroll to react to anymore)

const header = document.getElementById("header");

if(header) header.style.background = "rgba(2,6,23,0.92)";

// LANGUAGE

const idBtn = document.getElementById("id-btn");

const enBtn = document.getElementById("en-btn");

const texts = document.querySelectorAll(".text, .nav-text");

idBtn.addEventListener("click", () => {

    texts.forEach(text => {

        text.innerHTML = text.getAttribute("data-id");

    });

    idBtn.classList.add("active-lang");

    enBtn.classList.remove("active-lang");

});

enBtn.addEventListener("click", () => {

    texts.forEach(text => {

        text.innerHTML = text.getAttribute("data-en");

    });

    enBtn.classList.add("active-lang");

    idBtn.classList.remove("active-lang");

});

// 3D PROFILE EFFECT

const profile3d = document.querySelector(".profile-3d-wrap");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if(window.innerWidth > 768 && !reduceMotion){

    document.addEventListener("mousemove", (e) => {

        let x = (window.innerWidth / 2 - e.pageX) / 35;
        let y = (window.innerHeight / 2 - e.pageY) / 35;

        profile3d.style.transform =
        `rotateY(${-x}deg) rotateX(${y}deg)`;

    });

}else if(profile3d){

    profile3d.style.transform = "none";

}

// 3D TILT CARDS (experience, skills, certificate, contact)

const tiltCards = document.querySelectorAll("[data-tilt]");

if(window.innerWidth > 768 && !reduceMotion){

    tiltCards.forEach(card => {

        card.addEventListener("mousemove", (e) => {

            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 10;
            const rotateX = ((centerY - y) / centerY) * 10;

            card.style.transform =
            `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0)";

        });

    });

}

// AMBIENT BACKGROUND PARALLAX (mouse-driven, since there's no scroll anymore)

const orbOne = document.querySelector(".orb-one");
const orbTwo = document.querySelector(".orb-two");
const orbThree = document.querySelector(".orb-three");
const networkGraph = document.querySelector(".network-graph");

if(!reduceMotion){

    document.addEventListener("mousemove", (e) => {

        const nx = (e.clientX / window.innerWidth) - 0.5;
        const ny = (e.clientY / window.innerHeight) - 0.5;

        if(orbOne) orbOne.style.transform = `translate(${nx * 40}px, ${ny * 40}px)`;
        if(orbTwo) orbTwo.style.transform = `translate(${nx * -35}px, ${ny * -35}px)`;
        if(orbThree) orbThree.style.transform = `translate(${nx * 25}px, ${ny * 25}px)`;
        if(networkGraph) networkGraph.style.transform = `translate(${nx * 15}px, ${ny * 15}px)`;

    });

}