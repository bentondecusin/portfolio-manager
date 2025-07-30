require('dotenv').config();
const app = require("./src/route/index.js");
const { startPeriodicSync } = require("./src/service/assetService.js");
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
    
    // Start the periodic asset data sync service
    // startPeriodicSync();
});