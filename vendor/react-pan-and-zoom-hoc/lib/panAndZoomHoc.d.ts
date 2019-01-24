import * as React from 'react';
export declare type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export interface PanAndZoomHOCProps {
    x?: number;
    y?: number;
    scale?: number;
    scaleFactor?: number;
    minScale?: number;
    maxScale?: number;
    renderOnChange?: boolean;
    passOnProps?: boolean;
    ignorePanOutside?: boolean;
    onPanStart?: (event: MouseEvent | TouchEvent) => void;
    onPanMove?: (x: number, y: number, event: MouseEvent | TouchEvent) => void;
    onPanEnd?: (x: number, y: number, event: MouseEvent | TouchEvent) => void;
    onZoom?: (x: number | undefined, y: number | undefined, scale: number | undefined, event: WheelEvent) => void;
    onPanAndZoom?: (x: number, y: number, scale: number, event: WheelEvent) => void;
}
export default function panAndZoom<P>(WrappedComponent: React.SFC<P> | React.ComponentClass<P> | string): React.ComponentClass<Overwrite<P, PanAndZoomHOCProps>>;
