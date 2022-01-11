const cacheManager = require('cache-manager');
const Promise = require('es6-promise').Promise;
const memoryCache = cacheManager.caching({store: 'memory', max: 100, ttl: 10/*seconds*/, promiseDependency:Promise});


module.exports = memoryCache;