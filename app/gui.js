// dat GUI instance
let gui;

// Setting values for dat GUI
const DefaultOptions = {};
const options = new Object();

const utilities = {
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
  DefaultOptions.enableFilter = opt.enableFilter;
  DefaultOptions.threshold = opt.threshold;
  initializeSettings();

  optionFolder.add(options, 'enableFilter', false).name('画像にフィルターをかける');
  optionFolder.add(options, 'threshold', 0.00, 1.00, 0.01).name('黒/白 しきい値');
  optionFolder.open();

  gui.add(utilities, 'Reset').name('設定リセット');
	
	gui.close();

};

// Initialize with default values
const initializeSettings = () => {
  options.enableFilter = DefaultOptions.enableFilter;
  options.threshold = DefaultOptions.threshold;
  gui.updateDisplay();
};
