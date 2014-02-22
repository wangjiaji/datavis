/* jslint settings */

// Module /spa/
// Provides chat slider capability
//
var spa = (function () {
    'use strict';
    var initModule = function ($container) {
	spa.model.initModule();
	spa.shell.initModule($container);
    }
    return { initModule: initModule };
})();
