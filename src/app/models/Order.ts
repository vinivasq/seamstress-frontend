import { Customer } from './Customer';
import { ItemOrder } from './ItemOrder';
import { SalePlatform } from './SalePlatform';
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
  executorId: number;
  executor?: User;
  salePlatformId?: number;
  salePlatform?: SalePlatform;
  itemOrders: ItemOrder[];
  orderUser?: User[];
}
