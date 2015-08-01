// See https://github.com/NuGet/NuGetGallery/issues/2600#issuecomment-126302713
// for more info
console.log('Downloding catalog');
var fs = require('fs');
var path = require('path');
var nuGetClient = require('./lib/nuget-client.js')();
var outputFileName = path.join('data', 'nuget.json');

nuGetClient.getAllCatalogPages()
  .then(function(items) {
    console.log('Downloaded ' + items.length + ' packages. Saving it to ' + outputFileName);
    fs.writeFileSync(outputFileName, JSON.stringify(items), 'utf8');
  });
