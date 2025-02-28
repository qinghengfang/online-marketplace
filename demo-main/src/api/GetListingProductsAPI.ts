import ApiClient, { ApiResponse } from './ApiClient';

export async function getListingProducts(): Promise<ApiResponse> {
  return await ApiClient.get("api/v1/ListingProducts");
}