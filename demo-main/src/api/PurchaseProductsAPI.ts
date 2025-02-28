import ApiClient, { ApiResponse } from './ApiClient';

export async function purchaseProduct(productId : number): Promise<ApiResponse> {
  return await ApiClient.post("api/v1/ListingProducts/" + productId + "/purchase", null);
}