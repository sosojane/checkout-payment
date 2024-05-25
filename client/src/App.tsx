import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import CreditCardForm, {
    CreditCardFormState
} from "./component/CreditCardForm";
import ProductList, { Product } from "./component/ProductList";

function App() {
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

    const handleSubmitCreditCardForm = (formData: CreditCardFormState) => {
        if (isNaN(formData.amount)) {
            alert("Amount must be a number"); // 显示警示对话框
            return;
        }
        console.log("提交表单:", formData);
    };

    return (
        <div>
            <ProductList products={products} onUpdate={handleProductUpdate} />
            <CreditCardForm
                totalAmount={totalAmount}
                onSubmit={handleSubmitCreditCardForm}
            />
        </div>
    );
}

export default App;
