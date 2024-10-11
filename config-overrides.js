// config-overrides.js
module.exports = function override(config, env) {
    config.output = {
      ...config.output,
      filename: 'widget.js',
      library: 'MyReactApp',
      libraryTarget: 'umd',
    };
  
    return config;
  };
  