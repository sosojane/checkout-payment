const express = require("express");
const app = express();

app.get("/products", (req, res) => {
    const products = [
        { name: "Product Test", quantity: 500, amount: 10 },
        { name: "Product 2", quantity: 3, amount: 15 },
        { name: "Product 3", quantity: 2, amount: 20 }
    ];

    res.json({ products });
});

app.listen(9000, () => {
    console.log("Server listening to port 9000....");
});
