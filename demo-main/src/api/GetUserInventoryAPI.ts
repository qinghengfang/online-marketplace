import { faker } from '@faker-js/faker';
import { Product } from '../dataModels/Product';

const newProduct = (): Product => {
  return {
    id: faker.number.int(),
    name: faker.commerce.productName(),
    category: faker.commerce.department()
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserInventory(_userId: string | undefined): Promise<Array<Product>> {
  return new Promise<Product[]>((resolve) => {
      // Simulating an asynchronous operation
      // (e.g., fetching data)
      const arr: Product[] = [];
      for(let i = 0; i < 123; i++)
      {
        arr.push(newProduct());
      }

      setTimeout(() => {
          resolve(arr);
      }, 500);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addProductToUserInventory(_productId: number | undefined): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
      // Simulating an asynchronous operation
      // (e.g., fetching data)
      setTimeout(() => {
          resolve(true);
      }, 500);
  });
}