import React, { useState, useEffect, useRef } from "react";
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
    /**
     * Constants
     */
    const fakeUserId = "usr_12323854541973129378921";
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

    /**
     * Define sandBoxPublic key for Flow
     * Define personalPublic key for Frame
     */
    const sandBoxPublicKey = "pk_sbox_kms5vhdb66lgxsgzlgv4dgy3ziy";
    const personalPublicKey = "pk_sbox_ycp2pqsjd7i7q2ul7q5v5lzvniw";

    /**
     * Handle payment language
     */
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

    /**
     * Handle payment instrument
     */
    interface UserPaymentInstrumentState {
        id: string;
        scheme: string;
        cardNumLast4: string;
        expiryMonth: number;
        expiryYear: number;
    }
    const [userPaymentInstrumentState, setUserPaymentInstrumentState] =
        useState<UserPaymentInstrumentState | null>(null);

    const loadUserPaymentInstrument = async () => {
        const fetchedUserPaymentInstrument = await fetchUserPaymentInstrument();
        setUserPaymentInstrumentState(fetchedUserPaymentInstrument);
    };

    useEffect(() => {
        loadUserPaymentInstrument();
    }, []);

    async function fetchUserPaymentInstrument() {
        try {
            const response = await fetch(`/user/${fakeUserId}/instrument`);
            const payload = await response.json();
            if (payload === null) {
                return null;
            }
            return {
                id: payload.id,
                scheme: payload.scheme,
                cardNumLast4: payload.cardNumLast4,
                expiryMonth: payload.expiryMonth,
                expiryYear: payload.expiryYear
            };
        } catch (error) {
            console.error("fetchUserPaymentInstrument error:", error);
            return null;
        }
    }

    async function deleteUserPaymentInstrument() {
        try {
            const response = await fetch(`/user/${fakeUserId}/instrument`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            return response.ok;
        } catch (error) {
            console.error("deleteUserPaymentInstrument error:", error);
            return false;
        }
    }

    /**
     * Handle frame payment integration
     */
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
    async function processFramePaymentToken(saveOneTouchPayment: boolean) {
        try {
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: FramePaymentStatus.Processing
            }));
            const cardData = await Frames.submitCard();
            const paymentsPayload = {
                userId: fakeUserId,
                amount: totalAmount,
                token: cardData.token,
                saveOneTouchPayment: saveOneTouchPayment
            };
            const response = await fetch("/payments/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentsPayload)
            });
            const parsedPayload = await response.json();
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: parsedPayload.status
                    ? parsedPayload.status
                    : parsedPayload.error_codes[0],
                approved: parsedPayload.approved
            }));
            if (parsedPayload.approved && saveOneTouchPayment) {
                await loadUserPaymentInstrument();
            }
        } catch (error) {
            console.error("processFramePaymentToken error:", error);
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: FramePaymentStatus.Pending,
                approved: false
            }));
        }
    }
    async function processFramePaymentOneTouch(
        userPaymentInstrumentState: UserPaymentInstrumentState
    ) {
        try {
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: FramePaymentStatus.Processing
            }));

            const paymentsPayload = {
                amount: totalAmount,
                id: userPaymentInstrumentState.id
            };
            const response = await fetch("/payments/onetouch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentsPayload)
            });
            const parsedPayload = await response.json();
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: parsedPayload.status
                    ? parsedPayload.status
                    : parsedPayload.error_codes[0],
                approved: parsedPayload.approved
            }));
        } catch (error) {
            console.error("processFramePaymentOneTouch error:", error);
            setFramePaymentState((prevState) => ({
                ...prevState,
                status: FramePaymentStatus.Pending,
                approved: false
            }));
        }
    }
    async function processFramePayment() {
        if (
            checkboxUseOneTouchPaymentRef.current?.checked == true &&
            userPaymentInstrumentState !== null
        ) {
            await processFramePaymentOneTouch(userPaymentInstrumentState);
        } else {
            await processFramePaymentToken(
                checkboxSaveOneTouchPaymentRef.current?.checked == true
            );
        }
    }
    async function resetFramePayment() {
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
    }

    /**
     * Handle flow payment integration
     */
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
    async function processFlowPayment() {
        setFlowPaymentState((prevState) => ({
            ...prevState,
            mountStatus: "Processing"
        }));
        const payload = {
            amount: totalAmount,
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
    }

    /**
     * Handle fetch product
     */
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
            const payload = await response.json();
            return payload.products;
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

    /**
     * Handle user input/interaction
     */
    const checkboxUseOneTouchPaymentRef = useRef<HTMLInputElement>(null);
    const checkboxSaveOneTouchPaymentRef = useRef<HTMLInputElement>(null);
    const onFramePaymentClicked = async () => {
        if (framePaymentState.status === FramePaymentStatus.Pending) {
            await processFramePayment();
        } else {
            await resetFramePayment();
        }
    };

    const onFlowPaymentButtonClicked = async () => {
        await processFlowPayment();
    };

    const onClearUserPaymentInstrumentClicked = async () => {
        const isClearSuccess = await deleteUserPaymentInstrument();
        if (isClearSuccess) {
            setUserPaymentInstrumentState(null);
        }
    };

    /**
     * Handle language change
     */
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

    let buttonComponent: JSX.Element;
    if (framePaymentState.status === FramePaymentStatus.Pending) {
        buttonComponent = (
            <button
                onClick={onFramePaymentClicked}
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
                    onClick={onFramePaymentClicked}
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
                    onClick={onFramePaymentClicked}
                    style={{
                        background: "lightcoral",
                        border: "1px solid coral",
                        padding: "10px",
                        width: "100%",
                        borderRadius: "4px"
                    }}
                >
                    Error {framePaymentState.status}, Try again payment.
                </button>
            );
        }
    }

    /**
     * UI Rendering
     */
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
            {userPaymentInstrumentState !== null ? (
                <div
                    style={{
                        marginBottom: "8px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >
                    <div>
                        <input
                            type="checkbox"
                            id="checkboxUseOneTouchPayment"
                            ref={checkboxUseOneTouchPaymentRef}
                        />
                        <label>
                            Use your saved {userPaymentInstrumentState?.scheme}{" "}
                            ending in {userPaymentInstrumentState?.cardNumLast4}
                        </label>
                    </div>
                    <label
                        style={{
                            marginLeft: "auto",
                            color: "red",
                            cursor: "pointer"
                        }}
                        onClick={onClearUserPaymentInstrumentClicked}
                    >
                        Clear saved
                    </label>
                </div>
            ) : (
                <div
                    style={{
                        marginBottom: "8px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >
                    <div>
                        <input
                            type="checkbox"
                            id="checkboxSaveAsOneTouchPayment"
                            ref={checkboxSaveOneTouchPaymentRef}
                        />
                        <label>Save as one-touch payment</label>
                    </div>
                </div>
            )}
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
                        onClick={onFlowPaymentButtonClicked}
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
                        onClick={onFlowPaymentButtonClicked}
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
