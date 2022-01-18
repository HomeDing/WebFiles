// packicons.js
// combine all /i/*.svg files into the icons.svg file.
// to reduce number of downloads.
// not used on minimal board 

// using https://github.com/svgstore/svgstore

var svgstore = require('svgstore');
var fs = require('fs');

console.log('Packing all icons into a file...');

var icons = svgstore();

var files = fs.readdirSync('./i', { withFileTypes: true });

files.forEach(file => {
  if (file.isFile()) {
    var n = file.name.toLowerCase();
    if (n.endsWith('.svg')) {
      // console.log(file.name);
      icons.add(n.split('.')[0], fs.readFileSync('./i/'+ n, 'utf8'));
    }
  }
})

var svgText = icons.toString();
svgText = svgText.replace(/\s+/g, ' '); 
svgText = svgText.replace(/<symbol/g, '\n<symbol');
svgText = svgText.replace(/> </g, '><');
// console.log(svgText);

fs.writeFileSync('./icons.svg', svgText);

// console.log('done.');
