function register() {
    const registerUsername = document.getElementById('registerUsername').value;
    const registerPassword = document.getElementById('registerPassword').value;
    if (registerUsername && registerPassword) {
        localStorage.setItem(`user_${registerUsername}`, registerPassword);
        alert('Registration successful. Please log in.');
    } else {
        alert('Please enter a username and password.');
    }
}

function login() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const storedPassword = localStorage.getItem(`user_${usernameInput}`);
    if (storedPassword && storedPassword === passwordInput) {
        alert('Login successful.');
       
    } else {
        alert('Invalid username or password.');
    }
}
