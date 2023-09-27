import { Customer } from './Customer';
import { ItemOrder } from './ItemOrder';
import { User } from './User';

export interface Order {
  id: number;
  description?: string;
  createdAt: Date;
  deadline: Date;
  total: number;
  customerId: number;
  customer?: Customer;
  itemOrders: ItemOrder[];
  orderUser?: User[];
}
