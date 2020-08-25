const socket = io();
var chatRoom;
// Elements
const $joinRoomField = document.querySelector("#join-room-field");
const $joinRoomForm = document.querySelector("#join-room-form");
const $messageComposeForm = document.querySelector("#message-compose-form");
const $messageComposeField = document.querySelector("#message-compose-field");
const $chatBoxMain = document.querySelector("#chat-box__main");
const $chatRoomTitle = document.querySelector("#chatroom-title");
const $chatSpace = document.querySelector("#chat-space");

// Events
$joinRoomForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const roomName = $joinRoomField.value.trim();
  console.log(roomName);
  $joinRoomField.value = "";
  $messageComposeField.focus();
  // Join the given room
  socket.emit("joinRoom", roomName, (err) => {
    if (!err) {
      // Render the chat space
      chatRoom = roomName;
      $chatBoxMain.classList.remove("d-none");
      $chatRoomTitle.innerHTML = roomName;
    }
  });

  socket.on("serveMessage", (messageData) => {
    // console.log(messageData);
    const messageTemplate = document.querySelector("#message-template")
      .innerHTML;

    const html = Mustache.render(messageTemplate, {
      userName: messageData.sender,
      description: messageData.description,
      timeStamp: moment(messageData.createdAt).format("hh:mm A"),
    });
    $chatSpace.insertAdjacentHTML("beforeend", html);
  });

  // Add eventlistener only if joined
  $messageComposeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const messageContent = $messageComposeField.value.trim();
    $messageComposeField.value = "";
    $messageComposeField.focus();
    if (messageContent) {
      socket.emit(
        "sendMessage",
        { message: messageContent, cookie: document.cookie, room: chatRoom },
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });
});
