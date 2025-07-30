require('dotenv').config();

const app = require("./src/route/index.js");
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});