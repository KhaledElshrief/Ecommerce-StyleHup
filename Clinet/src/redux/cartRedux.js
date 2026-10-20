import {createSlice} from "@reduxjs/toolkit";


const cartSlice = createSlice({
    name: "cart",
    initialState: {
        products: [],
        quantity: 0,
        total: 0,
    },
    reducers: {
        addProduct: (state, action) => {
            const product = {
                ...action.payload,
                price: Number(action.payload.price) || 0,
                quantity: Number(action.payload.quantity) || 1,
            };
            const existingIndex = state.products.findIndex(
                (item) =>
                    item._id === product._id &&
                    item.color === product.color &&
                    item.size === product.size
            );

            if (existingIndex >= 0) {
                state.products[existingIndex].quantity =
                    (Number(state.products[existingIndex].quantity) || 1) +
                    product.quantity;
            } else {
                state.products.push(product);
            }

            state.quantity = state.products.reduce(
                (total, item) => total + (Number(item.quantity) || 1),
                0
            );
            state.total = state.products.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
        },
        removeProduct: (state, action) => {
            const removedProduct = state.products[action.payload];
            state.quantity -= removedProduct ? Number(removedProduct.quantity) || 1 : 0;
            state.products.splice(action.payload, 1);
            state.total = state.products.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
        },
        changeQuantity: (state, action) => {
            const { index, delta } = action.payload;
            const product = state.products[index];
            if (!product) return;

            const currentQuantity = Number(product.quantity) || 1;
            const nextQuantity = currentQuantity + Number(delta);

            if (nextQuantity <= 0) {
                state.products.splice(index, 1);
                state.quantity -= currentQuantity;
            } else {
                product.quantity = nextQuantity;
                state.quantity += nextQuantity - currentQuantity;
            }

            state.total = state.products.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
        },
        syncProducts: (state, action) => {
            const freshProducts = action.payload;
            state.products = state.products.map((item) => {
                const freshProduct = freshProducts.find(
                    (product) => product._id === item._id
                );
                return freshProduct
                    ? {
                          ...item,
                          ...freshProduct,
                          quantity: Number(item.quantity) || 1,
                      }
                    : item;
            });
            state.quantity = state.products.reduce(
                (total, item) => total + (Number(item.quantity) || 1),
                0
            );
            state.total = state.products.reduce(
                (total, item) =>
                    total +
                    (Number(item.price) || 0) *
                        (Number(item.quantity) || 1),
                0
            );
        },
        hydrateCart: (state, action) => {
            const savedCart = action.payload || {};
            const products = Array.isArray(savedCart.products)
                ? savedCart.products
                : [];

            state.products = products;
            state.quantity = products.reduce(
                (total, item) => total + (Number(item.quantity) || 1),
                0
            );
            state.total = products.reduce(
                (total, item) =>
                    total +
                    (Number(item.price) || 0) *
                        (Number(item.quantity) || 1),
                0
            );
        },
        reset: (state) => {
            state.quantity = 0;
            state.products = [];
            state.total = 0;
        },    
    },
});

export const {
    addProduct,
    removeProduct,
    changeQuantity,
    syncProducts,
    hydrateCart,
    reset,
} = cartSlice.actions;
export default cartSlice.reducer;
