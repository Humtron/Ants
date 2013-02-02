// DOM module to asynchronously queue and render updates
define(["jquery", "underscore"], function ($, _) {	
	// private
	var ctx;
	var heap = [];
	var interval;
	var delay = 1000;

	var DOM = {
		biome: $("#Biome"),
		start: $("#Start"),
		stop: $("#Stop"),
		clear: $("#Clear")
	};

	// initialize
	var init = function () {
		ctx = this;
		bindControls();
	};

	// bind DOM controls
	var bindControls = function () {
		DOM.start.click(function () {
			start();
			DOM.start.hide();
			DOM.stop.show();
		});
		DOM.stop.click(function () {
			stop();
			DOM.start.show();
			DOM.stop.hide();
		});
		DOM.clear.click(function () {
			clear();
			DOM.start.show();
			DOM.stop.hide();
		});
	};

	// start periodic async calls
	var start = function () {
		interval = setInterval(function () {
			consume();
		}, delay);
	};

	// stop periodic async calls
	var stop = function () {
		window.clearInterval(interval);
	};

	// queues a callback to be rendered
	var render = function (callback) {
		heap.push(callback);
	};

	// consume the queue as FIFO
	var consume = function () {
		var stack = heap;

		// clear main queue
		heap = [];

		_.each(stack, function(callback) {
			// callback is DOM context
			callback.call(ctx);
		});
	};

	// clear all state and stop
	var clear = function () {
		heap = [];
		stop();
		DOM.biome.empty();
	};
	
	return {
		DOM: DOM,
		init: init,
		start: start,
		stop: stop,
		render: render
	};
});
