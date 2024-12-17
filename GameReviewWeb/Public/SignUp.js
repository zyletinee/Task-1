document.getElementById("credentialsSignup").addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const password2 = document.getElementById('password2').value.trim();
    const signupMessage = document.getElementById('signupMessage');

    // Clear previous message
    signupMessage.textContent = '';

    // Validate input
    if (!username || !password || !password2) {
        signupMessage.textContent = 'All fields are required.';
        return;
    }

    if (password !== password2) {
        signupMessage.textContent = 'Passwords do not match.';
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Auto-login after signup and redirect to home
            window.location.href = '/home';
        } else if (result.error === 'Username already exists.') {
            signupMessage.textContent = 'Username already exists.';
        } else {
            signupMessage.textContent = result.error || 'Signup failed.';
        }
    } catch (error) {
        signupMessage.textContent = 'An error occurred. Please try again.';
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