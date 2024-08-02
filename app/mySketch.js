const gOptions = {
  xTranslate: 0,
  yTranslate: 0,
  scale: 1.0,
  rotate: 0,
};

let tessWorker = undefined;
let gImg;
let decodeMode = undefined;
const decodeModePicture = 0;
const decodeModeCamera = 1;
let input;
let decordedText = '';
let isDecoding = false;

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

  strokeWeight(3);
  angleMode(DEGREES);

  textFont('Noto Sans JP');
  textAlign(LEFT, TOP);
  textSize(height / 30);
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
      translate(width / 2 + options.xTranslate, height / 4 + options.yTranslate);
      rotate(options.rotate);
      scale(options.scale);
      image(gImg, 0, 0, imageWidth, imageHeight);
      pop();
    }
  }

  if (decodeMode === undefined) {
    drawModeSelector();
  } else {
    rect(-20, height / 2, width + 20, height / 2 + 20);
    if (isDecoding) {
      push();
      textAlign(CENTER, CENTER);
      textSize(width / 10);
      text(
        String.fromCodePoint(0x1f311 + (floor(frameCount / 5) % 8)),
        width / 2,
        (3 * height) / 4
      );
      pop();
    } else {
      text(decordedText, width / 10, height / 2 + height / 10);
    }
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

    decode(gImg.elt);
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

const decode = (target = undefined) => {
  // (async () => {
  //   isDecoding = true;
  //   const ret = await tessWorker.recognize(gImg.elt);
  //   isDecoding = false;
  //   decordedText = hiraToKana(ret.data.text);
  //   // console.log(decordedText);
  // })();
  (async () => {
    isDecoding = true;
    let decordTarget;
    if (target) {
      decordTarget = target;
    } else {
      const gfx = createGraphics(width, height / 2);
      gfx.image(get(), 0, 0);
      console.log(gfx);

      decordTarget = gfx.elt;
    }
    const ret = await tessWorker.recognize(decordTarget);

    isDecoding = false;
    decordedText = hiraToKana(ret.data.text);
    // console.log(decordedText);
  })();
};
