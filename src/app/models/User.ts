import { Order } from './Order';

enum UserRole {
  Supervisor,
  Requester,
  Executor,
}

export interface User {
  id: number;
  name: string;
  userame: string;
  email: string;
  phoneNumber: string;
  ordersUser?: Order[];
  role: UserRole;
}
