const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.static("public"));
app.use(express.json());

// Insert your secret key here
const SECRET_KEY = "sk_sbox_txpyg4zdo4pvb42jiag4dp4qcye";

app.post("/create-payment-sessions", async (_req, res) => {
    // Create a PaymentSession
    const request = await fetch(
        "https://api.sandbox.checkout.com/payment-sessions",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: 6540,
                currency: "EUR",
                reference: "ORD-123A",
                description: "Payment for Guitars and Amps",
                enabled_payment_methods: ["card", "ideal"],
                processing_channel_id: "pc_2vhgz2ikd6hele43rwcgvwuqju",
                billing_descriptor: {
                    name: "Jia Tsang",
                    city: "London"
                },
                customer: {
                    email: "jia.tsang@example.com",
                    name: "Jia Tsang"
                },
                shipping: {
                    address: {
                        address_line1: "123 High St.",
                        address_line2: "Flat 456",
                        city: "London",
                        zip: "SW1A 1AA",
                        country: "GB"
                    },
                    phone: {
                        number: "1234567890",
                        country_code: "+44"
                    }
                },
                billing: {
                    address: {
                        address_line1: "123 High St.",
                        address_line2: "Flat 456",
                        city: "London",
                        zip: "SW1A 1AA",
                        country: "NL"
                    },
                    phone: {
                        number: "1234567890",
                        country_code: "+44"
                    }
                },
                risk: {
                    enabled: true
                },
                success_url: "http://localhost:3000/?status=succeeded",
                failure_url: "http://localhost:3000/?status=failed",
                metadata: {},
                items: [
                    {
                        name: "Guitar",
                        quantity: 1,
                        unit_price: 1635
                    },
                    {
                        name: "Amp",
                        quantity: 3,
                        unit_price: 1635
                    }
                ]
            })
        }
    );

    const parsedPayload = await request.json();

    res.status(request.status).send(parsedPayload);
});

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
