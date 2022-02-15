// packicons.js
// combine all /i/*.svg files into the icons.svg file.
// to reduce number of downloads.
// not used on minimal board 

// using https://github.com/svgstore/svgstore

import fs from 'fs'
import svgstore from 'svgstore'

console.log('Packing all icons...');

var icons = svgstore();

var files = fs.readdirSync('./i', { withFileTypes: true });

files.forEach(file => {
  if (file.isFile()) {
    var n = file.name.toLowerCase();
    if (n.endsWith('.svg')) {
      // console.log(file.name);
      icons.add(n.split('.')[0], fs.readFileSync('./i/' + n, 'utf8'));
    }
  }
});

var svgText = icons.toString();
svgText = svgText.replace(/\s+/g, ' ');
svgText = svgText.replace(/<symbol/g, '\n<symbol');
svgText = svgText.replace(/> </g, '><');
// console.log(svgText);

console.log('writing icons.svg...');
fs.writeFileSync('./icons.svg', svgText);
console.log('');

console.log('Packing mini icons...');

icons = svgstore();

['default.svg', 'ide.svg', 'minus.svg', 'plus.svg', 'start.svg', 'stop.svg']
  .forEach(n => {
    // console.log(file);
    icons.add(n.split('.')[0], fs.readFileSync('./i/' + n, 'utf8'));
  });

svgText = icons.toString();
svgText = svgText.replace(/\s+/g, ' ');
svgText = svgText.replace(/> </g, '><');

console.log('writing icons-mini.svg...');
fs.writeFileSync('./icons-mini.svg', svgText);

console.log('done.');
