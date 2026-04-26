// Contact Form Alert
document.getElementById("contactForm").addEventListener("submit", function(e){
    e.preventDefault();
    alert("Thank you! Message sent successfully.");
});

// Scroll Animation
const fadeElements = document.querySelectorAll(".fade-in");

window.addEventListener("scroll", () => {
    fadeElements.forEach(el => {
        const position = el.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;

        if(position < screenHeight - 100){
            el.classList.add("show");
        }
    });
});
