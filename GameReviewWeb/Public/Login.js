const form = document.getElementById("credentials")
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            alert("Login successful!");
            window.location.href = "/home"; // Redirect to homepage or dashboard
        } else {
            document.getElementById("loginMessage").innerText = data.error;
        }
    } catch (err) {
        console.error(err);
    }
});

// Get the search input field
var searchInput = document.getElementById('search');

// Add event listener for keyup event
searchInput.addEventListener('keyup', function(event) {
    // Check if the Enter key is pressed
    if (event.key === 'Enter') {
        // Get the search query
        var query = searchInput.value.trim();

        // Check if the query is not empty
        if (query !== '') {
            // Redirect to the search page with the query parameter
            window.location.href = '/search?genres=&developers=&publishers=&scores=0%2C5&platforms=&sort=Relevance&search=' + encodeURIComponent(query);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetch('/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById("navbar-container").innerHTML = html;
        })
        .catch(err => console.error("Error loading navbar:", err));
});