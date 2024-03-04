import Cell from "./cell.js";
import { Dirs } from "./utils.js";

export default class Grid {
  height;
  width;
  grid;

  constructor(height, width) {
    this.grid = [];
    for (let i = 10; i < height + 10; i++) {
      let temp = [];
      for (let j = 10; j < width + 10; j++) {
        temp.push(new Cell());
      }
      this.grid.push(temp);
    }
    this.height = height;
    this.width = width;
  }

  /**
   * Fetches the cell at the given row and column
   * @param {Integer} row
   * @param {Integer} col
   * @returns {Cell} cell at the given row and column
   */
  getCell(row, col) {
    return this.grid[row][col];
  }

  /**
   * Fetches the position of the cell in the given direction
   * @param {Integer} row
   * @param {Integer} col
   * @param {Dirs} dir
   * @returns {Array} array of [row, col] of the cell in the given direction
   */
  getPos(row, col, dir) {
    if (dir === Dirs.LEFT) {
      return [row, col - 1];
    } else if (dir === Dirs.RIGHT) {
      return [row, col + 1];
    } else if (dir === Dirs.UP) {
      return [row - 1, col];
    } else if (dir === Dirs.DOWN) {
      return [row + 1, col];
    }
    return null;
  }

  /**
   * Checks if the given row and column is a valid position in the grid
   * @param {Integer} row
   * @param {Integer} col
   * @returns {Boolean}
   */
  validPos(row, col) {
    if (row < 0 || row >= this.height) {
      return false;
    }
    if (col < 0 || col >= this.width) {
      return false;
    }
    return true;
  }

  /**
   * Checks if you can remove the wall in the given direction at cell (row, col)
   * @param {Integer} row
   * @param {Integer} col
   * @param {Dirs} dir
   * @returns {Boolean}
   */
  canRemove(row, col, dir) {
    const potPos = this.getPos(row, col, dir);
    if (!this.validPos(potPos[0], potPos[1])) {
      return false;
    }
    return true;
  }

  /**
   * Checks if you can move (no wall) in the given direction at cell (row, col)
   * @param {Integer} row
   * @param {Integer} col
   * @param {Dirs} dir
   * @returns {Boolean}
   */
  canMove(row, col, dir) {
    const cell = this.getCell(row, col);
    if (dir === Dirs.RIGHT) {
      col += 1;
      if (cell.right) {
        return false;
      }
    } else if (dir === Dirs.LEFT) {
      col -= 1;
      if (cell.left) {
        return false;
      }
    } else if (dir === Dirs.UP) {
      row -= 1;
      if (cell.up) {
        return false;
      }
    } else if (dir === Dirs.DOWN) {
      row += 1;
      if (cell.down) {
        return false;
      }
    }

    if (!this.validPos(row, col)) {
      return false;
    }

    return true;
  }

  /**
   * Checks if you can remove the wall in the given direction at cell (row, col) and if the cell in that direction is unvisited
   * @param {Integer} row
   * @param {Integer} col
   * @param {Dirs} dir
   * @returns {Boolean}
   */
  canRemoveAndUnvis(row, col, dir) {
    const potPos = this.getPos(row, col, dir);
    return this.canRemove(row, col, dir) && !this.getCell(potPos[0], potPos[1]).vis;
  }

  /**
   * Sets the cell at the given row and column to visited
   * @param {Integer} row
   * @param {Integer} col
   */
  setVis(row, col) {
    this.grid[row][col].vis = true;
  }

  /**
   * Checks if the cell at the given row and column is visited
   * @param {Integer} row
   * @param {Integer} col
   * @returns {Boolean}
   */
  isVis(row, col) {
    return this.getCell(row, col).vis;
  }

  /**
   * Removes the wall in the given direction at cell (row, col) and opposite wall at the cell in the given direction
   * @param {Integer} row
   * @param {Integer} col
   * @param {Dirs} dir
   * @returns {Array} array of [row, col] of the cell in the given direction
   */
  removeWall(row, col, dir) {
    const potPos = this.getPos(row, col, dir);
    if (dir === Dirs.LEFT) {
      this.getCell(row, col).left = false;
      this.getCell(potPos[0], potPos[1]).right = false;
    } else if (dir === Dirs.RIGHT) {
      this.getCell(row, col).right = false;
      this.getCell(potPos[0], potPos[1]).left = false;
    } else if (dir === Dirs.UP) {
      this.getCell(row, col).up = false;
      this.getCell(potPos[0], potPos[1]).down = false;
    } else if (dir === Dirs.DOWN) {
      this.getCell(row, col).down = false;
      this.getCell(potPos[0], potPos[1]).up = false;
    }
    return potPos;
  }
}
