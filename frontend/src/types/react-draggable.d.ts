declare module 'react-draggable' {
  import * as React from 'react';

  export interface DraggableProps {
    axis?: 'both' | 'x' | 'y' | 'none';
    bounds?:
      | string
      | { left?: number; top?: number; right?: number; bottom?: number }
      | false;
    defaultClassName?: string;
    defaultClassNameDragging?: string;
    defaultClassNameDragged?: string;
    defaultPosition?: { x: number; y: number };
    positionOffset?: { x: number | string; y: number | string };
    position?: { x: number; y: number };
    scale?: number;
    handle?: string;
    cancel?: string;
    grid?: [number, number];
    allowAnyClick?: boolean;
    disabled?: boolean;
    enableUserSelectHack?: boolean;
    nodeRef?: React.RefObject<any>;
    onStart?: (e: any, data: any) => void | false;
    onDrag?: (e: any, data: any) => void | false;
    onStop?: (e: any, data: any) => void | false;
    onMouseDown?: (e: MouseEvent) => void;
    children?: React.ReactNode;
  }

  export default class Draggable extends React.Component<DraggableProps> {}

  export class DraggableCore extends React.Component<DraggableProps> {}
}
