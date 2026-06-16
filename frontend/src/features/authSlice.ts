import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../types'
import { api } from '../services/api'

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    setToken: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      localStorage.setItem('access_token', action.payload.access)
      localStorage.setItem('refresh_token', action.payload.refresh)
      state.token = action.payload.access
      state.isAuthenticated = true
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getProfile.matchFulfilled, (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    })
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, action) => {
      localStorage.setItem('access_token', action.payload.access)
      localStorage.setItem('refresh_token', action.payload.refresh)
      state.token = action.payload.access
      state.isAuthenticated = true
    })
    builder.addMatcher(api.endpoints.register.matchFulfilled, (state, action) => {
      localStorage.setItem('access_token', action.payload.access)
      localStorage.setItem('refresh_token', action.payload.refresh)
      state.token = action.payload.access
      state.user = action.payload.user
      state.isAuthenticated = true
    })
  }
})

export const { logout, setToken } = authSlice.actions
export default authSlice.reducer
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
