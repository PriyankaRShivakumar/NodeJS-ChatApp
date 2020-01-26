const users = [];

//addUser, removeUser, getUser , getUsersInRoom

const addUser = ({ id, username, room }) => {
  //Clean the data (trim, convert to lowercase and validate them)
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: "Username and Room are required!"
    };
  }

  //Check for Existing User
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  //Validate username
  if (existingUser) {
    return {
      error: "Username is in use!"
    };
  }

  //Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  //findIndex finds and returns the index
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    // .splice will remove the user by index
    return users.splice(index, 1)[0]; //index is where we want to remove and 1 is the num of users we want to remove
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
