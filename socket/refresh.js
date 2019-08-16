module.exports = function (io) {
    io.on('connection', socket => {
        socket.on('refresh', data => {
            io.emit('refreshPage', {});
        });
        socket.on('sendMessage', data => {
            io.emit('refreshMessages', {});
        });
        socket.on('disconnect', async () => { });
    });
};
