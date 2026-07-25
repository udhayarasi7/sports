import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
const userJson = localStorage.getItem('user');
let user = null;
try {
  user = userJson ? JSON.parse(userJson) : null;
} catch (e) {
  console.error("Failed to parse user from local storage");
}

const initialState = {
  token,
  user,
  isAuthenticated: !!token,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUserStatus: (state, action) => {
      if (state.user) {
        state.user.status = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  }
});

export const { authStart, authSuccess, authFailure, logout, updateUserStatus } = authSlice.actions;
export default authSlice.reducer;
