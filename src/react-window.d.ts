declare module 'react-window' {
  import { FC } from 'react';

  interface FixedSizeListProps {
    height: number | string;
    itemCount: number;
    itemSize: number;
    width: number | string;
    children: FC<{ index: number; style: React.CSSProperties }>;
  }

  export const FixedSizeList: FC<FixedSizeListProps>;
}
