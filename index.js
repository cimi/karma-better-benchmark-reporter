var chalk = require('chalk');
var symbols = require('./symbols');

var BenchReporter = function(baseReporterDecorator, formatError, config) {
  baseReporterDecorator(this);

	if(!config) {
		config = {};
	}
  
  // disable chalk when colors is set to false
  chalk.enabled = config.colors !== false;

	config.benchmarkReporter = config.benchmarkReporter || {};

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

  var resultSet = {};

  this.onRunComplete = function(browsers, resultInfo) {
    for (var browserName in resultSet) {
      var groups = resultSet[browserName];

      this.write(chalk.bold('SUMMARY: \n'));

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
    
    var browser = browser.name;
    var suite = result.benchmark.suite;
    var name = result.benchmark.name;
		var ops;
		var frequency;

    // Get set and store results
    var browserSet = resultSet[browser] = resultSet[browser] || {};
    browserSet[suite] = browserSet[suite] || [];
    browserSet[suite].push(result);

    var opsPerSec = Math.floor(result.benchmark.hz);
    
    if (opsPerSec !== 0 ) {
    	frequency = 'ops/sec';
    	ops = opsPerSec;
    } else {
    	frequency = 'ops/hour';
	    ops = Math.floor(3600 * result.benchmark.hz);
    }
    this.write(colors.success.print(`${browser} ${suite}: \n`))
    this.write(`${prefixPadding} ${name} at ${ops} ${frequency} \n`);
  };
};

BenchReporter.$inject = ['baseReporterDecorator', 'formatError', 'config'];

module.exports = {
  'reporter:benchmark': ['type', BenchReporter]
};
