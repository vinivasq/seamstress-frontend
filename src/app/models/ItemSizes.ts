import { Item } from './Item';
import { Size } from './Size';

export interface ItemSizes {
  itemId: number;
  item?: Item;
  sizeId: number;
  size?: Size;
}
