import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({  // Changed from cartSlice to userSlice for clarity
    name: "user",
    initialState: {
        currentUser: null,  // Changed from {} to null for better initial state
        isFetching: false,
        error: false,
    },
    reducers: {
        loginStart: (state) => {
            state.isFetching = true;
            state.error = false;  // Reset error on new attempt
        },
        loginSuccess: (state, action) => {
            state.isFetching = false;
            state.currentUser = action.payload;
            state.error = false;
        },
        loginFailure: (state) => {
            state.isFetching = false;
            state.error = true;
            state.currentUser = null;  // Clear user data on failure
        },
        logout: (state) => {
            state.currentUser = null;
            state.error = false;
            state.isFetching = false;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;