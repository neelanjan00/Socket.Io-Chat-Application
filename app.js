const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot'

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        // Welcome current user only.
        socket.emit(
            'message', 
            formatMessage(botName, 'Welcome to ChatCord!')
        )

        //Broadcasts a message whenever a new user connects (Message gets emitted to 
        // everyone but the new user who joined)
        socket.broadcast.to(user.room).emit(
            'message', 
            formatMessage(botName, `${user.username} has joined the chat.`)
        )

        // Send users and room info
        io.to(user.room).emit(
            'roomUsers', 
            {
                room: user.room,
                users: getRoomUsers(user.room)
            }
        )
    })

    //Listen for chat message content
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //Executes whenever a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user){
            io.to(user.room).emit(
                'message', 
                formatMessage(botName, `${user.username} has left the chat`)
            )

            // Send users and room info
            io.to(user.room).emit(
                'roomUsers', 
                {
                    room: user.room,
                    users: getRoomUsers(user.room)
                }
            )
        }
    })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`))