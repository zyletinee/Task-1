// img slider
var imgs = document.querySelectorAll('.slider img');
var dots = document.querySelectorAll('.dot');
var link = document.getElementById('slider-link');
var currentImg = 0; // index of the first image 
const interval = 5000; // duration(speed) of the slide
var timer = setInterval(changeSlide, interval);

const links = [
	"/search",
	"/game/$26/",
	"/GamePage"
];

link.href = links[currentImg];

function changeSlide(n) {
	for (var i = 0; i < imgs.length; i++) { // reset
		imgs[i].style.opacity = 0; // makes inactive images invisible
		dots[i].className = dots[i].className.replace(' active', '');
	}

	currentImg = (currentImg + 1) % imgs.length; // update the index number

	if (n != undefined) { // if a button is clicked
		clearInterval(timer);
		timer = setInterval(changeSlide, interval);
		currentImg = n;
	}

	imgs[currentImg].style.opacity = 1;
	dots[currentImg].className += ' active';
	link.href = links[currentImg];
}

document.addEventListener("DOMContentLoaded", () => {
    fetch('/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById("navbar-container").innerHTML = html;
        })
        .catch(err => console.error("Error loading navbar:", err));
});