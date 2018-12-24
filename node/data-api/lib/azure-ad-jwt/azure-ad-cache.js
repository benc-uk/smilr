/**
 * A cache for reducing network access.
 *
 * Items are kept in the cache under a key. Each item is tagged with a
 * timestamp indicating when that item expires. The put function takes
 * an optional lifetime parameter that overrides the default lifetime.
 */

var CACHE_LIFETIME = 60 * 60 * 1000; // one hour
var _cache = {};

exports.get = function(key) {
    var item = _cache[key];
    if (!item) return null;
    if (Date.now() > item.expires) {
        return null;
    }
    return item.value;
};

exports.put = function(key, value, lifetime) {
    if (typeof lifetime !== 'number') {
        lifetime = CACHE_LIFETIME;
    }
    _cache[key] = {
        expires: Date.now() + lifetime,
        value: value
    };
};
