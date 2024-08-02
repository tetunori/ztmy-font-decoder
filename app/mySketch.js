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
  textAlign(LEFT, CENTER);
  textWrap(CHAR);

  input = createFileInput(handleFile);
  input.position((15 * height) / 20, height / 3.5);
  input.style('display', 'none');
}

function draw() {
  background(220);
  if (tessWorker) {
    if (gImg) {
      image(gImg, 0, 0, gImg.width, gImg.height);
    }
  }

  if (decodeMode === undefined) {
    drawModeSelector();
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
      console.log(ret.data.text);
    })();
  }
}

function mouseClicked() {
  if (decodeMode === undefined) {
    if (mouseY > (12 * height) / 20) {
      input.elt.click();
      
    }else if(mouseY > (3 * height) / 20){
      decodeMode = decodeModeCamera;
    }
  }
}
