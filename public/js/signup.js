const socket = io();

// Elements
const $form = document.querySelector("form");
const $name = document.querySelector("#name");
const $email = document.querySelector("#email");
const $password = document.querySelector("#password");
const $confirmPassword = document.querySelector("#confirm-password");

// Validations
// Name validation
$name.addEventListener("blur", function () {
  console.log(this.value);
  const name = this.value.trim();
  if (!name) {
    // return alert("Name should be provided");
    $name.classList.add("border-danger");
    $name.nextElementSibling.classList.remove("text-hide");
  } else {
    $name.classList.remove("border-danger");
    $name.nextElementSibling.classList.add("text-hide");
    $name.classList.add("border-success");
    $name.value = name;
  }
});

// Email validation
$email.addEventListener("blur", function () {
  // Check if the email is already present
  const email = this.value.trim().toLowerCase();
  socket.emit("emailValidation", email, (error) => {
    // console.log(response);
    if (error) {
      $email.nextElementSibling.innerHTML = error;
      $email.classList.add("border-danger");
      $email.nextElementSibling.classList.remove("text-hide");
    } else {
      $email.classList.remove("border-danger");
      $email.nextElementSibling.classList.add("text-hide");
      $email.classList.add("border-success");
      $email.value = email;
    }
  });
});

// Password validation
$password.addEventListener("blur", function () {
  let error = undefined;
  const password = this.value;
  if (password.includes(" ")) {
    error = "Password should not contain spaces";
  } else if (password.length < 8) {
    error = "Password should be atleast 8 characters long";
  } else if (password.toLowerCase().includes("password")) {
    error = 'Password should not contain the word "password"';
  }
  if (error) {
    $password.nextElementSibling.innerHTML = error;
    $password.classList.add("border-danger");
    $password.nextElementSibling.classList.remove("text-hide");
  } else {
    $password.classList.remove("border-danger");
    $password.nextElementSibling.classList.add("text-hide");
    $password.classList.add("border-success");
  }
});

// Confirm password validation
$confirmPassword.addEventListener("keyup", function () {
  const confirmPassword = this.value;
  let error = undefined;
  if (!$password.value) {
    error = "Enter the password first!!";
  } else if ($password.value !== confirmPassword) {
    error = "Passwords doesn't match";
  }
  if (error) {
    $confirmPassword.nextElementSibling.innerHTML = error;
    $confirmPassword.classList.add("border-danger");
    $confirmPassword.nextElementSibling.classList.remove("text-hide");
  } else {
    $confirmPassword.classList.remove("border-danger");
    $confirmPassword.nextElementSibling.classList.add("text-hide");
    $confirmPassword.classList.add("border-success");
  }
});

$form.addEventListener("submit", (event) => {
  event.preventDefault();
  socket.emit(
    "saveUser",
    {
      name: $name.value,
      email: $email.value,
      password: $password.value,
      confirmPassword: $confirmPassword.value,
    },
    (error, token) => {
      if (error) {
        alert("an error occured, check the console for details");
        return console.log(error);
      }
      console.log(token);
      // Save the token in the cookies
      document.cookie = token;
      console.log("User saved succesfully with token");
      // // Make a get request to the server
      // const Http = new XMLHttpRequest();
      // const url = window.location.origin + "/chat";
      // Http.open("GET", url);
      // Http.setRequestHeader("authToken", token);
      // Http.send();

      // Http.onreadystatechange = (e) => {
      //   console.log(Http.responseText);
      // };
      // Redirect to the home page with cookie as query
      const origin = window.location.origin;
      console.log(origin);
      window.location.assign(`${origin}/?cookie=${token}`);
      console.log("location assigned");
    }
  );
});
