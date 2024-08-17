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

const thresholdVal = 0.12;

function preload() {
  (async () => {
    tessWorker = await Tesseract.createWorker('ztmy', 0, {
      langPath: './tesseract/',
      gzip: false,
    });
  })();
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
    } else if (decodeMode === decodeModeCamera) {
      drawVideoCapture();
      drawGuideLine();
    }
    drawFrame();

    // Draw lower half of screen
    drawDecordTextRegion();
    drawHomeButton();
  }
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
  text('🏠', width / 20, height - width / 20);
  pop();
};

const drawModeSelector = () => {
  push();
  {
    textAlign(CENTER, CENTER);
    textSize(height / 23);
    text("🦔 'ZTMY Font' Decorder 🦔", width / 2, height / 13);

    rectMode(CENTER);
    strokeCap(ROUND);

    noStroke();
    textSize(height / 6);
    square(width / 2, (7 * height) / 20, height / 3.5, height / 20);
    text('📷', width / 2, (6.5 * height) / 20);

    stroke(80);
    strokeWeight(height / 200);
    drawingContext.setLineDash([height / 100, height / 100]);
    square(width / 2, (15 * height) / 20, height / 3.5, height / 20);
    text('📁', width / 2, (14.8 * height) / 20);
  }
  pop();
};

function handleFile(file) {
  if (file.type === 'image') {
    // Remove the current image, if any.
    if (gImg) {
      gImg.remove();
    }

    console.log(file);
    createImg(file.data, '', '', (img) => {
      gImg = img;
      //    console.log(gImg)
      gImg.hide();
      decodeMode = decodeModePicture;

      const gpx = createGraphics(gImg.width, gImg.height);
      gpx.image(gImg, 0, 0);
      if (options.enableFilter) {
        filter(THRESHOLD, options.threshold);
      }
      image(gpx, width / 2, (3 * height) / 4, gpx.width, gpx.height);

      decode(gpx.elt);
    });
  }
}

function mouseClicked() {
  if (decodeMode === undefined) {
    if (mouseY > (12 * height) / 20) {
      input.elt.click();
    } else if (mouseY > (3 * height) / 20) {
      decodeMode = decodeModeCamera;
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
    if (dist(width / 20, height - width / 20, mouseX, mouseY) < width / 40) {
      decodeMode = undefined;
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

const decode = (target = undefined) => {
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

    const ret = await tessWorker.recognize(recogTarget, { rectangle: targetRegionRect });

    isDecoding = false;
    decordedText = hiraToKana(ret.data.text);
    // console.log(decordedText);
  })();
};

const getRegionRect = () => {
  const retValue = { top: 0, left: 0, width: 0, height: 0 };

  if (gImg && displayImageInfo) {
    const imageRatio = displayImageInfo.w / gImg.width;
    retValue.left = (frameInfo.x - displayImageInfo.x) / imageRatio;
    retValue.top = (frameInfo.y - displayImageInfo.y) / imageRatio;
    retValue.width = frameInfo.w / imageRatio;
    retValue.height = frameInfo.h / imageRatio;

    // console.log(frameInfo, retValue);

    return retValue;
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

  push();
  {
    noFill();
    strokeWeight(height / 200);
    stroke('#a7c957');
    if (isDrawingFrame) {
      const constrainedMouseX = constrain(mouseX, 2, width - 3);
      const constrainedMouseY = constrain(mouseY, 2, height / 2 - 3);
      const fiwidth = constrainedMouseX - frameInfoCandidate.x;
      const fiheight = constrainedMouseY - frameInfoCandidate.y;
      if (abs(fiwidth) + abs(fiheight) > 20) {
        rect(frameInfoCandidate.x, frameInfoCandidate.y, fiwidth, fiheight);
      }
    } else {
      const fi = frameInfo;
      if (fi) {
        rect(fi.x, fi.y, fi.w, fi.h);
      }
    }
  }
  pop();
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
