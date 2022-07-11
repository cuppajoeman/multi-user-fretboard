class User {
    constructor(id) {
        this.position = [0, 0];
        this.id = id;
        this.mousePressed = false;
        this.mouseHeld = false;
    }
    
    setPosition(newPosition) {
        this.position = newPosition;
    }
}

module.exports = User;