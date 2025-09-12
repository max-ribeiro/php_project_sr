if (typeof sigodesktop !== 'undefined') {    
    window.nodeRequire = require;
    window.module = module;
    module = undefined;
}