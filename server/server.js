const express = require("express");
const app = express();

app.get("/api", (req, res) => {
    res.json({ payments: ["Visa", "Mastercard"] });
});

app.listen(9000, () => {
    console.log("Server listening to port 9000....");
});
