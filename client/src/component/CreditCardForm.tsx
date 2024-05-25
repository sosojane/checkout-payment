import React, { useState, useEffect } from "react";

export interface CreditCardFormState {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
    amount: number;
}

interface CreditCardFormProps {
    totalAmount: number;
    onSubmit: (formData: CreditCardFormState) => void;
}

function CreditCardForm({ totalAmount, onSubmit }: CreditCardFormProps) {
    const [formData, setFormData] = useState<CreditCardFormState>({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
        amount: totalAmount
    });

    useEffect(() => {
        setFormData((prevData) => ({ ...prevData, amount: totalAmount }));
    }, [totalAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "10vh",
                marginTop: "10vh"
            }}
        >
            <div
                style={{
                    border: "1px solid #ccc",
                    padding: "20px",
                    borderRadius: "5px"
                }}
            >
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            marginBottom: "20px",
                            fontSize: "24px",
                            fontWeight: "bold"
                        }}
                    >
                        <label>Payment Detail</label>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            信用卡號：
                            <input
                                type="text"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            持卡人姓名：
                            <input
                                type="text"
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            有效期：
                            <input
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            CVV：
                            <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            金額：
                            <input
                                type="text"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <button type="submit">付款</button>
                </form>
            </div>
        </div>
    );
}

export default CreditCardForm;
