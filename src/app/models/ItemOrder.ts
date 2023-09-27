import { Color } from './Color';
import { Fabric } from './Fabric';
import { Item } from './Item';
import { Size } from './Size';

export interface ItemOrder {
  id: number;
  item?: Item;
  itemId: number;
  orderId: number;
  color: Color;
  fabric: Fabric;
  size: Size;
  description: string;
  amount: number;
  price?: number;
}
