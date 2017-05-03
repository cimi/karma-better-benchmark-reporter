
function getColors(config) {
  var chalk = require('chalk');
  var symbols = require('./symbols');
    
  // disable chalk when colors is set to false
  chalk.enabled = config.colors !== false;

  // set color functions
  config.benchmarkReporter.colors = config.benchmarkReporter.colors || {};

  // set symbol functions
  config.benchmarkReporter.symbols = config.benchmarkReporter.symbols || {};  

  var colors = {
      success: {
          symbol: config.benchmarkReporter.symbols.success || symbols.success,
          print: chalk[config.benchmarkReporter.colors.success] || chalk.green
      },
      info: {
          symbol: config.benchmarkReporter.symbols.info || symbols.info,
          print: chalk[config.benchmarkReporter.colors.info] || chalk.grey
      },
      warning: {
          symbol: config.benchmarkReporter.symbols.warning || symbols.warning,
          print: chalk[config.benchmarkReporter.colors.warning] || chalk.yellow
      },
      error: {
          symbol: config.benchmarkReporter.symbols.error || symbols.error,
          print: chalk[config.benchmarkReporter.colors.error] || chalk.red
      }
  };

  return colors;
}

function setDefaults(config) {
  
  if(!config) {
    config = {};
  }
  config.benchmarkReporter = config.benchmarkReporter || {};

  return config;
}

function getFrequency(config) {
  var freq = {};
  var DEFAULT_INTERVAL = 'sec';
  var DEFAULT_DECIMALS = 0;
  var MAX_DECIMALS = 20;

  if (config.benchmarkReporter.frequency) {
    freq.interval = config.benchmarkReporter.frequency.interval || DEFAULT_INTERVAL;
    freq.decimals = Number(config.benchmarkReporter.frequency.decimals) || DEFAULT_DECIMALS;
    if(freq.decimals > MAX_DECIMALS) {
      freq.decimals = MAX_DECIMALS; 
    } 
  } else {
    freq.interval = DEFAULT_INTERVAL;
    freq.decimals = DEFAULT_DECIMALS;
  }

  return freq;
}

var BenchReporter = function(baseReporterDecorator, formatError, config) {
  baseReporterDecorator(this);

  var resultSet = {};
  var config = setDefaults(config);
  var colors = getColors(config);
  var frequency = getFrequency(config);

  this.onRunComplete = function(browsers, resultInfo) {
    for (var browserName in resultSet) {
      var groups = resultSet[browserName];

      this.write('SUMMARY: \n');

      for (var groupName in groups) {
        var results = groups[groupName]
        if (results.length > 1) {
          // Find the fastest among the groups
          results.sort(function(a, b) {
            return b.benchmark.hz - a.benchmark.hz;
          });

          var fastest = results[0];
          var secondFastest = results[1];

          var timesFaster = (fastest.benchmark.hz/secondFastest.benchmark.hz).toFixed(2);
          this.write('  '+fastest.benchmark.suite+': '+fastest.benchmark.name+' at '+Math.floor(fastest.benchmark.hz)+' ops/sec ('+timesFaster+'x faster than '+secondFastest.benchmark.name+')\n');
        }
        else {
          this.write('  '+results[0].description+' had no peers for comparison at '+Math.floor(results[0].benchmark.hz)+' ops/sec\n')
        }
      }
    }
  };

  this.specSuccess = function(browser, result) {
  	var prefixPadding = Array(8).join(' ');
    var opsPerInterval;
    var browser = browser.name;
    var suite = result.benchmark.suite;
    var name = result.benchmark.name;

    // Get set and store results
    var browserSet = resultSet[browser] = resultSet[browser] || {};
    browserSet[suite] = browserSet[suite] || [];
    browserSet[suite].push(result);
    
    if(frequency.interval === 'sec') {
      opsPerInterval = result.benchmark.hz.toFixed(frequency.decimals);
    } else if(frequency.interval === 'min') {
      opsPerInterval = (60 * result.benchmark.hz).toFixed(frequency.decimals);

    } else if(frequency.interval === 'hour') {
      opsPerInterval = (3600 * result.benchmark.hz).toFixed(frequency.decimals);

    }

    this.write(colors.success.print(`${browser} ${suite}: \n`))
    this.write(`${prefixPadding} ${name} at ${opsPerInterval} ops/${frequency.interval} \n`);
  };
};

BenchReporter.$inject = ['baseReporterDecorator', 'formatError', 'config'];

module.exports = {
  'reporter:benchmark': ['type', BenchReporter]
};
