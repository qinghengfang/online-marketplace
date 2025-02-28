import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store' 
import { Product } from '../../dataModels/Product';
import { addProductToUserInventory, getUserInventory } from '../../api/GetUserInventoryAPI';

export enum LoadingStatus {
    Idle = 0,
    Loading = 1,
    Succeeed = 2,
    Failed = 3
}

export interface InventoryState {
    products: Array<Product>
    status: LoadingStatus,
    error: string | null | undefined
}

const initialState: InventoryState = {
    products: [],
    status: LoadingStatus.Idle,
    error: null
};

export const fetchInventory = createAsyncThunk<Product[], string | undefined>(
  'userInventory/fetchInventory', 
  async (userId: string | undefined) => {
    const response = await getUserInventory(userId);
    return response;
  }
)
  
export const addNewProduct = createAsyncThunk('userInventory/addProductToInventory', async (product: Product) => {
    const response = await addProductToUserInventory(product.id);
    if (response)
    {
        return product;
    }

    return null;
})

export const userInventorySlice = createSlice({
  name: 'userInventory',
  initialState,
   reducers: {
    listProduct(state, action: PayloadAction<number>) {
      state.products = state.products.filter((p) => p.id !== action.payload)
    },
    refreshData(state) {
      state.status = LoadingStatus.Idle
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.status = LoadingStatus.Loading;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = LoadingStatus.Succeeed
        // Add any fetched posts to the array
        state.products = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = LoadingStatus.Failed;
        state.error = action.error.message;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        if (action.payload != null)
        {
            state.products.push(action.payload);
        }
      })
  }
});

export const { listProduct, refreshData } = userInventorySlice.actions;
export const selectInventoryProducts = (state: RootState) => state.userInventory.products;
export default userInventorySlice.reducer;