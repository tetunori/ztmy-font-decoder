// Options
// const gOptions = {
//   numMarks: 2,
// };

let tessWorker = undefined;
let gImg;

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
}

function draw() {
  background(220);
  if (tessWorker) {
    text('test', 100, 100);
    if (gImg) {
      image(gImg, 0, 0, gImg.width, gImg.height);
    }
  }
}

function handleFile(file) {
  // Remove the current image, if any.
  if (gImg) {
    gImg.remove();
  }

  gImg = createImg(file.data, '');
  gImg.hide();

  // Draw the image.
  image(gImg, 0, 0, width, height);

  (async () => {
    const ret = await tessWorker.recognize(gImg.elt);
    console.log(ret.data.text);
  })();
}
