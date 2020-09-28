const users = []

// Add User
const addUser = ({ id, username, room }) => {
    // Cleaning the Data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validating the data
    if(!username || !room){
        return {
            error: "Username and room are required!"
        }
    }
    
    // Check for Existing User
    const existingUser = users.find((user) => user.room === room && user.username === username)

    if(existingUser){
        return {
            error: 'Username already in Use!'
        }
    }
    
    // Store User
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// Remove User
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1)
        return users.splice(index, 1)[0]
}

// Get User
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// Get User in a Room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}