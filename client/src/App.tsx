import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import CreditCardForm, {
    CreditCardFormState
} from "./component/CreditCardForm";
import ProductList, { Product } from "./component/ProductList";
import {
    loadCheckoutWebComponents,
    Options,
    CheckoutWebComponents,
    Environment,
    ComponentName,
    Component
} from "@checkout.com/checkout-web-components";

function App() {
    const publicKey = "pk_sbox_kms5vhdb66lgxsgzlgv4dgy3ziy";

    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const loadProducts = async () => {
            const fetchedProducts = await fetchProducts();
            setProducts(fetchedProducts);
        };

        loadProducts();
    }, []);

    async function fetchProducts() {
        try {
            const response = await fetch("/products");
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error("get products error:", error);
            return [];
        }
    }

    useEffect(() => {
        const totalAmount = products.reduce(
            (sum, product) => sum + product.quantity * product.amount,
            0
        );
        setTotalAmount(totalAmount);
    }, [products]);

    const [totalAmount, setTotalAmount] = useState(0);

    const handleProductUpdate = (updatedProducts: Product[]) => {
        setProducts(updatedProducts);
    };

    const handleSubmitCreditCardForm = async (
        formData: CreditCardFormState
    ) => {
        if (isNaN(formData.amount)) {
            alert("Amount must be a number");
            return;
        }

        const payload = {
            amount: formData.amount,
            currency: "GBP",
            reference: "ORD-123A",
            description: "Payment for Guitars and Amps",
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
                    country: "GB"
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
            items: products.map((product) => ({
                name: product.name,
                quantity: product.quantity,
                unit_price: product.amount
            }))
        };

        try {
            const response = await fetch("/create-payment-sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const parsedPayload = await response.json();
            const options: Options = {
                publicKey: publicKey,
                paymentSession: parsedPayload,
                locale: "en",
                environment: Environment.Sandbox
            };
            try {
                const checkout = await loadCheckoutWebComponents(options);
                const flow = checkout.create(ComponentName.Flow);
                flow.mount("#flow-container");
            } catch (error) {
                console.error("Failed to load CheckoutWebComponents:", error);
            }
        } catch (error) {
            console.error("Payment session error:", error);
        }
    };

    return (
        <div>
            <ProductList products={products} onUpdate={handleProductUpdate} />
            <CreditCardForm
                totalAmount={totalAmount}
                onSubmit={handleSubmitCreditCardForm}
            />
            <div id="flow-container"></div>
        </div>
    );
}

export default App;
