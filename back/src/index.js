const { server } = require("./app.js");

const PORT = 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});