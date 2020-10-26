const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Get Username and Chat Room name

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()

//Join Chatroom
socket.emit('joinRoom', {username, room})

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

//Message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)

    //Scroll down to the received message
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //Get message content
    const msg = e.target.elements.msg.value

    //Emit a message to the scoket.io server
    socket.emit('chatMessage', msg)

    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

//Output message to DOM
const outputMessage = message => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                     <p class="text">
                        ${message.text}
                     </p>`
    document.querySelector('.chat-messages').appendChild(div)
}

//Add room name to DOM
const outputRoomName = room => {
    roomName.innerText = room
}

//Add Users to the DOM
const outputUsers = users => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}