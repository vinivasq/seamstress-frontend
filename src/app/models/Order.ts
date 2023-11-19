import { Customer } from './Customer';
import { ItemOrder } from './ItemOrder';
import { User } from './identity/User';

export interface Order {
  id: number;
  description?: string;
  createdAt: Date;
  orderedAt: Date;
  deadline: Date;
  total: number;
  customerId: number;
  customer?: Customer;
  itemOrders: ItemOrder[];
  orderUser?: User[];
}
