const gOptions = {
  enableFilter: false,
  threshold: 0.12,
};

let tessWorker = undefined;
let gImg;
let gCapture;
let decodeMode = undefined;
const decodeModePicture = 0;
const decodeModeCamera = 1;

let input;
let decordedText = '';
let isDecoding = false;
let isDrawingFrame = false;
let frameInfo = undefined;
let displayImageInfo = undefined;
let isDatGUIChanged = false;

const thresholdVal = 0.12;

let fileFolderPict;
let cameraPict;
let housePict;
let hedgehogPict;
let handPict;

let handTutorialStartCount = undefined;

function preload() {
  (async () => {
    tessWorker = await Tesseract.createWorker('ztmy', 0, {
      langPath: './tesseract/',
      gzip: false,
    });
  })();

  // fileFolderPict = loadImage("./images/file_folder_color.svg");
  fileFolderPict = loadImage('./images/file_folder_3d.png');
  // cameraPict = loadImage("./images/camera_color.svg");
  cameraPict = loadImage('./images/camera_3d.png');
  // housePict = loadImage("./images/house_color.svg");
  housePict = loadImage('./images/house_3d.png');
  // hedgehogPict = loadImage("./images/hedgehog_color.svg");
  hedgehogPict = loadImage('./images/hedgehog_3d.png');
  chestnutPict = loadImage('./images/chestnut_3d.png');
  handPict = loadImage('./images/hand_3d.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight).drop(handleFile);
  // Prepare GUI
  prepareDatGUI(gOptions);
  pixelDensity(1);

  strokeWeight(3);
  angleMode(DEGREES);

  textFont('Noto Sans JP');
  textAlign(LEFT, TOP);
  textSize(max(width, height) / 40);
  textWrap(CHAR);
  imageMode(CENTER);
  input = createFileInput(handleFile);
  input.position((15 * height) / 20, height / 3.5);
  input.style('display', 'none');
}

function draw() {
  background(220);

  if (decodeMode === undefined) {
    drawModeSelector();
  } else {
    // Draw upper half of screen
    if (decodeMode === decodeModePicture) {
      drawTargetPicture();
      drawHandTutorial();
    } else if (decodeMode === decodeModeCamera) {
      drawVideoCapture();
      drawGuideLine();
      drawHandTutorial();
    }
    drawFrame();

    // Draw lower half of screen
    drawDecordTextRegion();
    drawHomeButton();
  }
}

const drawHandTutorial = () => {
  if (handTutorialStartCount) {
    const diffCount = frameCount - handTutorialStartCount;
    if (diffCount < 150) {
      push();
      {
        fill('#000000AA');
        noStroke();
        rect(0, 0, width, height);
      }
      pop();
      const coeff = map(easeInOutQuart(diffCount / 150), 0, 1, 2, 3);
      push();
      {
        noFill();
        strokeWeight(height / 200);
        stroke('#a7c957');
        rect(
          (4 * width) / 10,
          (2 * height) / 10,
          ((2 * coeff - 4) * width) / 10,
          ((coeff - 2) * height) / 10
        );
      }
      pop();
      image(
        handPict,
        (2.01 * coeff * width) / 10,
        (1.06 * coeff * height) / 10,
        height / 20,
        height / 20
      );
    }
  }
};

function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
}

const drawTargetPicture = () => {
  if (gImg) {
    let imageWidth;
    let imageHeight;
    if (gImg.height > gImg.width) {
      // Portrait
      imageHeight = min(gImg.height, height / 2);
      imageWidth = (gImg.width * imageHeight) / gImg.height;

      if (imageWidth > width) {
        imageHeight = (imageHeight * width) / imageWidth;
        imageWidth = width;
      }
    } else {
      // Landscape
      imageWidth = min(gImg.width, width);
      imageHeight = (gImg.height * imageWidth) / gImg.width;

      if (imageHeight > height / 2) {
        imageWidth = (imageWidth * height) / 2 / imageHeight;
        imageHeight = height / 2;
      }
    }
    // console.log(imageHeight,gImg.height, height/2)

    push();
    translate(width / 2, height / 4);
    image(gImg, 0, 0, imageWidth, imageHeight);
    pop();
    if (options.enableFilter) {
      filter(THRESHOLD, options.threshold);
    }

    displayImageInfo = {
      x: width / 2 - imageWidth / 2,
      y: height / 4 - imageHeight / 2,
      w: imageWidth,
      h: imageHeight,
    };
    // console.log(displayImageInfo)
  }
};

const drawVideoCapture = () => {
  if (gCapture) {
    gImg = gCapture;

    let imageWidth;
    let imageHeight;
    if (gImg.height > gImg.width) {
      // Portrait
      imageHeight = min(gImg.height, height / 2);
      imageWidth = (gImg.width * imageHeight) / gImg.height;

      if (imageWidth > width) {
        imageHeight = (imageHeight * width) / imageWidth;
        imageWidth = width;
      }
    } else {
      // Landscape
      imageWidth = min(gImg.width, width);
      imageHeight = (gImg.height * imageWidth) / gImg.width;

      if (imageHeight > height / 2) {
        imageWidth = (imageWidth * height) / 2 / imageHeight;
        imageHeight = height / 2;
      }
    }
    // console.log(imageHeight,gImg.height, height/2)

    push();
    translate(width / 2, height / 4);
    image(gImg, 0, 0, imageWidth, imageHeight);
    pop();
    if (options.enableFilter) {
      filter(THRESHOLD, options.threshold);
    }

    displayImageInfo = {
      x: width / 2 - imageWidth / 2,
      y: height / 4 - imageHeight / 2,
      w: imageWidth,
      h: imageHeight,
    };
    // console.log(displayImageInfo)
  }
};

const drawDecordTextRegion = () => {
  rect(-20, height / 2, width + 20, height / 2 + 20);
  if (isDecoding) {
    push();
    textAlign(CENTER, CENTER);
    textSize(width / 10);
    text(String.fromCodePoint(0x1f311 + (floor(frameCount / 5) % 8)), width / 2, (3 * height) / 4);
    pop();
  } else {
    text(decordedText, width / 10, height / 2 + height / 10);
  }
};

const drawHomeButton = () => {
  push();
  textAlign(CENTER, CENTER);
  textSize(50);
  // text('🏠', 50, height - 50);
  image(housePict, 50, height - 50, 50, 50);

  pop();
};

const drawModeSelector = () => {
  push();
  {
    textAlign(CENTER, CENTER);
    textSize(height / 25);
    text("'ZTMY Font' Decorder", width / 2, height / 10);
    image(hedgehogPict, width / 2 - (height / 25) * 6.2, height / 10.4, height / 20, height / 20);
    image(hedgehogPict, width / 2 + (height / 25) * 6.2, height / 10.4, height / 20, height / 20);

    rectMode(CENTER);
    strokeCap(ROUND);

    noStroke();
    textSize(height / 6);
    square(width / 2, (7 * height) / 20, height / 3.5, height / 20);
    // text('📷', width / 2, (6.5 * height) / 20);
    image(cameraPict, width / 2, (6.5 * height) / 20, height / 5, height / 5);

    stroke(80);
    strokeWeight(height / 200);
    drawingContext.setLineDash([height / 100, height / 100]);
    square(width / 2, (15 * height) / 20, height / 3.5, height / 20);
    // text('📁', width / 2, (14.8 * height) / 20);
    image(fileFolderPict, width / 2, (14.8 * height) / 20, height / 5, height / 5);
  }
  pop();
};

function handleFile(file) {
  if (file.type === 'image') {
    // Remove the current image, if any.
    if (gImg) {
      gImg.remove();
      frameInfo = undefined;
      displayImageInfo = undefined;
    }

    // console.log(file);
    createImg(file.data, '', '', (img) => {
      gImg = img;
      //    console.log(gImg)
      gImg.hide();
      decodeMode = decodeModePicture;
      if (handTutorialStartCount === undefined) {
        // First time only
        handTutorialStartCount = frameCount;
      }

      const gpx = createGraphics(gImg.width, gImg.height);
      gpx.image(gImg, 0, 0);
      if (options.enableFilter) {
        filter(THRESHOLD, options.threshold);
      }
      image(gpx, width / 2, (3 * height) / 4, gpx.width, gpx.height);

      decode();
    });
  }
}

function mouseClicked() {
  if (decodeMode === undefined) {
    if (mouseY > (12 * height) / 20) {
      input.elt.click();
    } else if (mouseY > (3 * height) / 20) {
      decodeMode = decodeModeCamera;
      if (handTutorialStartCount === undefined) {
        // First time only
        handTutorialStartCount = frameCount;
      }
      const constraints = {
        video: {
          facingMode: 'environment',
        },
        audio: false,
      };
      gCapture = createCapture(constraints);
      gCapture.hide();
    }
  } else {
    if (dist(50, height - 50, mouseX, mouseY) < 50) {
      decodeMode = undefined;
      frameInfo = undefined;
    }
  }
}

// https://qiita.com/mimoe/items/855c112625d39b066c9a
function hiraToKana(str) {
  return str.replace(/[\u3041-\u3096]/g, function (match) {
    var chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

const decode = () => {
  (async () => {
    isDecoding = true;
    const targetRegionRect = getRegionRect();

    const gpx = createGraphics(gImg.width, gImg.height);
    gpx.image(gImg, 0, 0);

    let recogTarget;

    if (options.enableFilter) {
      gpx.filter(THRESHOLD, options.threshold);
      recogTarget = gpx.elt;
    } else if (decodeMode === decodeModeCamera) {
      recogTarget = gImg.canvas;
    } else {
      recogTarget = gImg.elt;
    }

    let recogOptions = {};
    if (targetRegionRect) {
      recogOptions.rectangle = targetRegionRect;
    }
    const ret = await tessWorker.recognize(recogTarget, recogOptions);

    isDecoding = false;
    decordedText = hiraToKana(ret.data.text);
    decordedText = manageSpaces(decordedText);
    // console.log(decordedText);
  })();
};

const manageSpaces = (targetText) => {
  let returnText = targetText;
  [' イ', 'イ '].forEach((e) => {
    returnText = returnText.replaceAll(e, 'イ');
  });

  returnText = returnText.replaceAll(' ', '　');

  return returnText;
};

const getRegionRect = () => {
  if (gImg && frameInfo && displayImageInfo) {
    const retValue = {};
    const imageRatio = displayImageInfo.w / gImg.width;
    retValue.left = (frameInfo.x - displayImageInfo.x) / imageRatio;
    retValue.top = (frameInfo.y - displayImageInfo.y) / imageRatio;
    retValue.width = frameInfo.w / imageRatio;
    retValue.height = frameInfo.h / imageRatio;

    // console.log(frameInfo, retValue);
    return retValue;
  } else {
    return undefined;
  }
};

let frameInfoCandidate;
function touchStarted() {
  if (decodeMode !== undefined) {
    if (mouseY < height / 2) {
      // Init
      frameInfoCandidate = { x: mouseX, y: mouseY, w: 0, h: 0 };
      isDrawingFrame = true;
    }
  }
}

function touchEnded() {
  if (isDrawingFrame) {
    const constrainedMouseX = constrain(mouseX, 2, width - 3);
    const constrainedMouseY = constrain(mouseY, 2, height / 2 - 3);
    isDrawingFrame = false;
    const fiwidth = constrainedMouseX - frameInfoCandidate.x;
    const fiheight = constrainedMouseY - frameInfoCandidate.y;

    if (abs(fiwidth) + abs(fiheight) > 20) {
      frameInfo = { x: frameInfoCandidate.x, y: frameInfoCandidate.y, w: 0, h: 0 };
      frameInfo.w = abs(fiwidth);
      frameInfo.h = abs(fiheight);

      if (fiwidth < 0) {
        frameInfo.x = constrainedMouseX;
      }

      if (fiheight < 0) {
        frameInfo.y = constrainedMouseY;
      }

      decode();
    } else {
      frameInfoCandidate = undefined;
    }
  } else if (isDatGUIChanged) {
    isDatGUIChanged = false;
    decode();
  }
}

const drawFrame = () => {
  if (frameInfo) {
    const targetRegionRect = getRegionRect();
    //debug
    // image(
    //   gImg,
    //   width / 2,
    //   (3 * height) / 4,
    //   targetRegionRect.width,
    //   targetRegionRect.height,
    //   targetRegionRect.left,
    //   targetRegionRect.top,
    //   targetRegionRect.width,
    //   targetRegionRect.height
    // );
  }

  if (frameInfoCandidate || frameInfo) {
    push();
    {
      noFill();
      strokeWeight(height / 200);
      stroke('#a7c957');
      const constrainedMouseX = constrain(mouseX, 2, width - 3);
      const constrainedMouseY = constrain(mouseY, 2, height / 2 - 3);

      if (isDrawingFrame && frameInfoCandidate) {
        const fiwidth = constrainedMouseX - frameInfoCandidate.x;
        const fiheight = constrainedMouseY - frameInfoCandidate.y;

        if (abs(fiwidth) + abs(fiheight) > 20) {
          rect(frameInfoCandidate.x, frameInfoCandidate.y, fiwidth, fiheight);
        } else {
          const fi = frameInfo;
          if (fi) {
            rect(fi.x, fi.y, fi.w, fi.h);
          }
        }
      } else {
        const fi = frameInfo;
        if (fi) {
          rect(fi.x, fi.y, fi.w, fi.h);
        }
      }
    }
    pop();
  }
};

const drawGuideLine = () => {
  push();
  {
    strokeWeight(2);
    stroke('#FFFFFFA0');

    line(width / 2, 0, width / 2, height / 2);
    line(0, height / 4, width, height / 4);
  }
  pop();
};
