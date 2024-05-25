import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

interface PaymentData {
    payments: string[];
}

function App() {
    const [paymentData, setPaymentData] = useState<PaymentData>({
        payments: []
    });

    useEffect(() => {
        fetch("/api")
            .then((response) => response.json())
            .then((data: PaymentData) => {
                setPaymentData(data);
            });
    }, []);
    return (
        <div>
            {paymentData.payments && paymentData.payments.length > 0 ? (
                <ul>
                    {paymentData.payments.map((payment) => (
                        <li key={payment}>{payment}</li>
                    ))}
                </ul>
            ) : (
                <p>No payments available.</p>
            )}
        </div>
    );
}

export default App;
