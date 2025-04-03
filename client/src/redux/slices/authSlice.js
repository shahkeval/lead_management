import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL}api`;

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      localStorage.setItem('token', response.data.token);
      // dispatch(getMe()); // Fetch user data after login
      return response.data;
    } catch (error) {
      // console.log('error',error.response?.data?.message)
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Failed to get user info');
    }
  }
);

// Define the sendPasswordResetEmail action
export const sendPasswordResetEmail = createAsyncThunk(
  'auth/sendPasswordResetEmail',
  async ({ email }) => {
    const response = await axios.post(`${process.env.REACT_APP_BASE_URL}api/auth/forgot-password`, { email });
    return response.data;
  }
);

// Define the changePassword action
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ token, newPassword }) => {
    const response = await axios.post(`${process.env.REACT_APP_BASE_URL}api/auth/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    user_name: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.user_name = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('lastPath');
    },
    clearError: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.user_name = action.payload.user_name;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.user_name = action.payload.user.user_name;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        // console.log(action.payload)
        state.error = action.payload || 'Login failed';
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(sendPasswordResetEmail.fulfilled, (state, action) => {
        // Handle success
      })
      .addCase(sendPasswordResetEmail.rejected, (state, action) => {
        // Handle error
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        // Handle success
      })
      .addCase(changePassword.rejected, (state, action) => {
        // Handle error
        state.error =  'Invalid Credentials';

      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 