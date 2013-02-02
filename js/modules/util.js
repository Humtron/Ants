
var Util = {
	// improved typeof (far more specific)
	getType: function (obj) {
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	},
	// clean and return integer
	cleanNumber: function (data) {
		var num = data.replace(/[^0-9]/g, "");

		// must be numbers only
		if (num !== "") {
			num = parseInt(num, 10);
		} else {
			num = 0;
		}

		return num;
	},
	// add new yeti
	yetiAdd: function (data) {
		var div, span,
			x, y,
			width = 570;

		// delete any current yeti
		Util.yetiDelete();

		// set background
		Util.yetiAddBackground();

		// create yeti element
		div = document.createElement("div");
		div.className = "yeti";
		div.style.width = width + "px";

		// include CSS padding/border width from CSS!
		x = $(document).scrollLeft() + ($(window).width() / 2) - (width / 2) - (10 / 2) - (10 / 2);
		y = $(document).scrollTop() + 100;

		// add yeti content
		span = document.createElement("span");
		span.innerHTML = data;
		div.appendChild(span);

		// position yeti
		div.style.position = "absolute";
		div.style.left = Math.round(x) + "px";
		div.style.top = Math.round(y) + "px";

		// add yeti to page
		$("body").append(div);
	},
	// add yeti background
	yetiAddBackground: function () {
		// create yeti background element
		var div = document.createElement("div");
		div.className = "yetiBackground";

		// position yeti background
		div.style.position = "fixed";
		div.style.left = "0px";
		div.style.top = "0px";

		$(div).click(function () {
			// delete any current yeti
			Util.yetiDelete();			
		});

		// add yeti background to page
		$("body").append(div);
	},
	// delete all yeti
	yetiDelete: function () {
		$("div.yeti").remove();
		$("div.yetiBackground").remove();
	}
};

// lightweight object for adding new DOM elements
Util.el = function (tag, attr) {
	var name;

	// considered private, but must be tied to "this" context 
	// so prototype can access them
	this._element = document.createElement(tag);
	this._append = function (node) {
		// objects are appended directly, all other types become text nodes
		if (typeof node === "object") {
			this._element.appendChild(node);
		} else {
			this._element.appendChild(document.createTextNode(node));
		}
	};

	// set all attributes
	if (attr) {
		// set each attr name and value
		for (name in attr) {
			this._element.setAttribute(name, attr[name]);
		}
	}

	// chainable
	return this;
};

Util.el.prototype.append = function () {
	var i, j;

	// append all arguments as nodes
	for (i = 0; i < arguments.length; i++) {
		if (Util.getType(arguments[i]) === "array") {
			// append each array node
			for (j = 0; j < arguments[i].length; j++) {
				this._append(arguments[i][j]);
			}
		} else {
			this._append(arguments[i]);
		}
	}

	// chainable
	return this;
};

Util.el.prototype.html = function (html) {
	// insert text as HTML
	$(this._element).html(html);

	// chainable
	return this;
};

Util.el.prototype.on = function (type, callback, data, selector) {
	// bind (event type, selector, event.data, function)
	$(this._element).on(type, selector || null, data || {}, callback);

	// chainable
	return this;
};

Util.el.prototype.self = function () {
	// native DOM element
	return this._element;
};
