import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { products: [] },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.products.some((item) => item._id === product._id);

      state.products = exists
        ? state.products.filter((item) => item._id !== product._id)
        : [...state.products, product];
    },
    removeWishlist: (state, action) => {
      state.products = state.products.filter((item) => item._id !== action.payload);
    },
  },
});

export const { toggleWishlist, removeWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
