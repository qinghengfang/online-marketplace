import { Product } from "./Product";
import { User } from "./User";

export type ListingProduct = Product & {
    price: string;
    seller: User;
    description: string;
};