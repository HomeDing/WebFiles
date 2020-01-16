// makeicon.js
// create the favicons from a SVG icon in the /i/ folder
// 
// node makeicon.js -n pms 
// to create all files use:
// for %F in (i\*.svg) do (node makeicon.js -n %~nF -s)
//
// a zip file with all icons is available at https://homeding.github.io/favicons.zip

// converting is done with svg2img package
// npm install svg2img


const fs = require('fs');
const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

var svg_to_png = require('svg-to-png');

// ===== Command line support =====
console.log('HomeDing utility for creating set of icons');

const options = yargs
  .usage('Usage: $0')
  .option('n', { alias: 'name', type: 'string', describe: 'Icon Name', demandOption: true, default: "default" })
  .option('s', { alias: 'save', type: 'boolean', describe: 'save to favicons folder', demandOption: false, default: false })
  .option('v', { alias: 'verbose', type: 'boolean', describe: 'Verbose logging', demandOption: false, default: false })
  .help()
  .argv;

debug.enable(options.verbose ? '*' : '*:info');

const logInfo = debug('iot:info');

// this will be the background of all created icons:
const backpanel = '<rect width="48" height="48" rx="8" opacity="1" fill="#d4dced"/>';

const workingFolder = __dirname;
const iconName = options.name;
let outFolder = `${workingFolder}\\_out`;

// npm install svg-to-png
function convert(filename, size) {
  logInfo("creating", filename, "...");
  return new Promise(resolve => {
    svg_to_png.convert(`${outFolder}\\favicon.svg`,
      `${outFolder}`,
      {
        debug: false,
        defaultWidth: size,
        defaultHeight: size,
        compress: true
      })
      .then(function () {
        // rename appropriate
        shell.mv(`${workingFolder}\\_out\\favicon.png`, `${workingFolder}\\_out\\${filename}.png`);
        resolve();
      })
  });
};

async function main() {
  logInfo(`Converting icon: "${options.name}"`)

  // create fresh folder
  shell.rm('-rf', outFolder);
  shell.mkdir(outFolder);

  // create favicon.svg from selected icon
  let s = fs.readFileSync(`${workingFolder}\\i\\${iconName}.svg`).toString();
  const offset = s.indexOf('>') + 1;
  s = s.substr(0, offset) + backpanel + s.substr(offset);
  fs.writeFileSync(`${workingFolder}\\_out\\favicon.svg`, s);

  // create pngs
  await convert('favicon48', 48);
  await convert('favicon144', 144);
  await convert('favicon180', 180);
  await convert('favicon192', 192);
  await convert('favicon270', 270);
  await convert('favicon512', 512);

  if (options.save) {
    shell.mv(`${workingFolder}\\_out`, `${workingFolder}\\favicons\\${iconName}`);
  }
  logInfo("done.");
};
main();
