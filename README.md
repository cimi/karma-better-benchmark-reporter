# karma-better-benchmark-reporter

## Installation
    $ npm install karma-better-benchmark-reporter --save-dev
    
## Configuration
```js
//karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['benchmark'],
    reporters: ['benchmark'],
    benchmarkReporter: {
      colors: {
        success: 'green',
        warning: 'yellow',
        error: 'red'
      }
    },
    colors: true // set to false to disable colors
  });
};
```
Colors let you override the default colors. Possible color values are chalk colors. 
 
## License
Licensed under MIT license.
