const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMsg, generateLocationMsg } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath))


let count = 0
io.on('connection', (socket) => {
    console.log('New WebSocket Connection!')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if(error)
            return callback(error)
        
        socket.join(user.room)

        socket.emit('message', generateMsg('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMsg('Admin', user.username+' has Joined!'))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        if(!user)
            return callback('An Error has Occured!')
        
        const filter = new Filter()

        if(filter.isProfane(message))
            return callback('Profanity is not allowed!')
        
        io.to(user.room).emit('message', generateMsg(user.username, message))
        callback()
    })

    socket.on('sendLocation', ({ longitude, latitude }, callback) => {
        const user = getUser(socket.id)

        if(!user)
            return callback('An Error has Occured!')
        
        io.to(user.room).emit('locationMessage', generateLocationMsg(user.username ,'https://google.com/maps?q='+latitude+','+longitude))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMsg('Admin', user.username+' has left!'))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server is up and running in Port: ' + port)
})