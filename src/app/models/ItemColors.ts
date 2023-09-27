import { Color } from './Color';
import { Item } from './Item';

export interface ItemColors {
  itemId: number;
  item?: Item;
  colorId: number;
  color?: Color;
}
