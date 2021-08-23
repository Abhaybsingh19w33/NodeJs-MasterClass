/*
 * Create and export configuration variables
 *
 */

// to decrease the complexity of the code
// the environment configuration for staging and production
// the data is imported by other files to be used

// Container for all environments
var environments = {};

// Staging (default) environment

// now we have to listen to 2 ports
// one is for http port 80 and second one is for https port 443
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
};

// Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
