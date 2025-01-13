// Function to validate login credentials
function validateLogin(username, password) {
    // Hardcoded username and password (this could be stored in a database in a real system)
    const correctUsername = "admin";
    const correctPassword = "password123"; // Don't store passwords in plaintext in production!

    return username === correctUsername && password === correctPassword;
}

// Event listener for form submission
document.getElementById("login-form")?.addEventListener("submit", function(event) {
    event.preventDefault();

    // Get the username and password input values
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Validate credentials
    if (validateLogin(username, password)) {
        console.log("Login successful!");  // Debugging log

        // Set a logged-in flag in localStorage
        localStorage.setItem("isAdminLoggedIn", "true");

        // Redirect to admin page
        window.location.href = "admin.html";  // Ensure the correct URL for admin page
    } else {
        // Show error message if credentials are incorrect
        document.getElementById("error-message").style.display = "block";
    }
});
