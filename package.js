Package.describe({
  name: 'dburles:factory',
  summary: 'Factories for Meteor',
  version: '0.3.11',
  git: 'https://github.com/versolearning/meteor-factory.git'
});

Package.on_use(function(api) {
  api.versionsFrom('METEOR@0.9.0');
  api.use(['minimongo', 'underscore', 'ejson', 'random']);
  api.add_files('factory.js');
  api.export('Factory');
});

Package.on_test(function(api) {
  api.use(['tinytest', 'dburles:factory', 'underscore']);
  api.add_files('factory_tests.js', 'server');
});
