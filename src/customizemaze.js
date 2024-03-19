import Maze from "./maze.js";
      import {
        downloadObjectAsJson,
        msToTime,
        rgbToHex,
        hexToRgb,
      } from "./utils.js";

      const mazes = [];
      let maze = null;
      const completedTrials = [];
      let mazeVals = null;
      let mouseIsDown = false;
      let lastX = 0;
      let lastY = 0;
      let userIcon = null;
      let startTime = null;
      let endTime = null;
      let pixelsTraveled = 0;
      const canvas = document.getElementById("maze-canvas");
      let offsetX = canvas.getBoundingClientRect().left;
      let offsetY = canvas.getBoundingClientRect().top;
      let context = canvas.getContext("2d", { willReadFrequently: true });

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

      window.onload = function () {
        canvas.addEventListener("mousedown", handleDown);

        canvas.addEventListener("mouseup", handleUp);

        canvas.addEventListener("mousemove", handleMouseMove);

        canvas.addEventListener("touchstart", handleDown);

        canvas.addEventListener("touchend", handleUp);

        canvas.addEventListener("touchmove", handleMouseMove);

        canvas.addEventListener("mouseleave", () => {
          mouseIsDown = false;
        });
      };

      /**
       * Checks that there are no conflicting maze colors.
       */
      function validateMazeColors(
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

      function clearTrial() {
        mazes.length = 0;
        document.querySelector("#start-btn").disabled = true;
        document.querySelector(".maze-table").replaceChildren();
      }

      function addMaze() {
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

  function startGame() {
    const timerElem = document.getElementById("time");
    completedTrials.length = 0;
    timerElem.innerHTML = "";

    // Ensure mazes array is not empty before shifting
    if (mazes.length === 0) {
        console.error("No maze configurations available.");
        return;
    }

    // Retrieve mazeVals from mazes array
    const mazeVals = mazes.shift();

    // Ensure that mazeVals is defined
    if (!mazeVals) {
        console.error("Invalid maze configuration.");
        return;
    }

    resetUserIcon();
    document.querySelector("#add-maze").disabled = true;
    document.querySelector(".maze-table").replaceChildren();
    document.querySelector("#start-btn").disabled = true;

    // Initialize maze object
    maze = new Maze(
        mazeVals.height,
        mazeVals.width,
        mazeVals.wallColor,
        mazeVals.pathColor,
        mazeVals.wallSize,
        mazeVals.pathSize,
        mazeVals.design,
        mazeVals.shadowColor,
        mazeVals.shadowBlur,
        mazeVals.goalColor,
        mazeVals.backgroundRects,
        mazeVals.effects
    );

    // Check if maze object is successfully created
    if (!maze) {
        console.error("Failed to create maze object.");
        return;
    }

    canvas.style.filter = `blur(${mazeVals.blur}px)`;
    maze.draw();
    document.querySelector("#download-btn").hidden = false;
    drawFrame();
    document.getElementById("maze-canvas").scrollIntoView();
    startTime = new Date();
}

    

      function nextMaze() {
        mouseIsDown = false;
        endTime = new Date();
        completedTrials.push({
          maze: {
            values: mazeVals,
            solveTime: msToTime(endTime - startTime),
            pixelsTraveled: pixelsTraveled,
          },
        });
        pixelsTraveled = 0;
        if (mazes.length === 0) {
          const timerElem = document.getElementById("time");
          timerElem.innerHTML = `Time: ${msToTime(endTime - startTime)}`;
          canvas.width = 0;
          canvas.height = 0;
          document.querySelector("#download-btn").hidden = true;
          document.querySelector("#add-maze").disabled = false;
          downloadObjectAsJson(
            completedTrials,
            `trial-results-${startTime.getFullYear()}-${startTime.getMonth()}-${startTime.getDate()}-${startTime.getHours()}-${startTime.getMinutes()}-${startTime.getSeconds()}`
          );
          return;
        }
        mazeVals = mazes.shift();
        resetUserIcon();
        maze = new Maze(
          mazeVals.height,
          mazeVals.width,
          mazeVals.wallColor,
          mazeVals.pathColor,
          mazeVals.wallSize,
          mazeVals.pathSize,
          mazeVals.design,
          mazeVals.shadowColor,
          mazeVals.shadowBlur,
          mazeVals.goalColor,
          mazeVals.backgroundRects,
          mazeVals.effects
        );
        canvas.style.filter = `blur(${mazeVals.blur}px)`;
        maze.draw();
        drawFrame();
        document.getElementById("maze-canvas").scrollIntoView();
      }

      function handleMouseMove(event) {
        event.preventDefault();
        if (!mouseIsDown) {
          return;
        }

        let clientX = event.clientX
          ? event.clientX
          : event.targetTouches[0].clientX;
        let clientY = event.clientY
          ? event.clientY
          : event.targetTouches[0].clientY;
        let mouseX = parseInt(clientX - offsetX);
        let mouseY = parseInt(clientY - offsetY);
        let diffX = mouseX - lastX;
        let diffY = mouseY - lastY;
        let destX = userIcon.x + diffX;
        let destY = userIcon.y + diffY;

        if (
          Math.abs(diffX) < userIcon.width &&
          Math.abs(diffY) < userIcon.height
        ) {
          let canMove = canMoveTo(destX, destY);
          if (canMove === 1) {
            pixelsTraveled += diffX + diffY;
            userIcon.x += diffX;
            userIcon.y += diffY;
          } else if (canMove == 2) {
            nextMaze();
          }
        }
        lastX = mouseX;
        lastY = mouseY;
        drawFrame();
      }

      function handleUp(event) {
        event.preventDefault();
        mouseIsDown = false;
      }

      function handleDown(event) {
        event.preventDefault();
        let clientX = event.clientX
          ? event.clientX
          : event.targetTouches[0].clientX;
        let clientY = event.clientY
          ? event.clientY
          : event.targetTouches[0].clientY;
        let mouseX = parseInt(clientX - offsetX);
        let mouseY = parseInt(clientY - offsetY);

        lastX = mouseX;
        lastY = mouseY;
        mouseIsDown = true;
      }

      function drawFrame() {
        context.beginPath();
        context.drawImage(canvas.offscreenCanvas, 0, 0);
        drawUserIcon();
      }

      function downloadMaze() {
        canvas.offscreenCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a"); // Or maybe get it from the current document
          link.href = url;
          link.download = `${mazeVals.width}x${mazeVals.height}-${mazeVals.pathColor}-path-${mazeVals.wallColor}-wall-${mazeVals.design}.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
        canvas.offscreenCanvas2.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a"); // Or maybe get it from the current document
          link.href = url;
          link.download = `${mazeVals.width}x${mazeVals.height}-${mazeVals.pathColor}-path-${mazeVals.wallColor}-wall-${mazeVals.design}.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
      }

      function drawUserIcon() {
        context.beginPath();
        context.shadowColor = "transparent";
        context.fillStyle = userIcon.color;
        context.fillRect(
          userIcon.x,
          userIcon.y,
          userIcon.width,
          userIcon.height
        );
      }

      /**
       * Checks if the user icon can move to the given coordinates
       * @param {number} destX The x coordinate to move to
       * @param {number} destY The y coordinate to move to
       * @returns {number} 0 if the user icon cannot move to the given coordinates, 1 if it can, and 2 if it has reached the goal
       */
      function canMoveTo(destX, destY) {
        let imgData = context.getImageData(
          destX,
          destY,
          userIcon.width + 1,
          userIcon.height + 1
        ).data;
        let canMove = 1;
        let rgb = null;

        if (
          destX >= 0 &&
          destX <= mazeVals.width * mazeVals.pathSize - userIcon.width +10 &&
          destY >= 0 &&
          destY <= mazeVals.height * mazeVals.pathSize - userIcon.height +10
        ) {
          // check if in bounds
          for (let i = 0; i < imgData.length; i += 4) {
            rgb = rgbToHex(imgData[i], imgData[i + 1], imgData[i + 2]);
            if (rgb === mazeVals.wallColor) {
              canMove = 0;
              break;
            } else if (rgb === mazeVals.goalColor) {
              canMove = 2;
              break;
            }
          }
        } else {
          canMove = 0;
        }
        return canMove;
      }

      function resetUserIcon() {
        userIcon = {
          width: mazeVals.pathSize * 0.5,
          height: mazeVals.pathSize * 0.5,
          x: mazeVals.pathSize * 0.125,
          y: mazeVals.pathSize * 0.125,
          color: mazeVals.userIconColor,
        };
      }

      window.addMaze = addMaze;
      window.startGame = startGame;
      window.clearTrial = clearTrial;
      window.downloadMaze = downloadMaze;
