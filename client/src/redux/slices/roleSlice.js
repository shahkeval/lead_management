import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL}/api`;

export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateRoleRights = createAsyncThunk(
  'roles/updateRoleRights',
  async ({ roleId, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/roles/${roleId}/rights`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllModules = createAsyncThunk(
  'roles/fetchAllModules',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const roleSlice = createSlice({
  name: 'roles',
  initialState: {
    roles: [],
    allModules: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(updateRoleRights.fulfilled, (state, action) => {
        if (action.payload.role) {
          const index = state.roles.findIndex(role => role._id === action.payload.role._id);
          if (index !== -1) {
            state.roles[index] = action.payload.role;
          }
        }
        if (action.payload.module) {
          state.allModules.push(action.payload.module);
        }
      })
      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.allModules = action.payload.modules;
      });
  },
});

export const { clearError } = roleSlice.actions;
export default roleSlice.reducer; 