Package.describe({
  summary: 'Factories for Meteor'
});

Package.on_use(function(api) {
  api.use(['minimongo', 'underscore', 'ejson']);
  api.add_files('lib/factory.js', ['client', 'server']);
  api.export('Factory', ['client', 'server']);
});

Package.on_test(function(api) {
  api.use(['tinytest', 'factory']);
  api.add_files('lib/factory_tests.js');
});
