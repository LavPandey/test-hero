// const express = require('express');

// const app = express()

// const port = process.env.PORT || 3333

// app.get('/', (req, res) => {
//     res.send('Hello World!!!')
// });



// const server = app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
// });

// // Static files
// app.use(express.static("public"));


// const io = require("socket.io")(server, {
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });

// // io.on("connection", (socket) => {
// //     socket.emit("me", socket.id)
// //     socket.on("disconnect", () => {
// //         socket.broadcast.emit("callEnded")
// //     })
// //     socket.on("callUser", (data) => {
// //         io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
// //     })
// //     socket.on("answerCall", (data) => {
// //         io.to(data.to).emit("callAccepted", data.signal)
// //     })
// // })

// const activeUsers = new Set();

// io.on("connection", function (socket) {
//     console.log("Made socket connection");

//     socket.on("new user", function (data) {
//         socket.userId = data;
//         activeUsers.add(data);
//         io.emit("new user", [...activeUsers]);
//     });

//     socket.on("disconnect", () => {
//         activeUsers.delete(socket.userId);
//         io.emit("user disconnected", socket.userId);
//     });
// });

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('userinvite', (data) => {
        socket.broadcast.emit('userinvite', data);
    });

    socket.on('newmeet', (data) => {
        socket.broadcast.emit('userinvite', data);
    });

    socket.on('userinviteaccepted', (data) => {
        socket.broadcast.emit('userinviteaccepted', data);
    });

    socket.on('groupinvite', (data) => {
        socket.broadcast.emit('groupinvite', data);
    });
});

const port = process.env.PORT || 3333
server.listen(port, () => {
    console.log(`listening on *:{port}`);
});

// Static files
app.use(express.static("public"));