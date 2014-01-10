Package.describe({
  summary: 'Factories for Meteor'
});

Package.on_use(function(api) {
  api.use(['minimongo', 'underscore', 'ejson']);
  api.add_files('lib/factory.js', ['client', 'server']);
  if (typeof api.export !== 'undefined') {
    api.export('Factory', ['client', 'server']);
    api.export('Factories', ['client', 'server']);
  }
});
