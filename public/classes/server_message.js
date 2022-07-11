class ServerMessage {
  constructor() {
      this.connectedUsers = [];
      this.timeCreated = new Date(); 
  }

  addUser(user) {
      this.connectedUsers.push(user);
  }
    
  removeUser(user) {
    const index = this.connectedUsers.indexOf(user);
      
    if (index > -1) { // only splice array when item is found
      this.connectedUsers.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

}

module.exports = ServerMessage;