import React, { useState, useEffect } from "react";
import "./App.css";
import ProductList, { Product } from "./component/ProductList";
import {
    loadCheckoutWebComponents,
    Options,
    Environment,
    ComponentName
} from "@checkout.com/checkout-web-components";
import { Frames, FramesStyle, CardFrame, FramesLanguages } from "frames-react";

function App() {
    const framesStyle: FramesStyle = {
        valid: {
            color: "green"
        },
        invalid: {
            color: "red"
        },
        focus: {
            color: "gray"
        },
        placeholder: {
            base: {
                color: "gray"
            },
            valid: {
                color: "gray"
            },
            invalid: {
                color: "gray"
            },
            focus: {
                color: "gray"
            }
        }
    };
    // sandBoxPublic key for Flow
    // personalPublic key for Frame
    const sandBoxPublicKey = "pk_sbox_ycp2pqsjd7i7q2ul7q5v5lzvniw";
    const personalPublicKey = "pk_sbox_ycp2pqsjd7i7q2ul7q5v5lzvniw";

    // Handle payment language
    type PaymentLanguage = "EN" | "NL";
    function convertToFramesLanguages(
        paymentLanguage: PaymentLanguage
    ): FramesLanguages {
        if (paymentLanguage === "NL") {
            return "NL-NL";
        } else {
            return "EN-GB";
        }
    }
    function convertToFlowLanguages(
        paymentLanguage: PaymentLanguage
    ): FlowPaymentLanguage {
        if (paymentLanguage === "NL") {
            return "nl";
        } else {
            return "en";
        }
    }

    // Handle frame payment integration
    const FramePaymentStatus = {
        Pending: "Pending",
        Processing: "Processing"
    };
    interface FramePaymentState {
        language: PaymentLanguage;
        status: string;
        approved: boolean;
    }
    const [framePaymentState, setFramePaymentState] =
        useState<FramePaymentState>({
            language: "EN",
            status: FramePaymentStatus.Pending,
            approved: false
        });

    // Handle flow payment integration
    type FlowPaymentMountStatus = "UnMounted" | "Processing" | "Mounted";
    type FlowPaymentLanguage = "en" | "nl";
    interface FlowPaymentState {
        language: PaymentLanguage;
        mountStatus: FlowPaymentMountStatus;
    }
    const [flowPaymentState, setFlowPaymentState] = useState<FlowPaymentState>({
        language: "EN",
        mountStatus: "UnMounted"
    });

    // Handle fetch product
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

    // Handle user input/interaction
    const handleRetryPayment = async () => {
        Frames.init({
            debug: false,
            publicKey: personalPublicKey,
            style: framesStyle,
            localization: convertToFramesLanguages(framePaymentState.language)
        });
        setFramePaymentState((prevState) => ({
            ...prevState,
            status: FramePaymentStatus.Pending,
            approved: false
        }));
    };

    const handleFramePayment = async () => {
        try {
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: FramePaymentStatus.Processing
            }));
            const cardData = await Frames.submitCard();
            console.log(cardData);
            const paymentsPayload = {
                amount: totalAmount,
                token: cardData.token
            };
            const response = await fetch("/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentsPayload)
            });
            const parsedPayload = await response.json();
            console.log(parsedPayload);
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: parsedPayload.status,
                approved: parsedPayload.approved
            }));
        } catch (error) {
            console.error("Payment session error:", error);
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: FramePaymentStatus.Pending,
                approved: false
            }));
        }
    };

    // Handle change of languages
    const handleChangeEN = async () => {
        Frames.init({
            debug: false,
            publicKey: personalPublicKey,
            style: framesStyle,
            localization: convertToFramesLanguages("EN")
        });
        setFramePaymentState((prevState) => ({
            ...prevState,
            language: "EN"
        }));
        setFlowPaymentState((prevState) => ({
            ...prevState,
            language: "EN"
        }));
    };

    const handleChangeNL = async () => {
        Frames.init({
            debug: false,
            publicKey: personalPublicKey,
            style: framesStyle,
            localization: convertToFramesLanguages("NL")
        });
        setFramePaymentState((prevState) => ({
            ...prevState,
            language: "NL"
        }));
        setFlowPaymentState((prevState) => ({
            ...prevState,
            language: "NL"
        }));
    };

    const handleFlowPayment = async () => {
        setFlowPaymentState((prevState) => ({
            ...prevState,
            mountStatus: "Processing"
        }));
        const payload = {
            amount: totalAmount,
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
                publicKey: sandBoxPublicKey,
                paymentSession: parsedPayload,
                locale: convertToFlowLanguages(flowPaymentState.language),
                environment: Environment.Sandbox
            };
            const checkout = await loadCheckoutWebComponents(options);
            const flow = checkout.create(ComponentName.Flow);
            flow.mount("#flow-container");
            setFlowPaymentState((prevState) => ({
                ...prevState,
                mountStatus: "Mounted"
            }));
        } catch (error) {
            setFlowPaymentState((prevState) => ({
                ...prevState,
                mountStatus: "UnMounted"
            }));
            console.error("Payment session error:", error);
        }
    };

    let buttonComponent: JSX.Element;
    if (framePaymentState.status === FramePaymentStatus.Pending) {
        buttonComponent = (
            <button
                onClick={handleFramePayment}
                style={{
                    background: "lightgray",
                    border: "1px solid darkgray",
                    padding: "10px",
                    width: "100%",
                    borderRadius: "4px"
                }}
            >
                Pay Now. EU {totalAmount}
            </button>
        );
    } else if (framePaymentState.status === FramePaymentStatus.Processing) {
        buttonComponent = (
            <button
                onClick={handleFramePayment}
                disabled={true}
                style={{
                    background: "lightgray",
                    border: "1px solid darkgray",
                    padding: "10px",
                    width: "100%",
                    borderRadius: "4px"
                }}
            >
                Pay Now. EU {totalAmount}
            </button>
        );
    } else {
        if (framePaymentState.approved) {
            buttonComponent = (
                <button
                    onClick={handleRetryPayment}
                    style={{
                        background: "lightgreen",
                        border: "1px solid green",
                        padding: "10px",
                        width: "100%",
                        borderRadius: "4px"
                    }}
                >
                    Payment {framePaymentState.status}! Try again payment.
                </button>
            );
        } else {
            buttonComponent = (
                <button
                    onClick={handleRetryPayment}
                    style={{
                        background: "lightcoral",
                        border: "1px solid coral",
                        padding: "10px",
                        width: "100%",
                        borderRadius: "4px"
                    }}
                >
                    Payment {framePaymentState.status}! Try again payment.
                </button>
            );
        }
    }

    return (
        <div>
            <ProductList products={products} onUpdate={handleProductUpdate} />
            <div style={{ display: "flex", marginBottom: "10px" }}>
                <span
                    onClick={
                        framePaymentState.status ===
                            FramePaymentStatus.Processing ||
                        flowPaymentState.mountStatus === "Processing"
                            ? undefined
                            : handleChangeEN
                    }
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                    EN
                </span>
                <label style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                    /
                </label>

                <span
                    onClick={
                        framePaymentState.status ===
                            FramePaymentStatus.Processing ||
                        flowPaymentState.mountStatus === "Processing"
                            ? undefined
                            : handleChangeNL
                    }
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                    NL
                </span>
            </div>
            <div>
                <Frames
                    config={{
                        debug: false,
                        publicKey: personalPublicKey,
                        style: framesStyle,
                        localization: convertToFramesLanguages(
                            framePaymentState.language
                        )
                    }}
                >
                    <CardFrame />
                    {buttonComponent}
                </Frames>
            </div>
            <div>
                <div
                    id="flow-container"
                    style={
                        flowPaymentState.mountStatus === "Mounted"
                            ? { marginTop: "8px" }
                            : {}
                    }
                />
                {flowPaymentState.mountStatus === "UnMounted" && (
                    <button
                        onClick={handleFlowPayment}
                        style={{
                            background: "lightgray",
                            border: "1px solid darkgray",
                            padding: "10px",
                            width: "100%",
                            borderRadius: "4px"
                        }}
                    >
                        Pay by iDEAL. EU {totalAmount}
                    </button>
                )}
                {flowPaymentState.mountStatus === "Processing" && (
                    <button
                        onClick={handleFlowPayment}
                        style={{
                            background: "lightgray",
                            border: "1px solid darkgray",
                            padding: "10px",
                            width: "100%",
                            borderRadius: "4px"
                        }}
                        disabled={true}
                    >
                        Pay by iDEAL. EU {totalAmount}, Loading...
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;
