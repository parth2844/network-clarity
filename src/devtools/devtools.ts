// Register the DevTools panel
chrome.devtools.panels.create(
  'Network Clarity',
  '',
  'src/devtools/panel.html',
  (panel) => {
    console.log('Network Clarity panel created', panel);
  }
);
