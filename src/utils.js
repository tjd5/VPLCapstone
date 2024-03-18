/**
 * Dirs enum
 */
export const Dirs = {
  LEFT: 1,
  RIGHT: 2,
  UP: 3,
  DOWN: 4,
};

/**
 * Downloads given object as json
 * @param {Object} exportObj Object to download
 * @param {String} exportName Name of downloaded file
 */
export function downloadObjectAsJson(exportObj, exportName) {
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 4));
  let downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

/**
 * Converts ms to HH:mm:ss:ms time format
 * @param {Integer} duration  time to convert
 * @returns {String} formatted time
 */
export function msToTime(duration) {
  let milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function hexToRgb(hex) {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return r + "," + g + "," + b;
}
//used in recursive backtracker in maze.js | https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/* Ideally for controling the number of intersections (WIP)

export function backtrack (currRow, currCol, maxIntersections) {
  const neighbors = this.getneighbors(row, col); 
  neighbors.sort(() => Math.random() -0.5); //Random neighbor order

  let intersections = 0 
  for (const [currRow, next CurCol] of nieghbors) {
    if (!this.visited.has(`${currRow},${currCol}`)) {
        this.visited.add(`${currRow},${currCol}`);
        this.grid[currRow][currCol] = 0; // Mark cell as empty

        intersections++; // Increment intersections counter
        if (intersections <= maxIntersections) {
          this.backtrack(currRow, currCol, maxIntersections);
        }

        if (intersections > maxIntersections) {
          this.grid[currRow][currCol] = 1; // Restore wall if exceeding intersections limit
  }
}
*/ 