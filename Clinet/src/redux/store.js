import { configureStore, combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./cartRedux";
import userReducer from "./userRedux";
import wishlistReducer from "./wishlistRedux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  // The cart is persisted separately per user below.
  blacklist: ["cart"],
};

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const cartStorageKey = (userId) => `stylehub:cart:${userId}`;

const getUserId = (user) => user?._id || user?.id;

const readUserCart = (userId) => {
  if (!userId) return null;

  try {
    const savedCart = localStorage.getItem(cartStorageKey(userId));
    return savedCart ? JSON.parse(savedCart) : null;
  } catch {
    return null;
  }
};

const saveUserCart = (userId, cart) => {
  if (!userId || !cart) return;

  localStorage.setItem(cartStorageKey(userId), JSON.stringify(cart));
};

// Keep one cart per account instead of sharing one global persisted cart.
const cartStorageMiddleware = ({ getState, dispatch }) => (next) => (action) => {
  const previousState = getState();
  const previousUserId = getUserId(previousState.user.currentUser);

  if (
    (action.type === "user/loginSuccess" || action.type === "user/logout") &&
    previousUserId
  ) {
    saveUserCart(previousUserId, previousState.cart);
  }

  const result = next(action);
  const currentState = getState();
  const currentUserId = getUserId(currentState.user.currentUser);

  if (action.type === "user/loginSuccess" && currentUserId) {
    dispatch({
      type: "cart/hydrateCart",
      payload: readUserCart(currentUserId),
    });
  } else if (action.type === "user/logout") {
    dispatch({ type: "cart/reset" });
  } else if (action.type.startsWith("cart/") && currentUserId) {
    saveUserCart(currentUserId, currentState.cart);
  } else if (action.type === "persist/REHYDRATE" && currentUserId) {
    dispatch({
      type: "cart/hydrateCart",
      payload: readUserCart(currentUserId),
    });
  }

  return result;
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(cartStorageMiddleware),
});

export let persistor = persistStore(store);
