export const COLS = 5;
export const ROWS = 5;
export const LEVELS_PER_WORD = 16 * 3;
function n(col, row) { return { col, row } };
export const NEIBS = [n(-1, 0), n(1, 0), n(0, 1), n(0, -1)];
