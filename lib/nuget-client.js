var rp = require('request-promise');
var semver = require('semver');
var packagesList = 'http://api.nuget.org/v3/catalog0/index.json';
var Promise = require("bluebird");

module.exports = client;

function client() {
  var api = {
    getAllCatalogPages: getAllCatalogPages
  }
  return api;

  function getAllCatalogPages() {
    return rp(packagesList)
      .then(downloadPages);
  }
}

function downloadPages(res) {
  var pageUrls = JSON.parse(res).items.map(toUrl);
  return Promise.map(pageUrls, toRequests, {concurrency: 10})
    .then(flatten)
    .then(downloadDependencies);
}

function downloadDependencies(packages) {
  return Promise.map(packages, toDetailUrls, {concurrency: 10})
    .then(flattenDependencies);
}

function toDetailUrls(pkg) {
  var url = pkg['@id'];
  console.log('Downloading dependencies info for ' + url);

  return rp(url).then(toJson);
}

function toRequests(url) {
  console.log('Downloading ' + url);
  return rp(url).then(toJson);
}

function toJson(x) {
  return JSON.parse(x);
}

function toUrl(x) {
  return x['@id'];
}

function flattenDependencies(deps) {
  console.log('Flattinging dependencies');
  return deps.map(toShortList);
}

function toShortList(x) {
  if (x.dependencyGroups && x.dependencyGroups.length > 1)  {
    console.log('This package has multiple dependency groups for different frameworks: ' + x['@id']);
    // TODO: This probably needs to be handled better:
    console.log('Picking first group');
  }
  return {
    name: x.id,
    deps: getDeps(x.dependencyGroups && x.dependencyGroups[0])
  }
}

function getDeps(x) {
  if (!x) return [];
  var dependencies = x.dependencies;
  if (!dependencies) return [];
  return dependencies.map(toId);
}

function toId(x) {
  return x.id;
}

function flatten(pages) {
  console.log('Flattinging pages');
  var packages = Object.create(null);
  pages.forEach(processPage);
  var lastVersions = Object.keys(packages).map(toLastVersion);
  return lastVersions;

  function processPage(page, i) {
    page.items.forEach(addItem);
  }

  function addItem(item) {
    if (packages[item['nuget:id']]) {
      packages[item['nuget:id']].push(item);
    } else {
      packages[item['nuget:id']] = [item];
    }
  }
  function toLastVersion(pkgName) {
    var versions = packages[pkgName].sort(bySemver);
    return versions[0];
  }
}

function bySemver(x, y) {
  var xValid = semver.valid(x['nuget:version']);
  var yValid = semver.valid(y['nuget:version']);
  if (xValid && yValid) return semver.rcompare(x['nuget:version'], y['nuget:version']);
  if (xValid && !yValid) return 1;
  if (yValid && !xValid) return 1;
  return 0;
}
