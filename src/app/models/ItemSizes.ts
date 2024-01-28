import { Item } from './Item';
import { ItemSizeMeasurement } from './ItemSizeMeasurement';
import { Size } from './Size';

export interface ItemSizes {
  id: number;
  itemId: number;
  item?: Item;
  sizeId: number;
  size?: Size;
  meeasurements?: ItemSizeMeasurement[];
}
