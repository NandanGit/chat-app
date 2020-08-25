const socket = io();

// Elements
const $form = document.querySelector("form");
const $email = document.querySelector("#email");
const $password = document.querySelector("#password");

// Email validation
// Email validation
$email.addEventListener("blur", function () {
  // Check if the email is already present
  const email = this.value.trim().toLowerCase();
  if (!email) {
    $email.nextElementSibling.innerHTML = "Enter a username!!";
    $email.classList.add("border-danger");
    $email.nextElementSibling.classList.remove("text-hide");
    return false;
  }
  socket.emit("isEmailExists", email, (error) => {
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

// Submitting
$form.addEventListener("submit", function (event) {
  event.preventDefault();
  socket.emit(
    "loginUser",
    { email: $email.value, password: $password.value },
    (error, token) => {
      if (error) {
        $password.nextElementSibling.innerHTML = error;
        $password.classList.add("border-danger");
        $password.nextElementSibling.classList.remove("text-hide");
        return false;
      }
      $password.classList.remove("border-danger");
      $password.nextElementSibling.classList.add("text-hide");
      $password.classList.add("border-success");

      // Working with token
      console.log(token);
      // Save the token in the cookies
      document.cookie = token;
      console.log("User logged in succesfully with token");

      // Redirect to the home page with cookie as query
      const origin = window.location.origin;
      console.log(origin);
      window.location.assign(`${origin}/?cookie=${token}`);
      console.log("location assigned");
    }
  );
});
