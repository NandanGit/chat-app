// Requirements
const express = require("express");
require("./db/mongoose");
const User = require("./models/user");
const Message = require("./models/message");
// const userRouter = require("./routers/userRouter");
// const messageRouter = require("./routers/messageRouter");
const { Socket } = require("dgram");
// const ejs = require("ejs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const confidentials = require("./confidentials");

// Functions
function processCookie(cookie) {
  return cookie.split("; ").filter((el) => el.length === 149)[0];
}

// Setting up express app
const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// Setting up Socket.io
var server = require("http").createServer(app);
var io = require("socket.io")(server);

io.on("connection", (socket) => {
  // console.log(socket.id);
  socket.on("emailValidation", async (email, callback) => {
    // Validate Email
    if (!validator.isEmail(email)) {
      return callback("Invalid email format");
    }
    // Check for existing email in the database
    const user = await User.findOne({ email });

    if (user) {
      // console.log(user);
      return callback("Username already exists");
    }

    callback("");
  });

  socket.on("isEmailExists", async (email, callback) => {
    // Check for existing email in the database
    const user = await User.findOne({ email });

    if (!user) {
      // console.log(user);
      return callback("Username is invalid");
    }

    callback("");
  });

  socket.on("saveUser", async (userData, callback) => {
    // console.log(userData);
    // callback("Error");
    try {
      const newUser = await User(userData);
      await newUser.save();
      const token = await newUser.generateAuthToken();
      // console.log(token);
      callback(undefined, token);
    } catch (err) {
      callback(`An error occured: ${err}`, undefined);
    }
  });

  socket.on("loginUser", async (userData, callback) => {
    // console.log(userData);
    // callback("Error");
    try {
      const user = await User.findByCredentials(
        userData.email,
        userData.password
      );

      const token = await user.generateAuthToken();
      // console.log(token);
      callback(undefined, token);
    } catch (err) {
      callback(`Password is wrong`, undefined);
    }
  });

  // Events related to chat
  socket.on("joinRoom", (roomName, callback) => {
    try {
      socket.join(roomName);
      callback("");
    } catch (err) {
      callback(err);
    }
  });

  socket.on("sendMessage", async (messageData, callback) => {
    // console.log(Object.keys(messageData));
    const message = messageData.message;
    const room = messageData.room;
    const token = processCookie(messageData.cookie);
    // Use token to get the user from the database
    const user = await User.findOne({ "tokens.token": token });
    if (!user) {
      return console.log("User not found");
    }
    console.log(user._id);
    // Create a message instace and save to the database
    const newMessage = await Message({
      sender: user._id,
      room: room,
      description: message,
    });
    await newMessage.save();
    // console.log({ message, token });
    callback("Message recieved");

    io.to(room).emit("serveMessage", {
      sender: user.name,
      createdAt: user.createdAt,
      description: message,
    });
  });

  // How should i be able to get the cookie in the device and render the chat template to the browser
});

// // Routing
// app.use(userRouter);
// app.use(messageRouter);
const loggedIn = false; // Temporary
app.get("/", async (req, res) => {
  const token = processCookie(req.query.cookie);
  if (token) {
    // check if the token is valid
    const decoded = jwt.verify(token, confidentials.jwtSecretCode);
    // console.log(decoded);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      // throw new Error("Invalid token");
      // return console.log("Invalid token");
      res.redirect("/login");
    }
    res.render("chat");
  }
  // console.log(token);
  // res.send(req);
  // const token = "asdd";
  // if (loggedIn) {
  //   res.render("chat");
  // }
  // res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// Listening
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server is listening on port ${port}`));
