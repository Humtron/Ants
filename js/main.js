// main dependency loaders for Require.js
// jQuery is already bundled with Require.js
require.config({
	// nice names for libraries
	paths: {
		"underscore": "underscore-min",
		"util": "modules/util",
		"ant": "modules/ant"
	},
	// for libraries that do not define 
	// themselves as Require.js modules
	shim: {
		"underscore": {
			exports: "_"
		},
		"util": {
			deps: ["jquery"],
			exports: "Util"
		},
		"ant": {
			deps: ["jquery"],
			exports: "Ant"
		}
	},
	// for cache-busting/versioning
	urlArgs: "v=" + (new Date()).getTime()
});

require(["jquery", "underscore", "m/Brain", "m/DOM"],
	function($, _, Brain, DOM) {
		Brain.init();
		DOM.init();
	}
);

// set up shimmed modules
define(["underscore", "util", "ant"],
	function (_, Util, Ant) {
	}
);


// for testing:
/*
require("m/DOM").render(function () {
	jQuery("#Biome").append("Something...");
});
*/


/*
$.fn.alpha = function() {
    return this.append('<p>Alpha is Go!</p>');
};
define("jquery.alpha", function(){});

$.fn.beta = function() {
    return this.append('<p>Beta is Go!</p>');
};
define("jquery.beta", function(){});

require(["jquery", "jquery.alpha", "jquery.beta", "underscore"], function($) {
    //the jquery.alpha.js and jquery.beta.js plugins have been loaded.
    $(function() {
        $('body').alpha().beta();
    });
});

define("main", function(){});
*/
