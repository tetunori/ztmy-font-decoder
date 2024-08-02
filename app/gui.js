// dat GUI instance
let gui;

// Setting values for dat GUI
const DefaultOptions = {};
const options = new Object();

const prepareDatGUI = (opt) => {
  gui = new dat.GUI({ closeOnTop: true });
  const optionFolder = gui.addFolder('Options');

  // Set initial values
  DefaultOptions.numMarks = opt.numMarks;
  initializeSettings();

  const step = 1;
  optionFolder.add(options, 'numMarks', 1, 4, step);
  optionFolder.open();
	
	gui.close();

};

// Initialize with default values
const initializeSettings = () => {
  options.numMarks = DefaultOptions.numMarks;
  gui.updateDisplay();
};
