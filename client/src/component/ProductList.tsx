import React from "react";

export interface Product {
    name: string;
    quantity: number;
    amount: number;
}

interface ProductListProps {
    products: Product[];
    onUpdate: (updatedProducts: Product[]) => void;
}

function ProductList({ products, onUpdate }: ProductListProps) {
    const handleQuantityChange = (index: number, quantity: number) => {
        if (isNaN(quantity)) {
            quantity = 0;
        }
        const updatedProduct = { ...products[index], quantity };
        const newProducts = [...products];
        newProducts[index] = updatedProduct;
        onUpdate(newProducts);
    };

    const handleAmountChange = (index: number, amount: number) => {
        if (isNaN(amount)) {
            amount = 0;
        }
        const updatedProduct = { ...products[index], amount };
        const newProducts = [...products];
        newProducts[index] = updatedProduct;
        onUpdate(newProducts);
    };

    return (
        <div
            style={{
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
                marginBottom: "5px",
                borderRadius: "4px",
                overflowX: "auto"
            }}
        >
            <div
                style={{
                    padding: "20px"
                }}
            >
                <div>
                    <div
                        style={{
                            marginBottom: "10px",
                            fontSize: "24px",
                            fontWeight: "bold"
                        }}
                    >
                        <label>Product List</label>
                    </div>

                    {products.length === 0 ? (
                        <div>No products</div>
                    ) : (
                        <div style={{ width: "100%", tableLayout: "fixed" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                textAlign: "left",
                                                paddingRight: "10px"
                                            }}
                                        >
                                            Name
                                        </th>
                                        <th
                                            style={{
                                                textAlign: "left",
                                                padding: "10px"
                                            }}
                                        >
                                            Quantity
                                        </th>
                                        <th
                                            style={{
                                                textAlign: "left",
                                                padding: "10px"
                                            }}
                                        >
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={index}>
                                            <td
                                                style={{ paddingRight: "10px" }}
                                            >
                                                {product.name}
                                            </td>
                                            <td style={{ padding: "10px" }}>
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    min="0"
                                                    onChange={(e) =>
                                                        handleQuantityChange(
                                                            index,
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td style={{ padding: "10px" }}>
                                                <input
                                                    type="number"
                                                    value={product.amount}
                                                    min="0"
                                                    onChange={(e) =>
                                                        handleAmountChange(
                                                            index,
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductList;
