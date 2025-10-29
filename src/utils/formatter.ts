import { DisplayFormat } from '@/types/microasm';

export function formatValue(value: number, format: DisplayFormat): string {
  switch (format) {
    case 'decimal':
      return value.toString();
    case 'hexadecimal':
      return '0x' + (value & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    case 'binary':
      return '0b' + (value & 0xFFFF).toString(2).padStart(16, '0');
  }
}
