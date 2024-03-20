import Grid from "./grid.js";
import { Dirs } from "./utils.js";
import { shuffle } from "./utils.js";
/**
 * Maze class that contains all the information about the maze
 */
export default class Maze {
  wallColor;
  pathColor;
  wallSize;
  pathSize;
  type;
  effect;

  constructor(height, width, wallColor, pathColor, wallSize, pathSize, type, shadowColor, shadowBlur, goalColor, backgroundRects = { num: 0, border: "#FFF", fill: "#FFF" }, effects) {
    this.wallColor = wallColor;
    this.pathColor = pathColor;
    this.wallSize = wallSize;
    this.pathSize = pathSize;
    this.type = type;
    this.height = height;
    this.width = width;
    this.shadowColor = shadowColor;
    this.shadowBlur = shadowBlur;
    this.goalColor = goalColor;
    this.effects = effects;
    this.backgroundRects = {
      num: backgroundRects.num,
      border: backgroundRects.border,
      fill: backgroundRects.fill,
      rectInfo: [],
    };

    if (this.type === "labyrinth") {
      this.maze = Maze.generateMaze(new Grid(this.height, this.width));
      this.height = Math.floor(this.height / 2);
      this.width = Math.floor(this.width / 2);
      this.pathSize *= 2;
      this.maze.getCell(0, 0).up = false; 
    }
    else if (this.type === "maze") { 
      this.maze = Maze.generateMaze(new Grid(this.height, this.width));
      this.maze.getCell(0, 0).left = false; // creates entrance
      this.maze.getCell(this.maze.height - 1, this.maze.width - 1).right = false; // creates exit
    }
    else if (this.type === "maze2") { 
      this.maze = Maze.generateMazeRecursiveBacktracker(new Grid(this.height, this.width)); 
      this.maze.getCell(0, 0).left = false; // creates entrance
      this.maze.getCell(this.maze.height - 1, this.maze.width - 1).right = false; // creates exit
      
    }
    for (let i = 0; i < backgroundRects.num; i++) {
      this.backgroundRects.rectInfo.push({
        x: Math.floor(Math.random() * this.pathSize * this.width),
        y: Math.floor(Math.random() * this.pathSize * this.height),
        width: Math.floor(Math.random() * this.pathSize * this.width),
        height: Math.floor(Math.random() * this.pathSize * this.height),
      });
    }
    /* DOES NOT WORK FOR LABYRINTH! 
     * Labyrinth generates a growing tree maze and then trims itself in some weird way.
     * So it tracks deadends + branches from before the trim. It also doesn't work in general.
     * Needs to be fixed for solving but visually it's fine.
     */
    let { deadEnds, branches } = this.maze.countDeadEndsAndBranches();
    console.log("Number of dead ends:", deadEnds);
    console.log("Number of branches:", branches);
  }

  /**
   * Uses BFS to visit every cell in the maze for labyrinth generation
   * @param {Grid} grid
   * @returns {Array} an array that contains cell row, cell column, direction to move, and any special features of the cell
   */
  static generateLabyrinthPath(grid) {
    let currRow = 0;
    let currCol = 0;
    let vis = new Set();
    let queue = [[currRow, currCol, Dirs.DOWN, []]];
    const ret = [];
    while (queue.length > 0) {
      let [row, col, move, special] = queue.shift();
      let prevSpecial = [];
      let numWalls = 0;
      let cell = grid.getCell(row, col);

      if (vis.has(row + "-" + col)) {
        continue;
      }

      vis.add(row + "-" + col);
      if (cell.left) {
        numWalls++;
      }
      if (cell.right) {
        numWalls++;
      }
      if (cell.up) {
        numWalls++;
      }
      if (cell.down) {
        numWalls++;
      }
      if (numWalls == 3) {
        special.push("deadend");
      }

      if (grid.canMove(row, col, Dirs.DOWN)) {
        if (move === Dirs.LEFT || move === Dirs.RIGHT) {
          if ((move === Dirs.RIGHT && cell.right) || (move === Dirs.LEFT && cell.left)) {
            special.push("prechange");
          }
          prevSpecial = new Array("postchange");
        }
        queue.push([row + 1, col, Dirs.DOWN, prevSpecial]);
        prevSpecial = new Array();
      }
      if (grid.canMove(row, col, Dirs.RIGHT)) {
        if (move === Dirs.UP || move === Dirs.DOWN) {
          if ((move === Dirs.DOWN && cell.down) || (move === Dirs.UP && cell.up)) {
            special.push("prechange");
          }
          prevSpecial = new Array("postchange");
        }
        queue.push([row, col + 1, Dirs.RIGHT, prevSpecial]);
        prevSpecial = new Array();
      }
      if (grid.canMove(row, col, Dirs.UP)) {
        if (move === Dirs.LEFT || move === Dirs.RIGHT) {
          if ((move === Dirs.RIGHT && cell.right) || (move === Dirs.LEFT && cell.left)) {
            special.push("prechange");
          }
          prevSpecial = new Array("postchange");
        }
        queue.push([row - 1, col, Dirs.UP, prevSpecial]);
        prevSpecial = new Array();
      }
      if (grid.canMove(row, col, Dirs.LEFT)) {
        if (move === Dirs.UP || move === Dirs.DOWN) {
          if ((move === Dirs.DOWN && cell.down) || (move === Dirs.UP && cell.up)) {
            special.push("prechange");
          }
          prevSpecial = new Array("postchange");
        }
        queue.push([row, col - 1, Dirs.LEFT, prevSpecial]);
        prevSpecial = new Array();
      }

      ret.push([row, col, move, special]);
    }
    return ret;
  }

  /**
   * Generates a maze using Growing Tree
   * @param {Grid} grid
   * @returns {Grid} a grid with a generated maze
   */
  static generateMaze(grid) {
    let tempCol, tempRow, valid, pos, newRow, newCol, potDirs, beginUnravel;
    let currRow = Math.floor(Math.random() * grid.height);
    let currCol = Math.floor(Math.random() * grid.width);
    let stack = [];
    let dir = Dirs.DOWN;
    while (true) {
      beginUnravel = true;
      stack.push([currRow, currCol]);
      grid.setVis(currRow, currCol);
      potDirs = [Dirs.LEFT, Dirs.RIGHT, Dirs.UP, Dirs.DOWN];

      while (potDirs.length > 0) {
        if (potDirs.length == 1) {
          dir = potDirs.splice(0, 1)[0];
        } else {
          dir = potDirs.splice(Math.floor(Math.random() * potDirs.length), 1)[0];
        }

        if (grid.canRemoveAndUnvis(currRow, currCol, dir)) {
          [newRow, newCol] = grid.removeWall(currRow, currCol, dir);
          beginUnravel = false;
          break;
        }
      }

      if (beginUnravel) {
        while (stack.length > 0) {
          valid = false;
          pos = stack.pop();
          tempRow = pos[0];
          tempCol = pos[1];
          potDirs = [Dirs.LEFT, Dirs.RIGHT, Dirs.UP, Dirs.DOWN];

          while (potDirs.length > 0) {
            if (potDirs.length == 1) {
              dir = potDirs.splice(0, 1)[0];
            } else {
              dir = potDirs.splice(Math.floor(Math.random() * potDirs.length), 1)[0];
            }

            [newRow, newCol] = grid.getPos(tempRow, tempCol, dir);
            if (!grid.validPos(newRow, newCol)) {
              continue;
            }

            if (grid.isVis(newRow, newCol)) {
              continue;
            } else {
              grid.removeWall(tempRow, tempCol, dir);
              valid = true;
              break;
            }
          }

          if (valid) {
            break;
          }

          newRow = null;
          newCol = null;
        }

        if (newRow != null && newCol != null) {
          currRow = newRow;
          currCol = newCol;
        } else {
          return grid;
        }
      } else {
        currRow = newRow;
        currCol = newCol;
      }
    }
  }

  /**
   * Generates a maze using Recursive Backtracker algorithm
   * @param {Grid} grid
   * @returns {Grid} a grid with a generated maze
   */
  static generateMazeRecursiveBacktracker(grid) {
    //randomly select starting cell. column/row
    let currRow, currCol, startRow, startCol, visited, potDirs;
    potDirs = [Dirs.LEFT, Dirs.RIGHT, Dirs.UP, Dirs.DOWN];
    startRow = Math.floor(Math.random() * grid.height);
    startCol = Math.floor(Math.random() * grid.width);
    visited = []
    recursiveExplore(startRow, startCol); //begin exploring cells recursively
    function recursiveExplore(row, col) {
        visited.push(`${row},${col}`);     //mark the current cell as visited
        //randomize the order of directions. this way the maze doesn't just pick the same walls to go through (straight lines otherwise)
        shuffle(potDirs)
        for (let dir of potDirs) {
          [currRow, currCol] = grid.getPos(row, col, dir);
            //check if new (neighboring) cell is within bounds and not visited
            if (grid.validPos(currRow, currCol) && !visited.includes(`${currRow},${currCol}`)) {
                //remove the wall between the current cell and the new cell
                grid.removeWall(row, col, dir);
                //recursively explore the new cell
                recursiveExplore(currRow, currCol);
            }
        }
    }
    
    return grid;
  }

  /**
   * Draws labyrinth on canvas
   */
  drawLabyrinth() {
    const labyrinthPath = Maze.generateLabyrinthPath(this.maze);
    let context = this.drawMaze();
    let canvas = document.getElementById("maze-canvas");
    let context2 = canvas.offscreenCanvas2.getContext("2d");

    while (labyrinthPath.length > 0) {
      let [row, col, move, special] = labyrinthPath.shift();
      let x = col * this.pathSize + 10;
      let y = row * this.pathSize + 10;
      let specialPath = this.pathSize;
      let offset = 0;

      // half lines before corner, double after corner, deadends go to half
      if (move == Dirs.DOWN || move == Dirs.UP) {
        offset = 0;
        if ((special.includes("deadend") && move === Dirs.UP) || (special.includes("prechange") && move === Dirs.UP)) {
          offset = this.pathSize * 0.5;
        }
        if (special.includes("postchange") && move === Dirs.DOWN) {
          offset = this.pathSize * -0.5;
        }
        context.moveTo(x + this.pathSize / 2, y + offset);
        if ((special.includes("deadend") && move === Dirs.DOWN) || (special.includes("prechange") && move === Dirs.DOWN)) {
          specialPath = this.pathSize * 0.5;
        }
        if (special.includes("postchange") && move === Dirs.UP) {
          specialPath = this.pathSize * 1.5;
        }

        let diff = specialPath - offset;
        let val = diff / (this.pathSize / 2);
        let diffSplit = diff / val;
        if (this.effects == true) {
          for (let i = 0; i < val; i++) {
            context.bezierCurveTo(x + (3 * this.pathSize) / 4, y + offset + ((1 + 4 * i) * diffSplit) / 4, x + this.pathSize / 4, y + offset + ((3 + 4 * i) * diffSplit) / 4, x + this.pathSize / 2, y + offset + (1 + i) * (diff / val));
          }
          context2.lineTo(x + this.pathSize / 2, y + specialPath);
        } else {
          for (let i = 0; i < val; i++) {
            context2.bezierCurveTo(x + (3 * this.pathSize) / 4, y + offset + ((1 + 4 * i) * diffSplit) / 4, x + this.pathSize / 4, y + offset + ((3 + 4 * i) * diffSplit) / 4, x + this.pathSize / 2, y + offset + (1 + i) * (diff / val));
          }
          context.lineTo(x + this.pathSize / 2, y + specialPath);
        }
      }

      if (move == Dirs.LEFT || move == Dirs.RIGHT) {
        offset = 0;
        specialPath = this.pathSize;
        if ((special.includes("deadend") && move === Dirs.LEFT) || (special.includes("prechange") && move === Dirs.LEFT)) {
          offset = this.pathSize * 0.5;
        }
        if (special.includes("postchange") && move === Dirs.RIGHT) {
          offset = this.pathSize * -0.5;
        }

        context.moveTo(x + offset, y + this.pathSize / 2);
        if ((special.includes("deadend") && move === Dirs.RIGHT) || (special.includes("prechange") && move === Dirs.RIGHT)) {
          specialPath = this.pathSize * 0.5;
        }
        if (special.includes("postchange") && move === Dirs.LEFT) {
          specialPath = this.pathSize * 1.5;
        }
        let diff = specialPath - offset;
        let val = diff / (this.pathSize / 2);
        let diffSplit = diff / val;
        if (this.effects == true) {
          for (let i = 0; i < val; i++) {
            context.bezierCurveTo(x + offset + ((1 + 4 * i) * diffSplit) / 4, y + (1 * this.pathSize) / 4, x + offset + ((3 + 4 * i) * diffSplit) / 4, y + (3 * this.pathSize) / 4, x + offset + (1 + i) * (diff / val), y + this.pathSize / 2);
          }
          context2.lineTo(x + specialPath, y + this.pathSize / 2);
        } else {
          for (let i = 0; i < val; i++) {
            context2.bezierCurveTo(x + offset + ((1 + 4 * i) * diffSplit) / 4, y + (1 * this.pathSize) / 4, x + offset + ((3 + 4 * i) * diffSplit) / 4, y + (3 * this.pathSize) / 4, x + offset + (1 + i) * (diff / val), y + this.pathSize / 2);
          }
          context.lineTo(x + specialPath, y + this.pathSize / 2);
        }
      }
    }
    context.stroke();
  }

  /**
   * Draws a maze on the canvas
   * @returns {CanvasRenderingContext2D}
   */
  drawMaze() {
    let canvas = document.getElementById("maze-canvas");

    let effectOffset = this.effect ? 15 : 0;
    canvas.setAttribute(
      "height",
      this.pathSize * this.maze.height + 1 + effectOffset + 5 + 20 //get rid of 20 and 5 for original
    );
    canvas.setAttribute(
      "width",
      this.pathSize * this.maze.width + 1 + effectOffset + 5 + 20 //get rid of 20 and 5 for original
    );

    canvas.offscreenCanvas = document.createElement("canvas");
    canvas.offscreenCanvas2 = document.createElement("canvas"); //for image of other maze

    canvas.offscreenCanvas.setAttribute(
      "width",
      this.pathSize * this.maze.width + 10 + 20 //get rid of 20 for original
    );
    canvas.offscreenCanvas.setAttribute(
      "height",
      this.pathSize * this.maze.height + 10 + 20 //get rid of 20 for original
    );
    canvas.offscreenCanvas2.setAttribute(
      "width",
      this.pathSize * this.maze.width + 10 + 20 //get rid of 20 for original
    );
    canvas.offscreenCanvas2.setAttribute(
      "height",
      this.pathSize * this.maze.height + 10 + 20 //get rid of 20 for original
    );
    let context = canvas.offscreenCanvas.getContext("2d");
    let context2 = canvas.offscreenCanvas2.getContext("2d");
    context.lineCap = "square";
    context.translate(0.5, 0.5);
    context.lineWidth = this.wallSize;
    context.fillStyle = this.pathColor;
    context.fillRect(0, 0, this.maze.width * this.pathSize + 1 + 25, this.maze.height * this.pathSize + 1 + 25);
    context.beginPath();
    context.globalAlpha = 0.5;
    context.fillStyle = this.backgroundRects.fill;
    context.strokeStyle = this.backgroundRects.border;

    context2.lineCap = "square";
    context2.translate(0.5, 0.5);
    context2.lineWidth = this.wallSize;
    context2.fillStyle = this.pathColor;
    context2.fillRect(0, 0, this.maze.width * this.pathSize + 1 + 25, this.maze.height * this.pathSize + 1 + 25);
    context2.beginPath();
    context2.globalAlpha = 0.5;
    context2.fillStyle = this.backgroundRects.fill;
    context2.strokeStyle = this.backgroundRects.border;

    this.backgroundRects.rectInfo.forEach((rect) => {
      context.rect(rect.x, rect.y, rect.width, rect.height);
      context.fill();
      context2.rect(rect.x, rect.y, rect.width, rect.height);
      context2.fill();
    });

    context.stroke();
    context.beginPath();
    context.globalAlpha = 1;
    context.fillStyle = this.goalColor;

    context2.stroke();
    context2.beginPath();
    context2.globalAlpha = 1;
    context2.fillStyle = this.goalColor;
    if (this.type === "maze"|| this.type === "maze2") {
      context.fillRect(this.maze.width * this.pathSize - this.pathSize * 0.85 + 10, this.maze.height * this.pathSize - this.pathSize * 0.85 + 10, this.pathSize * 0.7, this.pathSize * 0.7);
      context2.fillRect(this.maze.width * this.pathSize - this.pathSize * 0.85 + 10, this.maze.height * this.pathSize - this.pathSize * 0.85 + 10, this.pathSize * 0.7, this.pathSize * 0.7);
    } else {
      context.fillRect(this.pathSize / 2 + this.pathSize * 0.075 + 10, this.pathSize * 0.075 + 10, this.pathSize / 2 - this.pathSize * 0.15, this.pathSize / 2 - this.pathSize * 0.15);
      context2.fillRect(this.pathSize / 2 + this.pathSize * 0.075 + 10, this.pathSize * 0.075 + 10, this.pathSize / 2 - this.pathSize * 0.15, this.pathSize / 2 - this.pathSize * 0.15);
    }

    context.strokeStyle = this.wallColor;
    context.shadowColor = this.shadowColor;
    context.shadowBlur = this.shadowBlur;
    context2.strokeStyle = this.wallColor;
    context2.shadowColor = this.shadowColor;
    context2.shadowBlur = this.shadowBlur;
    for (let i = 0; i < this.maze.height; i++) {
      for (let j = 0; j < this.maze.width; j++) {
        let x = j * this.pathSize + 10;
        let y = i * this.pathSize + 10;
        let cell = this.maze.getCell(i, j);
        console.log("This:" + this.pathSize);
        if (this.effects === true) {
          if (cell.left) {
            context.moveTo(x, y);
            if (this.type === "maze"|| this.type === "maze2") {
              context.bezierCurveTo(x + this.pathSize / 2, y + this.pathSize / 4, x - this.pathSize / 2, y + (3 * this.pathSize) / 4, x, y + this.pathSize);
            } else {
              context.bezierCurveTo(x + this.pathSize / 4, y + this.pathSize / 8, x - this.pathSize / 4, y + (3 * this.pathSize) / 8, x, y + this.pathSize / 2);
              context.bezierCurveTo(x + this.pathSize / 4, y + (5 * this.pathSize) / 8, x - this.pathSize / 4, y + (7 * this.pathSize) / 8, x, y + this.pathSize);
            }

            context2.moveTo(x, y);
            context2.lineTo(x, y + this.pathSize);
          }
          if (cell.right) {
            context.moveTo(x + this.pathSize, y);
            if (this.type === "maze"|| this.type === "maze2") {
              context.bezierCurveTo(x + (3 * this.pathSize) / 2, y + this.pathSize / 4, x + this.pathSize / 2, y + (3 * this.pathSize) / 4, x + this.pathSize, y + this.pathSize);
            } else {
              context.bezierCurveTo(x + (5 * this.pathSize) / 4, y + this.pathSize / 8, x + (3 * this.pathSize) / 4, y + (3 * this.pathSize) / 8, x + this.pathSize, y + this.pathSize / 2);
              context.bezierCurveTo(x + (5 * this.pathSize) / 4, y + (5 * this.pathSize) / 8, x + (3 * this.pathSize) / 4, y + (7 * this.pathSize) / 8, x + this.pathSize, y + this.pathSize);
            }

            context2.moveTo(x + this.pathSize, y);
            context2.lineTo(x + this.pathSize, y + this.pathSize);
          }
          if (cell.up) {
            context.moveTo(x, y);
            if (this.type === "maze"|| this.type === "maze2") {
              context.bezierCurveTo(x + this.pathSize / 4, y - this.pathSize / 2, x + (3 * this.pathSize) / 4, y + this.pathSize / 2, x + this.pathSize, y);
            } else {
              context.bezierCurveTo(x + this.pathSize / 8, y - this.pathSize / 4, x + (3 * this.pathSize) / 8, y + this.pathSize / 4, x + this.pathSize / 2, y);
              context.bezierCurveTo(x + (5 * this.pathSize) / 8, y - this.pathSize / 4, x + (7 * this.pathSize) / 8, y + this.pathSize / 4, x + this.pathSize, y);
            }

            context2.moveTo(x, y);
            context2.lineTo(x + this.pathSize, y);
          }
          if (cell.down) {
            context.moveTo(x, y + this.pathSize);
            if (this.type === "maze"|| this.type === "maze2") {
              context.bezierCurveTo(x + this.pathSize / 4, y + this.pathSize - this.pathSize / 2, x + (3 * this.pathSize) / 4, y + this.pathSize + this.pathSize / 2, x + this.pathSize, y + this.pathSize);
            } else {
              context.bezierCurveTo(x + this.pathSize / 8, y + this.pathSize - this.pathSize / 4, x + (3 * this.pathSize) / 8, y + this.pathSize + this.pathSize / 4, x + this.pathSize / 2, y + this.pathSize);
              context.bezierCurveTo(x + (5 * this.pathSize) / 8, y + this.pathSize - this.pathSize / 4, x + (7 * this.pathSize) / 8, y + this.pathSize + this.pathSize / 4, x + this.pathSize, y + this.pathSize);
            }

            context2.moveTo(x, y + this.pathSize);
            context2.lineTo(x + this.pathSize, y + this.pathSize);
          }
        } else {
          if (cell.left) {
            context.moveTo(x, y);
            context.lineTo(x, y + this.pathSize);
            context2.moveTo(x, y);
            if (this.type === "maze"|| this.type === "maze2") {
              context2.bezierCurveTo(x + this.pathSize / 2, y + this.pathSize / 4, x - this.pathSize / 2, y + (3 * this.pathSize) / 4, x, y + this.pathSize);
            } else {
              context2.bezierCurveTo(x + this.pathSize / 4, y + this.pathSize / 8, x - this.pathSize / 4, y + (3 * this.pathSize) / 8, x, y + this.pathSize / 2);
              context2.bezierCurveTo(x + this.pathSize / 4, y + (5 * this.pathSize) / 8, x - this.pathSize / 4, y + (7 * this.pathSize) / 8, x, y + this.pathSize);
            }
          }
          if (cell.right) {
            context.moveTo(x + this.pathSize, y);
            context.lineTo(x + this.pathSize, y + this.pathSize);
            context2.moveTo(x + this.pathSize, y);
            if (this.type === "maze"|| this.type === "maze2") {
              context2.bezierCurveTo(x + (3 * this.pathSize) / 2, y + this.pathSize / 4, x + this.pathSize / 2, y + (3 * this.pathSize) / 4, x + this.pathSize, y + this.pathSize);
            } else {
              context2.bezierCurveTo(x + (5 * this.pathSize) / 4, y + this.pathSize / 8, x + (3 * this.pathSize) / 4, y + (3 * this.pathSize) / 8, x + this.pathSize, y + this.pathSize / 2);
              context2.bezierCurveTo(x + (5 * this.pathSize) / 4, y + (5 * this.pathSize) / 8, x + (3 * this.pathSize) / 4, y + (7 * this.pathSize) / 8, x + this.pathSize, y + this.pathSize);
            }
          }
          if (cell.up) {
            context.moveTo(x, y);
            context.lineTo(x + this.pathSize, y);
            context2.moveTo(x, y);
            if (this.type === "maze"|| this.type === "maze2") {
              context2.bezierCurveTo(x + this.pathSize / 4, y - this.pathSize / 2, x + (3 * this.pathSize) / 4, y + this.pathSize / 2, x + this.pathSize, y);
            } else {
              context2.bezierCurveTo(x + this.pathSize / 8, y - this.pathSize / 4, x + (3 * this.pathSize) / 8, y + this.pathSize / 4, x + this.pathSize / 2, y);
              context2.bezierCurveTo(x + (5 * this.pathSize) / 8, y - this.pathSize / 4, x + (7 * this.pathSize) / 8, y + this.pathSize / 4, x + this.pathSize, y);
            }
          }
          if (cell.down) {
            context.moveTo(x, y + this.pathSize);
            context.lineTo(x + this.pathSize, y + this.pathSize);
            context2.moveTo(x, y + this.pathSize);
            if (this.type === "maze" || this.type === "maze2") {
              context2.bezierCurveTo(x + this.pathSize / 4, y + this.pathSize - this.pathSize / 2, x + (3 * this.pathSize) / 4, y + this.pathSize + this.pathSize / 2, x + this.pathSize, y + this.pathSize);
            } else {
              context2.bezierCurveTo(x + this.pathSize / 8, y + this.pathSize - this.pathSize / 4, x + (3 * this.pathSize) / 8, y + this.pathSize + this.pathSize / 4, x + this.pathSize / 2, y + this.pathSize);
              context2.bezierCurveTo(x + (5 * this.pathSize) / 8, y + this.pathSize - this.pathSize / 4, x + (7 * this.pathSize) / 8, y + this.pathSize + this.pathSize / 4, x + this.pathSize, y + this.pathSize);
            }
          }
        }
      }
    }

    context.stroke();
    context2.stroke();

    return context;
  }

  draw() {
    if (this.type === "maze" || this.type == "maze2") {
      this.drawMaze();
    } else if (this.type === "labyrinth") {
      this.drawLabyrinth();
    }
  }
}
