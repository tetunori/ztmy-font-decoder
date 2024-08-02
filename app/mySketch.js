// Options
// const gOptions = {
//   numMarks: 2,
// };

let tessWorker = undefined;
let gImg;
let decodeMode = undefined;
const decodeModePicture = 0;
const decodeModeCamera = 1;
let input;
let decordedText = '';

function preload() {
  (async () => {
    tessWorker = await Tesseract.createWorker('ztmy', 0, {
      langPath: './tesseract/',
      gzip: false,
    });
  })();
}

function setup() {
  // Prepare GUI
  // prepareDatGUI(gOptions);

  createCanvas(windowWidth, windowHeight).drop(handleFile);

  strokeWeight(3);

  textFont('Noto Sans JP');
  textAlign(LEFT, TOP);
  textSize(30);
  textWrap(CHAR);
  imageMode(CENTER);
  input = createFileInput(handleFile);
  input.position((15 * height) / 20, height / 3.5);
  input.style('display', 'none');
}
var irotate = 0;

function draw() {
  background(220);
  if (tessWorker && gImg) {
    if (gImg.height > gImg.width) {
      // Portrait
      const imageHeight = min(gImg.height, height / 2);
      const imageWidth = (1.5 * gImg.width * imageHeight) / gImg.height;
      image(gImg, 0, 0, imageWidth, imageHeight);
      // ⭐imple
    } else if (gImg.width > gImg.height) {
      // Landscape
      let imageWidth = min(gImg.width, width);
      let imageHeight = (gImg.height * imageWidth) / gImg.width;

      if (imageHeight > height / 2) {
        imageWidth = (imageWidth * height) / 2 / imageHeight;
        imageHeight = height / 2;
      }

      push();
      translate(width / 2, height / 4);
      rotate(map(mouseX, 0, width, -PI, PI));
      scale(map(mouseY, 0, height, 0.5, 3.0));
      image(gImg, 0, 0, imageWidth, imageHeight);
      pop();
    }
  }

  if (decodeMode === undefined) {
    drawModeSelector();
  } else {
    rect(-20, height / 2, width + 20, height / 2 + 20);
    text(decordedText, width / 10, height / 2 + height / 10);
  }
}
function keyPressed() {
  if (key == 'r') {
    irotate += 5;
  } else if (key == 'w') {
    irotate -= 5;
  }
}
const drawModeSelector = () => {
  push();
  {
    textAlign(CENTER, CENTER);
    textSize(height / 23);
    text("'ZTMY Font' Decorder", width / 2, height / 13);

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

    gImg = createImg(file.data, '');
    gImg.hide();
    decodeMode = decodeModePicture;

    // Draw the image.
    image(gImg, 0, 0, width, height);

    (async () => {
      const ret = await tessWorker.recognize(gImg.elt);
      decordedText = hiraToKana(ret.data.text);
      // console.log(decordedText);
    })();
  }
}

function mouseClicked() {
  if (decodeMode === undefined) {
    if (mouseY > (12 * height) / 20) {
      input.elt.click();
    } else if (mouseY > (3 * height) / 20) {
      // decodeMode = decodeModeCamera;
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
