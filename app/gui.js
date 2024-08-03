// dat GUI instance
let gui;

// Setting values for dat GUI
const DefaultOptions = {};
const options = new Object();

const utilities = {
  Decode: () => {
    decode();
  },
  Reset: () => {
    initializeSettings();
  },
  GitHub: () => {
    window.open('https://github.com/tetunori/ztmy-font-decoder', '_blank');
  },
};

const prepareDatGUI = (opt) => {
  gui = new dat.GUI({ closeOnTop: true });
  const optionFolder = gui.addFolder('Options');

  // Set initial values
  DefaultOptions.xTranslate = opt.xTranslate;
  DefaultOptions.yTranslate = opt.yTranslate;
  DefaultOptions.scale = opt.scale;
  DefaultOptions.rotate = opt.rotate;
  initializeSettings();

  optionFolder.add(options, 'xTranslate', -3*width, 3*width, 1);
  optionFolder.add(options, 'yTranslate', -3*height, 3*height, 1);
  optionFolder.add(options, 'scale', 0.1, 10.0, 0.1);
  optionFolder.add(options, 'rotate', -180, 180, 1 );
  optionFolder.open();

  gui.add(utilities, 'Decode').name('解読');
  gui.add(utilities, 'Reset').name('設定リセット');
	
	gui.close();

};

// Initialize with default values
const initializeSettings = () => {
  options.xTranslate = DefaultOptions.xTranslate;
  options.yTranslate = DefaultOptions.yTranslate;
  options.scale = DefaultOptions.scale;
  options.rotate = DefaultOptions.rotate;
  gui.updateDisplay();
};
