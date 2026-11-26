/* The LDA lettermark as clean, hand-built geometry (straight edges + true arcs, no tracing noise), so it stays crisp at any
   size and animates piece by piece. viewBox 419.1 × 153.6.
   letters (white): 0 L stem, 1 L foot, 2 D, 3 A (one solid piece, the violet diamond sits on top of it).   violet blocks: 0 in L, 1 in D, 2 in A. */
export const LOGO = {
  mark: {
    w: 419.1,
    h: 153.6,
    letters: [
      'M0 0H36.8V65.8H0Z',
      'M0 119.4H102V153.4H0Z',
      'M120.2 0.2H191A76.6 76.6 0 0 1 191 153.4H120.2ZM157.5 33.2H186.75A43.25 43.25 0 0 1 186.75 119.7H157.5ZM120.2 51.3H157.5V103.6H120.2Z',
      'M267.8 153.5L324.8 0H361L419 153.4H381.6L342.9 49.1L304.2 153.5Z',
    ],
    violet: [
      'M0 70H36.8V114.4H0Z',
      'M120.2 55H157.5V99.8H120.2Z',
      'M324.8 2.2L343 49.5L329 85.5L310.6 38.5Z',
    ],
  },
};
