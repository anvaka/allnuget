var save = require('ngraph.tobinary');
var createLayout = require('ngraph.offline.layout');

console.log('Loading graph');
var graph = require('./lib/loadgraph.js')();
console.log('Loaded ' + graph.getNodesCount() + ' nodes; ' + graph.getLinksCount() + ' edges');

var layout = createLayout(graph);
console.log('Starting layout');
layout.run();
save(graph, { outDir: './data' });

console.log('Done.');
console.log('Copy `links.bin`, `labels.bin` and positions.bin into vis folder');
