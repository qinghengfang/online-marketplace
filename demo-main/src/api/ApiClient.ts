import axios from "axios";
import { AuthState } from "../features/user/userSlice";
import { EnhancedStore, StoreEnhancer, ThunkDispatch, Tuple, UnknownAction } from "@reduxjs/toolkit";
import { InventoryState } from "../features/userInventory/userInventorySlice";

let store: EnhancedStore<{
  user: AuthState;
  userInventory: InventoryState;
}, UnknownAction, Tuple<[StoreEnhancer<{
  dispatch: ThunkDispatch<{
    user: AuthState;
    userInventory: InventoryState;
  }, undefined, UnknownAction>;
}>, StoreEnhancer]>>

export const injectStore = (_store: EnhancedStore<{ user: AuthState; userInventory: InventoryState; }, UnknownAction, Tuple<[StoreEnhancer<{ dispatch: ThunkDispatch<{ user: AuthState; userInventory: InventoryState; }, undefined, UnknownAction>; }>, StoreEnhancer]>>) => {
  store = _store
}

export interface ApiResponse {
  data: never,
  status: number
}

const serverAddress = "http://localhost:5088";

const client = axios.create({
  baseURL: serverAddress
});

client.interceptors.request.use(config => {
  config.headers.authorization = "Bearer " + store.getState().user.accessToken;
  return config
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(path: string): Promise<ApiResponse>
{
  return client.get(path);
}

function post<T>(path: string, data: T): Promise<ApiResponse> {
  return client.post(path, data);
}

const ApiClient = {
  get: get,
  post: post
}

export default ApiClient;