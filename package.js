Package.describe({
  name: 'dburles:factory',
  summary: 'Factories for Meteor',
  version: "0.3.7",
  git: "https://github.com/percolatestudio/meteor-factory.git"
});

Package.on_use(function(api) {
  api.versionsFrom("METEOR@0.9.0");
  api.use([
    'minimongo',
    'underscore',
    'ejson',
    'aldeed:simple-schema',
    'safe',
    'random',
    'underscore']);
  api.add_files('lib/factory.js', ['client', 'server']);
  api.export('Factory', ['client', 'server']);
});

Package.on_test(function(api) {
  api.use(['tinytest', "dburles:factory"]);
  api.add_files('lib/factory_tests.js');
});
