import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roleReducer from './slices/roleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
  },
}); 