import { ItemColors } from './ItemColors';
import { ItemFabrics } from './ItemFabrics';
import { ItemSizes } from './ItemSizes';
import { Set } from './Set';

export interface Item {
  id: number;
  name: string;
  set?: Set;
  setId?: number;
  itemColors: ItemColors[];
  itemSizes: ItemSizes[];
  itemFabrics: ItemFabrics[];
  imageURL: string;
  price: number;
  isActive?: boolean;
}
