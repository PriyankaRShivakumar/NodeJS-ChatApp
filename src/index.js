const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

//Create an express app
const app = express();
const server = http.createServer(app);
const io = socketio(server); //Here io is the instance of the socket.io and it expects a raw http server as argument

const port = process.env.PORT || 3000;

//Find the path to the public directory
const publicDirectoryPath = path.join(__dirname, "../public");

//Serve up the public directory
app.use(express.static(publicDirectoryPath));

//The following function helps us to listen to an event and what to do when that event occurs. Below connection will be fired whenever socket gets a new connection
//Here socket is an object which contains information about that connection
io.on("connection", socket => {
  console.log("New WebSocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    //socket.join allows us to join a particular chat room
    socket.join(user.room);
    //socket.emit will send data from the server to the client. Here we will send event to client and receive an event back.
    socket.emit("Message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "Message",
        generateMessage("Admin", `${user.username} has joined!`)
      ); // It will send the data to all client except the current client

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    //Set up bad-words
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit("Message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    ); //use`` to Include special characters
    callback();
  });

  //Here disconnect and connection are built in events.
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      //Here since the current client is already disconnected, no need to use broadcast, we can use io.emit
      io.to(user.room).emit(
        "Message",
        generateMessage("Admin", `${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
