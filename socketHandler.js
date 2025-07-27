module.exports = function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);

        socket.on("join", (room) => {
            console.log(`🏠 User joining room: ${room} Socket ID: ${socket.id}`);
            socket.join(room);
            socket.room = room;
            console.log(`✅ User successfully joined room: ${room}`);
        });

        socket.on("disconnect", () => {
            console.log(
                `🔌 Client disconnected: ${socket.id} User: ${socket.room || "unknown"}`
            );
        });
    });
};