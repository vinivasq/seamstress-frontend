import { Fabric } from './Fabric';
import { Item } from './Item';

export interface ItemFabrics {
  itemId: number;
  item?: Item;
  fabricId: number;
  fabric?: Fabric;
}
