import { Sizings } from './Sizings';

export interface Customer {
  id: number;
  name: string;
  address: string;
  city: string;
  neighborhood: string;
  number: number;
  complement?: string;
  cep: number;
  cpF_CNPJ: number;
  phoneNumber: string;
  email: string;
  sizings?: Sizings;
}
