import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import CreditCardForm, {
    CreditCardFormState
} from "./component/CreditCardForm";

function App() {
    const handleSubmit = (formData: CreditCardFormState) => {
        console.log("提交表单:", formData);
    };

    return (
        <div>
            <CreditCardForm onSubmit={handleSubmit} />
        </div>
    );
}

export default App;
