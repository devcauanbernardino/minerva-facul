declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src: string
        trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'boomerang'
        colors?: string
        stroke?: 'light' | 'regular' | 'bold'
        state?: string
        style?: React.CSSProperties
        className?: string
      }
    }
  }
}
