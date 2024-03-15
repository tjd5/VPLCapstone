export default class Cell {
  left;
  right;
  up;
  down;

  constructor() {
    // directions cell has walls in
    this.left = true;
    this.right = true;
    this.up = true;
    this.down = true;
    this.vis = false;
  }
}
