let users = []
let rooms = []
let connect

setInterval(Active, 3000);

function Disconect(socket)
{
    let roomsSelect = rooms.filter(i => i.first.socketId === socket.id ||
        i.second.socketId === socket.id);
    if(roomsSelect.length === 1)
    {
        rooms = rooms.filter(i => i !== roomsSelect[0]);            
        if (roomsSelect[0].first.socketId === socket.id) {
            users.push(roomsSelect[0].second);
            connect.to(roomsSelect[0].second.socketId).emit('disconnectUser');
        } else {
            users.push(roomsSelect[0].first);
            connect.to(roomsSelect[0].first.socketId).emit('disconnectUser');
        }
    }
    else {
        users = users.filter(i => i.socketId != socket.id)
    }       
}

function Active() {
    if (users.length > 1) {
        let user1 = users[Math.floor(Math.random() * users.length)];
        users = users.filter(i => i.socketId !== user1.socketId);
        let user2 = users[Math.floor(Math.random() * users.length)];
        users = users.filter(i => i.socketId !== user2.socketId);
        rooms.push({
            first: user1,
            second: user2,
        })
        connect.to(user1.socketId).emit("active");
    }
}


module.exports = (io) => {
    connect = io;
    io.sockets.on('connection', function(socket) {
        socket.on('messageUser', function(message) {
            let roomsSelect = rooms.filter(i => i.first.socketId === socket.id ||
                i.second.socketId === socket.id)
            if(roomsSelect.length > 0)
            {
                if (roomsSelect[0].first.socketId === socket.id) {
                    connect.to(roomsSelect[0].second.socketId).emit('messageUser', message);
                } else {
                    connect.to(roomsSelect[0].first.socketId).emit('messageUser', message);
                }
            }
        });

        socket.on('active', function() {
            users.push({
                socketId: socket.id,
            });
        });

        socket.on('disconnect', function() {
            Disconect(socket);
        });

        socket.on('stop', function() {
            Disconect(socket);
        });

        socket.on('next', function() {
            let roomsSelect = rooms.filter(i => i.first.socketId === socket.id ||
                i.second.socketId === socket.id);
            if(roomsSelect.length === 1)
            {
                rooms = rooms.filter(i => i !== roomsSelect[0]);   
                users.push(roomsSelect[0].second);
                connect.to(roomsSelect[0].second.socketId).emit('disconnectUser');                
                users.push(roomsSelect[0].first);
                connect.to(roomsSelect[0].first.socketId).emit('disconnectUser');
            }
        });
    });
}