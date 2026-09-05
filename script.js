// ACTIVE MENU

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-menu a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 200;

        if(scrollY >= sectionTop){

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active-link");

        if(link.getAttribute("href") === `#${current}`){

            link.classList.add("active-link");

        }

    });

});

// CURSOR EFFECT

const cursor = document.querySelector(".cursor-light");

document.addEventListener("mousemove", (e) => {

    cursor.style.left = e.clientX + "px";

    cursor.style.top = e.clientY + "px";

});

// HEADER EFFECT

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if(window.scrollY > 50){

        header.style.background = "rgba(2,6,23,0.92)";

    }else{

        header.style.background = "rgba(2,6,23,0.65)";

    }

});

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

// PARALLAX BACKGROUND ORBS

const orbOne = document.querySelector(".orb-one");
const orbTwo = document.querySelector(".orb-two");
const orbThree = document.querySelector(".orb-three");
const networkGraph = document.querySelector(".network-graph");

if(!reduceMotion){

    window.addEventListener("scroll", () => {

        const y = window.scrollY;

        if(orbOne) orbOne.style.transform = `translateY(${y * 0.15}px)`;
        if(orbTwo) orbTwo.style.transform = `translateY(${y * -0.1}px)`;
        if(orbThree) orbThree.style.transform = `translateY(${y * 0.08}px)`;
        if(networkGraph) networkGraph.style.transform = `translateY(${y * 0.05}px)`;

    });

}