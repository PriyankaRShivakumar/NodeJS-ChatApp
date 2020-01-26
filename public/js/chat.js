const socket = io(); // Here socket will store the return value from io(). The value will be send from server io.on()

//Elements
$messageForm = document.querySelector("#message-form");
$messageFormInput = document.querySelector("input");
$messageFormButton = document.querySelector("button");
$locationButton = document.querySelector("#send-location");
$messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//socket.on function receives the event sent by the server on socket.emit()
socket.on("Message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", mapsURL => {
  console.log(mapsURL);
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: mapsURL.url,
    createdAt: moment(mapsURL.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  //Here we will disable the form
  $messageFormButton.setAttribute("disabled", "disabled");
  //const message = document.querySelector("input").value; //This can also be done as below
  const message = e.target.elements.message.value; //here e is the passed event. target is the element on which this event is defined i.e form. message is the name of the element in this case input field
  socket.emit("sendMessage", message, error => {
    //Here we will enable the form
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = ""; //Clears a message
    $messageFormInput.focus(); //Sets focus to Input box

    if (error) {
      return console.log(error);
    }
    console.log("Message was delivered ");
  });
});

$locationButton.addEventListener("click", () => {
  // navigator.geolocation is responsible for obtaining the location through browser geo location API, we use the following if to check if browser supports this
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  //Disable the Button
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    socket.emit("sendLocation", location, () => {
      //Enable the Button
      $locationButton.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
