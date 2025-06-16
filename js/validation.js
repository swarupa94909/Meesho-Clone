// Signup Form Validation
const signupForm = document.querySelector('.signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
      alert("All fields are required!");
      e.preventDefault();
      return;
    }

    if (!emailRegex.test(email.value.trim())) {
      alert("Enter a valid email address!");
      e.preventDefault();
      return;
    }

    if (password.value.length < 6) {
      alert("Password must be at least 6 characters long!");
      e.preventDefault();
      return;
    }

    if (password.value !== confirmPassword.value) {
      alert("Passwords do not match!");
      e.preventDefault();
    }
  });
}

// Login Form Validation
const loginForm = document.querySelector('.login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value.trim() || !password.value) {
      alert("Please fill in both email and password.");
      e.preventDefault();
      return;
    }

    if (!emailRegex.test(email.value.trim())) {
      alert("Enter a valid email address.");
      e.preventDefault();
    }
  });
}

// Contact Form Validation
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      alert("All fields are required!");
      e.preventDefault();
      return;
    }

    if (!emailRegex.test(email.value.trim())) {
      alert("Please enter a valid email address.");
      e.preventDefault();
    }
  });
}
