import Maze from "./maze.js";
import {
  downloadObjectAsJson,
  msToTime,
  rgbToHex,
  hexToRgb,
} from "./utils.js";

export let mazes = [];
export let mazeVals = null;

const handleFileSelect = (event) => {
  const selectedFile = event.target.files[0];

  // Create a file reader
  const reader = new FileReader();

  // Handle the file loading
  reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
          // Draw the image on the canvas as the background
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = e.target.result;
  };

  // Read the file as a data URL
  reader.readAsDataURL(selectedFile);
};
// Attach an event listener to the file input element
const fileInput = document.getElementById('image-input');
fileInput.addEventListener('change', handleFileSelect);

/**
 * Checks that there are no conflicting maze colors.
 */
export function validateMazeColors(
  pathColor,
  wallColor,
  backgroundRectBorderColor,
  backgroundRectFillColor,
  userIconColor,
  goalColor
) {
  const colorCombinations = {
    [pathColor === wallColor]:
      "Path color and wall color cannot be the same.",
    [wallColor === backgroundRectBorderColor]:
      "Wall color and background rectangle border color cannot be the same.",
    [wallColor === backgroundRectFillColor]:
      "Wall color and background rectangle fill color cannot be the same.",
    [goalColor === backgroundRectFillColor]:
      "Goal color and background rectangle fill color cannot be the same.",
    [goalColor === backgroundRectBorderColor]:
      "Goal color and background rectangle border color cannot be the same.",
    [userIconColor === goalColor]:
      "Goal color and user icon color cannot be the same.",
    [wallColor === userIconColor]:
      "Wall color and user icon color cannot be the same.",
    [goalColor === wallColor]:
      "Goal color and wall color cannot be the same.",
    [pathColor === goalColor]:
      "Path color and goal color cannot be the same.",
  };

  for (const condition in colorCombinations) {
    if (condition === true) {
      alert(colorCombinations[condition]);
      return false;
    }
  }

  return true;
}

export function clearTrial() {
  mazes.length = 0;
  document.querySelector("#start-btn").disabled = true;
  document.querySelector(".maze-table").replaceChildren();
}

export function addMaze() {
  event.preventDefault();

  const mazeDesignValue = document.querySelector(
    'input[name="maze-design"]:checked'
  ).value;
  const blurValue = parseInt(document.querySelector("#blur-value").value);
  const pathColorValue = document.querySelector("#path-color").value;
  const wallColorValue = document.querySelector("#wall-color").value;
  const backgroundRectBorderValue =
    document.querySelector("#border-rect-color").value;
  const backgroundRectFillValue =
    document.querySelector("#fill-rect-color").value;
  const backgroundRectNumValue = parseInt(
    document.querySelector("#rect-num").value
  );
  const userIconColorValue =
    document.querySelector("#user-icon-color").value;
  const goalColorValue = document.querySelector("#goal-color").value;
  const widthValue = parseInt(document.querySelector("#width").value);
  const heightValue = parseInt(document.querySelector("#height").value);
  const shadowColorValue = document.querySelector("#shadow-color").value;
  const effectsValue = document.querySelector("#wavy").checked;
  const shadowBlurValue = parseInt(
    document.querySelector("#shadow-blur").value
  );
  const pathSizeValue = parseInt(
    document.querySelector("#path-size").value
  );
  const wallSizeValue = parseInt(
    document.querySelector("#wall-size").value
  );

  if (
    !validateMazeColors(
      pathColorValue,
      wallColorValue,
      backgroundRectBorderValue,
      backgroundRectFillValue,
      userIconColorValue,
      goalColorValue
    )
  ) {
    return;
  }

  mazeVals = {
  design: mazeDesignValue,
  pathColor: pathColorValue,
  wallColor: wallColorValue,
  width: widthValue,
  height: heightValue,
  pathSize: pathSizeValue,
  blur: blurValue,
  wallSize: wallSizeValue,
  shadowBlur: shadowBlurValue,
  shadowColor: shadowColorValue,
  userIconColor: userIconColorValue,
  goalColor: goalColorValue,
  backgroundRects: {
      num: backgroundRectNumValue,
      border: backgroundRectBorderValue,
      fill: backgroundRectFillValue,
  },
  effects: effectsValue,
  };

  // Ensure that mazes array is defined before pushing
  if (!Array.isArray(mazes)) {
      mazes = [];
  }

  // Push the mazeVals object into the mazes array
  mazes.push(mazeVals);

  document.querySelector("#start-btn").disabled = false;
  const table = document.querySelector(".maze-table");
  const tr = document.createElement("tr");
  const values = [
      widthValue,
      heightValue,
      pathSizeValue,
      pathColorValue,
      wallColorValue,
  ];
  for (const value of values) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
  }

  table.appendChild(tr);
}

window.addMaze = addMaze;
window.clearTrial = clearTrial;
