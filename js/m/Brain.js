// Brain to control the simulation
define(["jquery", "underscore", "m/DOM"], function($, _, DOM) {
	// initialize
	var init = function () {
		bindControls();
	};

	// bind DOM controls
	var bindControls = function () {
		$("#BrainThink").click(function () {
			think($("#BrainThoughts").val());
		});
	};

	// do something useful
	var think = function (thoughts) {
		var seq = 0;
	
		for (var i = 0; i < thoughts; i++) {
			DOM.render(function () {
				// context is DOM module
				this.DOM.biome
					.append("Thought #" + seq++ )
					.append("<br>");
			});
		}
	};
	
	return {
		init: init
	};
});
