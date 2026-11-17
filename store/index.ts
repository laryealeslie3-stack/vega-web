import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import vendorsReducer from "./slices/vendorsSlice";
import bookingsReducer from "./slices/bookingsSlice";
import serviceBoysReducer from "./slices/serviceBoysSlice";
import catalogReducer from "./slices/catalogSlice";
import dashboardReducer from "./slices/dashboardSlice";
import sidebarReducer from "./slices/sidebar-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendors: vendorsReducer,
    bookings: bookingsReducer,
    serviceBoys: serviceBoysReducer,
    catalog: catalogReducer,
    dashboard: dashboardReducer,
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ["auth/login/fulfilled", "auth/refreshToken/fulfilled"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
