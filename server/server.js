const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.static("public"));
app.use(express.json());

// Use SAND_BOX_SECRET_KEY to support ideal payment
// Use PERSONAL_SECRET_KEY to register webhook
const SAND_BOX_SECRET_KEY = "sk_sbox_txpyg4zdo4pvb42jiag4dp4qcye";
const PERSONAL_SECRET_KEY = "sk_sbox_nte55jr6fkd3v56jtr4ow6dioae";

const userPaymentInstrumentMap = new Map();

app.post("/create-payment-sessions", async (_req, res) => {
    // Create a PaymentSession
    const parsedReqBody = _req.body;
    const amount = parsedReqBody.amount;
    const items = parsedReqBody.items;
    const response = await fetch(
        "https://api.sandbox.checkout.com/payment-sessions",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SAND_BOX_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: amount,
                currency: "EUR",
                reference: "ORD-123A",
                description: "Payment for Guitars and Amps",
                enabled_payment_methods: ["ideal"],
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
                items: items,
            })
        }
    );

    const parsedPayload = await response.json();

    res.status(response.status).send(parsedPayload);
});

app.post("/payments/token", async (_req, res) => {
    // Create a Payment
    const parsedReqBody = _req.body;
    const token = parsedReqBody.token;
    const amount = parsedReqBody.amount;
    const storeForFutureUse = parsedReqBody.saveOneTouchPayment;
    const userId = parsedReqBody.userId;
    const response = await fetch("https://api.sandbox.checkout.com/payments", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PERSONAL_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            source: {
                type: "token",
                token: token,
                billing_address: {
                    address_line1: "123 High St.",
                    address_line2: "Flat 456",
                    city: "London",
                    state: "GB",
                    zip: "SW1A 1AA",
                    country: "GB"
                }
            },
            amount: amount,
            store_for_future_use: storeForFutureUse,
            currency: "USD",
            payment_type: "Regular",
            reference: "ORD-5023-4E89",
            description: "Set of 3 masks",
            capture: true,
            capture_on: "2019-09-10T10:11:12Z",
            customer: {
                id: "cus_vdioi7sjnjwefndq7o6kqszezu",
                email: "brucewayne@gmail.com",
                name: "Bruce Wayne",
                phone: {
                    country_code: "+1",
                    number: "415 555 2671"
                }
            },
            billing_descriptor: {
                name: "Withdrawal",
                city: "London"
            },
            shipping: {
                address: {
                    address_line1: "Checkout.com",
                    address_line2: "Flat 456",
                    city: "London",
                    state: "GB",
                    zip: "SW1A 1AA",
                    country: "GB"
                },
                phone: {
                    country_code: "+1",
                    number: "415 555 2671"
                }
            },
            merchant_initiated: true,
            "3ds": {
                enabled: true,
                attempt_n3d: true,
                eci: "05",
                cryptogram: "AgAAAAAAAIR8CQrXcIhbQAAAAAA=",
                xid: "MDAwMDAwMDAwMDAwMDAwMzIyNzY=",
                version: "2.0.1"
            },
            processing_channel_id: "pc_7bwqutuwqczulbdcnntq3ymsfu",
            previous_payment_id: "pay_fun26akvvjjerahhctaq2uzhu4",
            risk: {
                enabled: false
            },
            success_url: "https://example.com/payments/success",
            failure_url: "https://example.com/payments/fail",
            payment_ip: "90.197.169.245",
            recipient: {
                dob: "1985-05-15",
                account_number: "5555554444",
                zip: "SW1A",
                last_name: "Jones"
            },
            metadata: {
                coupon_code: "NY2018",
                partner_id: 123989
            },
            segment: {
                brand: "Acme Corporation",
                business_category: "Inward Payment",
                market: "UK"
            }
        })
    });

    const parsedPayload = await response.json();
    if (response.ok) {
        userPaymentInstrumentMap.set(userId, {
            id: parsedPayload.source.id,
            scheme: parsedPayload.source.scheme,
            cardNumLast4: parsedPayload.source.last4,
            expiryMonth: parsedPayload.source.expiry_month,
            expiryYear: parsedPayload.source.expiry_year
        });
    }
    res.status(response.status).send(parsedPayload);
});

app.post("/payments/onetouch", async (_req, res) => {
    // Create a Payment
    const parsedReqBody = _req.body;
    const id = parsedReqBody.id;
    const amount = parsedReqBody.amount;
    const response = await fetch("https://api.sandbox.checkout.com/payments", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PERSONAL_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            source: {
                type: "id",
                id: id,
                billing_address: {
                    address_line1: "123 High St.",
                    address_line2: "Flat 456",
                    city: "London",
                    state: "GB",
                    zip: "SW1A 1AA",
                    country: "GB"
                }
            },
            amount: amount,
            currency: "USD",
            payment_type: "Regular",
            reference: "ORD-5023-4E89",
            description: "Set of 3 masks",
            capture: true,
            capture_on: "2019-09-10T10:11:12Z",
            customer: {
                id: "cus_vdioi7sjnjwefndq7o6kqszezu",
                email: "brucewayne@gmail.com",
                name: "Bruce Wayne",
                phone: {
                    country_code: "+1",
                    number: "415 555 2671"
                }
            },
            billing_descriptor: {
                name: "Withdrawal",
                city: "London"
            },
            shipping: {
                address: {
                    address_line1: "Checkout.com",
                    address_line2: "Flat 456",
                    city: "London",
                    state: "GB",
                    zip: "SW1A 1AA",
                    country: "GB"
                },
                phone: {
                    country_code: "+1",
                    number: "415 555 2671"
                }
            },
            merchant_initiated: true,
            "3ds": {
                enabled: true,
                attempt_n3d: true,
                eci: "05",
                cryptogram: "AgAAAAAAAIR8CQrXcIhbQAAAAAA=",
                xid: "MDAwMDAwMDAwMDAwMDAwMzIyNzY=",
                version: "2.0.1"
            },
            processing_channel_id: "pc_7bwqutuwqczulbdcnntq3ymsfu",
            previous_payment_id: "pay_fun26akvvjjerahhctaq2uzhu4",
            risk: {
                enabled: false
            },
            success_url: "https://example.com/payments/success",
            failure_url: "https://example.com/payments/fail",
            payment_ip: "90.197.169.245",
            recipient: {
                dob: "1985-05-15",
                account_number: "5555554444",
                zip: "SW1A",
                last_name: "Jones"
            },
            metadata: {
                coupon_code: "NY2018",
                partner_id: 123989
            },
            segment: {
                brand: "Acme Corporation",
                business_category: "Inward Payment",
                market: "UK"
            }
        })
    });
    const parsedPayload = await response.json();
    res.status(response.status).send(parsedPayload);
});

app.get("/user/:userId/instrument", (req, res) => {
    const userId = req.params.userId;
    const instrument = userPaymentInstrumentMap.get(userId);
    if (instrument === undefined) {
        return res.json;
    }
    res.json(instrument);
});

app.delete("/user/:userId/instrument", (req, res) => {
    userPaymentInstrumentMap.delete(req.params.id);
    res.send();
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
