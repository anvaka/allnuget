var fs = require('fs');
var createGraph = require('ngraph.graph');

module.exports = loadGraph;

function loadGraph() {
  var content = fs.readFileSync(process.argv[2] || './data/nuget.json', 'utf8');
  return getGraph(JSON.parse(content));
}

function getGraph(json) {
  var graph = createGraph({ uniqueLinkIds: false });
  json.forEach(addPackage);
  return graph;

  function addPackage(pkg) {
    graph.addNode(pkg.name);
    var deps = pkg.deps;
    if (deps) {
      for (var i = 0; i < deps.length; ++i) {
        graph.addLink(pkg.name, deps[i]);
      }
    }
  }
}
