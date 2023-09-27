export function formatHeader(header: string): string {
  let value: string = '';
  switch (header) {
    case 'id':
      return (value = 'Cód');
    case 'customer':
      return (value = 'Cliente');
    case 'createdAt':
      return (value = 'Criado Em');
    case 'deadline':
      return (value = 'Prazo Final');
    case 'total':
      return (value = 'Valor');
    case 'step':
      return (value = 'Etapa');
    case 'name':
      return (value = 'Modelo');
    case 'set':
      return (value = 'Conjunto');
    case 'price':
      return (value = 'Preço');
    case 'color':
      return (value = 'Cor');
    case 'fabric':
      return (value = 'Tecido');
    case 'size':
      return (value = 'Tamanho');
    case 'item':
      return (value = 'Modelo');
    case 'amount':
      return (value = 'Qtde');
  }
  return value;
}
