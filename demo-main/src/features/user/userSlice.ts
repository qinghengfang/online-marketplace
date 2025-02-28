import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IdTokenClaims } from '@azure/msal-browser';
import type { RootState } from '../../app/store' 

export interface AuthState {
    accessToken: string | null,
    idTokenClaims: IdTokenClaims | undefined
}

const initialState: AuthState = {
    accessToken: null,
    idTokenClaims: undefined
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
   reducers: {
    setAccessToken(state, action: PayloadAction<string | null>) {
        state.accessToken = action.payload;
    },
    setClaims(state, action: PayloadAction<IdTokenClaims | undefined>) {
        state.idTokenClaims = action.payload;
    }
  }
});

export const { setAccessToken, setClaims } = userSlice.actions;
export const selectClaims = (state: RootState) => state.user.idTokenClaims;
export const selectAccessToken = (state: RootState) => state.user.accessToken;
export default userSlice.reducer;