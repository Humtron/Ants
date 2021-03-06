var Ant = {
	DOM: {},
	Board: {
		// arrays of board objects
		players: [],
		hills: [],
		tiles: [],
		// start and end indices for each tile column
		tileColumnIDs: []
	},
	Turn: {
		round: 0,
		player: 0,
		move: 0
	},
	Settings: {
		board: {
			// tile backgrounds
			tileBackgrounds: [
				"tileMoss",
				"tileMoss2",
				"tileMoss3",
				"tileMoss4",
				"tileMoss5",
				"tileMoss6"				
			],
			// how many tiles to offset odd columns
			// and how many less tiles odd columns will have
			tileOffset: 1,
			// how many tile columns
			tileColumns: 5,
			// how many tiles to hide, to increase
			// board randomness
			tilesHidden: 6,
			// how many moves per turn by a player
			movesPerTurn: 1
		},
		ants: {
			// initial count
			workers: 3,
			queens: 1,
			food: 50,
			// cost of breeding
			workerCost: 4,
			queenCost: 10,
			// cost of upkeep
			workerUpkeep: 1,
			queenUpkeep: 5
		},
		food: {
			// at least this much food in each tile
			min: 7,
			// random range of food in each tile
			range: 15,
			// weight of tile placement (more distant columns should have more food)
			weight: 8
		}
	},
	Player: function (player) {
		// considered private properties, but must be
		// tied to "this" context so prototype can access them
		this._active = true;

		// public hereafter
		this.id = player.id;
		this.name = player.name;
		this.yielde = {
			last: 0,
			next: 0
		};
		this.upkeep = {
			next: 0
		};
	},
	Hill: function (hill) {
		// considered private properties, but must be
		// tied to "this" context so prototype can access them
		this._active = true;
		this._queens = Ant.Settings.ants.queens;
		this._workers = Ant.Settings.ants.workers;
		this._food = Ant.Settings.ants.food;

		// public hereafter
		this.type = "hill";
		this.id = hill.id;
		this.DOM = {};
	},
	Tile: function (tile) {
		var i;

		// considered private properties, but must be
		// tied to "this" context so prototype can access them
		this._active = true;
		this._food = tile.food;
		this._ants = [];
		this._workersTotal = 0;

		// public hereafter
		this.type = "tile";
		this.id = tile.id;
		this.col = tile.col;
		this.DOM = {};

		// add all players to local ants array
		for (i = 0; i < Ant.Board.players.length; i++) {
			this._ants.push({
				workers: 0
			});
		}
	}
};

Ant.Player.prototype.active = function (bool) {
	if (Util.getType(bool) === "boolean") {
		this._active = bool;
	}
	return this._active;
};

// bind is called manually when DOM is ready
Ant.Hill.prototype.bind = function () {
	// object literal with all DOM bindings
	this.DOM = {
		self: $("#Hill" + this.id),
		dragWorker: $("#Hill" + this.id + " div.hillWorkers"),
		food: $("#Hill" + this.id + "Food"),
		queens: $("#Hill" + this.id + "Queens"),
		workers: $("#Hill" + this.id + "Workers")
	};
};

Ant.Hill.prototype.active = function (bool) {
	if (Util.getType(bool) === "boolean") {
		this._active = bool;

		// hides without affecting layout
		if (!this._active) {
			this.DOM.self.removeClass("hillActive").addClass("hillInactive");
		}
	}
	return this._active;
};

Ant.Hill.prototype.food = function (num) {
	if (Util.getType(num) === "number") {
		this._food = num;
		this.DOM.food.text(num);
	}
	return this._food;
};

Ant.Hill.prototype.queens = function (num) {
	if (Util.getType(num) === "number") {
		this._queens = num;
		this.DOM.queens.text(num);
	}
	return this._queens;
};

Ant.Hill.prototype.workers = function (num) {
	// update workers
	if (Util.getType(num) === "number") {
		this._workers = num;
		this.DOM.workers.text(num);

		// enable draggable if workers exist
		if (this._workers > 0) {
			this.DOM.dragWorker.draggable("enable");
		} else {
			this.DOM.dragWorker.draggable("disable");
		}
	}

	return this._workers;
};

Ant.Hill.prototype.yielde = function () {
	return 0;
};

Ant.Hill.prototype.markActive = function (active) {
	if (active) {
		this.DOM.self.addClass("hillActive");
		this.DOM.workers.removeClass("spanGray").addClass("spanYellow");

		// enable draggable if workers exist
		if (this._workers > 0) {
			this.DOM.dragWorker.draggable("enable");
		} else {
			this.DOM.dragWorker.draggable("disable");
		}
	} else {
		this.DOM.self.removeClass("hillActive");
		this.DOM.workers.removeClass("spanYellow").addClass("spanGray");
		this.DOM.dragWorker.draggable("disable");
	}
};

// bind is called manually when DOM is ready
Ant.Tile.prototype.bind = function () {
	// object literal with all DOM bindings
	this.DOM = {
		self: $("#Tile" + this.id),
		dragWorker: $("#Tile" + this.id + " div.iconAnt"),
		antsWrapper: $("#Tile" + this.id + " div.tileAnts"),
		food: $("#Tile" + this.id + "Food"),
		ants: $("#Tile" + this.id + "Ants"),
		total: $("#Tile" + this.id + "AntsTotal")
	};
};

Ant.Tile.prototype.active = function (bool) {
	if (Util.getType(bool) === "boolean") {
		this._active = bool;

		// hides without affecting layout
		if (!this._active) {
			this.DOM.self.css("visibility", "hidden");
		} else {
			this.DOM.self.css("visibility", "visible");
		}
	}
	return this._active;
};

Ant.Tile.prototype.food = function (num) {
	if (Util.getType(num) === "number") {
		this._food = num;
		this.DOM.food.text(num);
	}
	return this._food;
};

// get/set workers for a player, or get all workers
Ant.Tile.prototype.workers = function (num, player) {
	if (Util.getType(player) === "number") {
		if (Util.getType(num) === "number") {
			// update total (new minus old)
			this._workersTotal += num - this._ants[player].workers;
			this._ants[player].workers = num;

			this.DOM.ants.text(this._ants[player].workers);
			this.DOM.total.text(this._workersTotal);

			// if no workers, hide worker display, and mark inactive
			if (this._workersTotal < 1) {
				this.DOM.self.removeClass("tileColonized");
				this.DOM.antsWrapper.hide();
				this.DOM.dragWorker.addClass("cloak");
				this.markActive(false);
			} else {
				this.DOM.self.addClass("tileColonized");
				this.DOM.antsWrapper.show();

				// show draggable if workers exist, and player is current player, and mark active
				if (this._ants[player].workers > 0 && player === Ant.Turn.player) {
					this.DOM.dragWorker.removeClass("cloak");
					this.markActive(true);
				} else {
					this.DOM.dragWorker.addClass("cloak");
					this.markActive(false);
				}
			}
		}
		
		// return workers for this player
		return this._ants[player].workers;
	} else {
		// return total ants for all players
		return this._workersTotal;
	}
};

// get yield for a player, and allow hypothetical yield calculation
Ant.Tile.prototype.yielde = function (player, options) {
	var playerYield = 0,
		playerWorkers = this.workers(null, player),
		allWorkers = this.workers();

	if (Util.getType(player) === "number") {
		// allow potential yield calculations via options object
		if (Util.getType(options) === "object") {
			// overwrite playerWorkers with theoretical worker number
			// and allWorkers with difference
			if (Util.getType(options.workers) === "number") {
				allWorkers += options.workers - playerWorkers;
				playerWorkers = options.workers;
			}
		}

		// check if player even has workers here
		if (playerWorkers > 0) {
			// yield is the percentage of this player's workers
			// measured against all workers in the tile
			// multiplied against the total food in the tile
			playerYield = Math.floor((playerWorkers / allWorkers) * this.food());

			// if workers take home less than 1 food each, 
			// force minimum food per worker to 1 food
			if (playerYield === 0) { playerYield = playerWorkers; }
		}
	}

	return playerYield;
};

Ant.Tile.prototype.markActive = function (active) {
	if (active) {
		this.DOM.self.addClass("tileActive");
	} else {
		this.DOM.self.removeClass("tileActive");
	}
};

// mark possible move
Ant.Tile.prototype.markMove = function (active) {
	if (active) {
		this.DOM.self.addClass("tileMove");
	} else {
		this.DOM.self.removeClass("tileMove");
	}
};

// bind DOM controls for speed
Ant.DOM.bind = function () {
	Ant.DOM.Meta = $("#Meta");
	Ant.DOM.Turn = $("#Turn");
	//Ant.DOM.Player = $("#Player");
	Ant.DOM.Moves = $("#Moves");
	Ant.DOM.MovesPlural = $("#MovesPlural");
	Ant.DOM.Upkeep = $("#Upkeep");
	Ant.DOM.Yielde = $("#Yielde");
	Ant.DOM.Board = $("#Board");
	Ant.DOM.Hills = $("#Hills");
	Ant.DOM.Tiles = $("#Tiles");
};

Ant.Board.reset = function () {
	Ant.Turn.round = 0;
	Ant.Turn.player = 0;
	Ant.Board.players = [];
	Ant.Board.hills = [];
	Ant.Board.tiles = [];
	Ant.Board.tileColumnIDs = [];

	Ant.DOM.Hills.empty();
	Ant.DOM.Tiles.empty();

	Ant.DOM.Meta.hide();
	Ant.DOM.Turn.hide();
	Ant.DOM.Board.hide();

	Util.yetiDelete();
};

Ant.Board.promptPlayers = function (numPlayers) {
	Util.yetiAdd("<h3>What are the names of the players?</h3>" +
		"<div id='PlayerNames'></div><br>" +
		"<div id='PlayerSettingsShow' class='marginBottom'><span class='spanLink'>Show advanced settings</span></div>" +
		"<div id='PlayerSettings' class='hide'>" +
		"<h3>What are the settings for this game?</h3>" +
		"<div class='marginBottom' style='overflow:hidden'>" +
		"<fieldset><legend>Hill</legend>" +
		"<ul class='normal'>" +
		"<li title='Initial workers in each hill'><label for='PlayerAntsWorkers'>Workers</label>" +
		"<input id='PlayerAntsWorkers' type='text' size='5' value='" + Ant.Settings.ants.workers + "'></li>" +
		"<li title='Initial queens in each hill'><label for='PlayerAntsQueens'>Queens</label>" +
		"<input id='PlayerAntsQueens' type='text' size='5' value='" + Ant.Settings.ants.queens + "'></li>" +
		"<li title='Initial food in each hill'><label for='PlayerAntsFood'>Food</label>" +
		"<input id='PlayerAntsFood' type='text' size='5' value='" + Ant.Settings.ants.food + "'></li>" +
		"</ul>" +
		"</fieldset>" +
		"<fieldset><legend>Tile food</legend>" +
		"<ul class='normal'>" +
		"<li title='Minimum food in each tile'><label for='PlayerFoodMin'>Minimum</label>" +
		"<input id='PlayerFoodMin' type='text' size='5' value='" + Ant.Settings.food.min + "'></li>" +
		"<li title='Random range of food in each tile'><label for='PlayerFoodRange'>Range</label>" +
		"<input id='PlayerFoodRange' type='text' size='5' value='" + Ant.Settings.food.range + "'></li>" +
		"<li title='Weight of tile placement (higher means more distant tiles have more food)'><label for='PlayerFoodWeight'>Weight</label>" +
		"<input id='PlayerFoodWeight' type='text' size='5' value='" + Ant.Settings.food.weight + "'></li>" +
		"</ul>" +
		"</fieldset>" +
		"<fieldset><legend>Board</legend>" +
		"<ul class='normal'>" +
		"<li title='Number of tile columns'><label for='PlayerBoardTileColumns'>Tile columns</label>" +
		"<input id='PlayerBoardTileColumns' type='text' size='5' value='" + Ant.Settings.board.tileColumns + "'></li>" +
		"<li title='Number of tiles to hide'><label for='PlayerBoardTileOffset'>Tiles hidden</label>" +
		"<input id='PlayerBoardTilesHidden' type='text' size='5' value='" + Ant.Settings.board.tilesHidden + "'></li>" +
		"<li title='How many moves can be made per turn'><label for='PlayerBoardTilesColonizedPerTurn'>Moves/turn</label>" +
		"<input id='PlayerBoardMovesPerTurn' type='text' size='5' value='" + Ant.Settings.board.movesPerTurn + "'></li>" +
		"</ul>" +
		"</fieldset>" +
		"<br style='clear:both'>" +
		"<fieldset><legend>Hatching cost</legend>" +
		"<ul class='normal'>" +
		"<li title='Cost of hatching a worker'><label for='PlayerAntsWorkerCost'>Worker</label>" +
		"<input id='PlayerAntsWorkerCost' type='text' size='5' value='" + Ant.Settings.ants.workerCost + "'></li>" +
		"<li title='Cost of hatching a queen'><label for='PlayerAntsQueenCost'>Queen</label>" +
		"<input id='PlayerAntsQueenCost' type='text' size='5' value='" + Ant.Settings.ants.queenCost + "'></li>" +
		"</ul>" +
		"</fieldset>" +
		"<fieldset><legend>Upkeep cost</legend>" +
		"<ul class='normal'>" +
		"<li title='Cost of upkeep for a worker'><label for='PlayerAntsWorkerUpkeep'>Worker</label>" +
		"<input id='PlayerAntsWorkerUpkeep' type='text' size='5' value='" + Ant.Settings.ants.workerUpkeep + "'></li>" +
		"<li title='Cost of upkeep for a queen'><label for='PlayerAntsQueenUpkeep'>Queen</label>" +
		"<input id='PlayerAntsQueenUpkeep' type='text' size='5' value='" + Ant.Settings.ants.queenUpkeep + "'></li>" +
		"</ul>" +
		"</fieldset>" +
		"</div>" +
		"</div>" +
		"<div class='clear'>" +
		"<input id='PlayerSubmit' type='button' value='Start game'>" +
		"<span id='PlayerCancel' class='spanLink'>Cancel</span>" +
		"</div>"
	);

	for (var i = 0; i < numPlayers; i++) {
		$("#PlayerNames").append(
			new Util.el("label", { "for": "Player" + i })
				.append("Player " + (i + 1))
				.self(),
			new Util.el("input", {
					"id": "Player" + i,
					"type": "text",
					"maxlength": "10"
				})
				.append()
				.self(),
			new Util.el("br").self()
		);
	}

	$("#PlayerSettingsShow").click(function () {
		$("#PlayerSettingsShow").hide();
		$("#PlayerSettings").show();
	});
	$("#PlayerSubmit").click(function () {
		Ant.Turn.first(numPlayers);
		Util.yetiDelete();
	});
	$("#PlayerCancel").click(function () {
		Util.yetiDelete();
	});
	$("#Player0").focus();
};

Ant.Board.createSettings = function () {
	// set game settings
	Ant.Settings.board.tileColumns = Util.cleanNumber($("#PlayerBoardTileColumns").val());
	Ant.Settings.board.tilesHidden = Util.cleanNumber($("#PlayerBoardTilesHidden").val());
	Ant.Settings.board.movesPerTurn = Util.cleanNumber($("#PlayerBoardMovesPerTurn").val());
	Ant.Settings.ants.workers = Util.cleanNumber($("#PlayerAntsWorkers").val());
	Ant.Settings.ants.queens = Util.cleanNumber($("#PlayerAntsQueens").val());
	Ant.Settings.ants.food = Util.cleanNumber($("#PlayerAntsFood").val());
	Ant.Settings.ants.workerCost = Util.cleanNumber($("#PlayerAntsWorkerCost").val());
	Ant.Settings.ants.queenCost = Util.cleanNumber($("#PlayerAntsQueenCost").val());
	Ant.Settings.ants.workerUpkeep = Util.cleanNumber($("#PlayerAntsWorkerUpkeep").val());
	Ant.Settings.ants.queenUpkeep = Util.cleanNumber($("#PlayerAntsQueenUpkeep").val());
	Ant.Settings.food.min = Util.cleanNumber($("#PlayerFoodMin").val());
	Ant.Settings.food.range = Util.cleanNumber($("#PlayerFoodRange").val());
	Ant.Settings.food.weight = Util.cleanNumber($("#PlayerFoodWeight").val());
};

Ant.Board.createPlayers = function (numPlayers) {
	var playerName;

	for (var i = 0; i < numPlayers; i++) {
		Ant.Board.players.push(
			new Ant.Player({
				id: i,
				name: "Player" + (i + 1)
			})
		);

		// overwrite automatic name, if better name is provided
		playerName = $("#Player" + i).val();
		if (playerName) {
			Ant.Board.players[i].name = playerName;
		}
	}
};

Ant.Board.createHill = function (id) {
	Ant.Board.hills.push(
		new Ant.Hill({
			id: id
		})
	);

	return new Util.el("div", {
			"id": "Hill" + id,
			"data-id": id,
			"class": "hill"
		})
		.append(
			new Util.el("div", { "class": "hillText" })
				.append(
					new Util.el("div", { "class": "hillName" })
						.append(Ant.Board.players[id].name)
						.self(),
					new Util.el("div", { "class": "hillFood" })
						.append(
							new Util.el("span", { "class": "hillWrapper" })
								.append(
									new Util.el("span", { "id": "Hill" + id + "Food" })
										.append(Ant.Settings.ants.food)
										.self(),
									" ",
									new Util.el("div", {
											"title": "Cake. Delicious.",
											"class": "iconFood"
										})
										.self()
								)
								.self()
						)
						.self(),
					new Util.el("div", { "class": "hillQueens" })
						.append(
							new Util.el("span", { "class": "hillWrapper" })
								.append(
									new Util.el("span", { "id": "Hill" + id + "Queens" })
										.append(Ant.Settings.ants.queens)
										.self(),
									" ",
									new Util.el("div", {
											"title": "Queens. Precious.",
											"class": "iconQueen"
										})
										.self()
								)
								.self()
						)
						.self(),
					new Util.el("div", { "class": "hillWorkersWrapper" })
						.append(
							new Util.el("div", {
									"data-id": id,
									"data-type": "hill",
									"title": "Workers (drag to swarm)",
									"class": "hillWorkers"
								})
								.append(
									new Util.el("div", { "class": "hillWorkersText" })
										.append(
											new Util.el("span", {
													"id": "Hill" + id + "Workers",
													"class": "spanGray"
												})
												.append(Ant.Settings.ants.workers)
												.self()
										)
										.self()
								)
								.self()
						)
						.self()
				)
				.self()
		)
		.self();
};

Ant.Board.createTile = function (id, col) {
	// random food weighted by tile's column
	var food = Ant.Settings.food.min + 
			Math.floor((Math.random() * Ant.Settings.food.range) + (col * Ant.Settings.food.weight)),
		// random background
		bg = Math.floor(Math.random() * Ant.Settings.board.tileBackgrounds.length);

	// upper bound
	if (food > 999) food = 999;

	Ant.Board.tiles.push(
		new Ant.Tile({
			id: id,
			col: col,
			food: food
		})
	);

	return new Util.el("div", {
			"id": "Tile" + id,
			"data-id": id,
			"class": "tile " + Ant.Settings.board.tileBackgrounds[bg]
		})
		.append(
			new Util.el("div", { "class": "tileText" })
				.append(
					new Util.el("div", { "class": "tileFood" })
						.append(
							new Util.el("span", { "id": "Tile" + id + "Food" })
								.append(food)
								.self()
						)
						.self(),
					new Util.el("div", {
							"data-id": id,
							"data-type": "tile",
							"title": "Workers (drag to swarm)",
							"class": "iconAnt cloak"
						})
						.self(),
					new Util.el("div", { "class": "tileAnts hide" })
						.append(
							new Util.el("span", { "id": "Tile" + id + "Ants" })
								.append(0)
								.self(),
							" / ",
							new Util.el("span", { "id": "Tile" + id + "AntsTotal" })
								.append(0)
								.self()
						)
						.self()
				)
				.self()
		)
		.self();
};

/*
For 4 random cols and N hidden tiles:
3: 1, 1, 1, 0
4: 1, 1, 1, 1
5: 2, 1, 1, 1
6: 2, 2, 1, 1
*/
Ant.Board.createRandomTiles = function(numTiles) {
	// indices of tiles to hide
	var hidden = [],
		// distribution of hidden tiles across columns
		dist = [],
		ids = Ant.Board.tileColumnIDs,
		i = 0, j = 0;

	// fill distribution array
	for (i = 0; i < Ant.Settings.board.tileColumns; i++) {
		dist.push(0);
	}

	// distribute hidden tiles across columns:
	// iterate over cols from right to left (decrement),
	// allocating 1 hidden per col, until 0 hiddens remain
	i = Ant.Settings.board.tileColumns;
	j = Ant.Settings.board.tilesHidden;
	while (j > 0) {
		i--;

		// ignore first column, and set back to last column
		if (i === 0) { i = Ant.Settings.board.tileColumns - 1; }

		dist[i] = dist[i] + 1;

		j--;
	}

	// assign random hiddens according to distribution array
	for (i = 0; i < dist.length; i++) {
		j = dist[i];

		// allocate all hidden tiles for this column
		while (j > 0) {
			hidden.push(ids[i].first + Math.floor(Math.random() * (ids[i].last - ids[i].first)));

			j--;
		}
	}

	// hide any tiles in hidden array
	for (i = 0; i < hidden.length; i++) {
		Ant.Board.tiles[hidden[i]].active(false);
	}
};

Ant.Board.create = function () {
	var tiles = [],
		// 3 tiles per player hill
		numTiles = 3 * Ant.Board.players.length,
		offset = 0,
		id = 0,
		i = 0, j = 0;

	// create player hills
	for (i = 0; i < Ant.Board.players.length; i++) {
		Ant.DOM.Hills.append(Ant.Board.createHill(i));
		Ant.Board.hills[i].bind();
		Ant.Board.hills[i].markActive(false);
	}

	// create columns of tiles, left to right
	for (i = 0; i < Ant.Settings.board.tileColumns; i++) {
		tiles = [];

		// modulus determines if odd column, and therefore needs offset
		offset = (i % 2 !== 0) ? Ant.Settings.board.tileOffset : 0;

		// note first index for current column
		Ant.Board.tileColumnIDs.push({
			first: id,
			last: 0
		});

		for (j = 0; j < (numTiles - offset); j++) {
			// id is self-incrementing because tiles are numbered sequentially 
			tiles.push(Ant.Board.createTile(id++, i));
		}

		// note last index for current column
		Ant.Board.tileColumnIDs[i].last = id - 1;

		Ant.DOM.Tiles.append(
			// create col for each set of tiles
			new Util.el("div", {
					"class": "tileCol",
					"style": "padding-top: " + (60 * (offset / 2)) + "px;"
				})
				.append(tiles)
				.self()
		);
	}

	// bind all tiles and set default display
	for (i = 0; i < Ant.Board.tiles.length; i++) {
		Ant.Board.tiles[i].bind();
		Ant.Board.tiles[i].markActive(false);
	}

	// randomize tiles to freshen board
	Ant.Board.createRandomTiles(numTiles);

	// bind all draggables and droppables for moving ants
	$("div.hillWorkers, div.iconAnt").draggable({
		cursor: "move",
		containment: "#Board",
		snap: "div.tile",
		snapMode: "inner",
		snapTolerance: 5,
		// clones and appends to body to allow draggable to move outside
		// without slipping behind the containing div
		helper: function () {
			return $(this).clone().appendTo("body")
				.addClass("iconDragging")
				.show();
		},
		start: function (event, ui) {
			Ant.Board.startMove($(this));
		},
		stop: function (event, ui) {
			Ant.Board.stopMove($(this));
		}
	});
	$("div.hillWorkers").draggable("disable");
	$("div.hill").droppable({
		hoverClass: "hillDrop",
		drop: function (event, ui) {
			Ant.Board.moveWorkers(ui.draggable, $(this));
		}
	});
	$("div.tile").droppable({
		hoverClass: "tileDrop",
		drop: function (event, ui) {
			Ant.Board.moveWorkers(ui.draggable, $(this));
		}
	}).droppable("disable");
	$("div.tile").click(function () {
		Ant.Board.viewTile(this);
	});
};

Ant.Board.buyQueens = function () {
	var max = Math.floor(Ant.Board.hills[Ant.Turn.player].food() / Ant.Settings.ants.queenCost);

	if (max < 1) {
		Util.yetiDelete();
		Util.yetiAdd("<h3>Wouldn't it be nice to hatch some queens?</h3>" +
			"<i>You can't afford to hatch any queens.</i><br><br>" +
			"<input id='PlayerSubmit' type='button' value='Okay, got it'>"
		);

		$("#PlayerSubmit").click(function () {
			Util.yetiDelete();
		});
	} else {
		Util.yetiDelete();
		Util.yetiAdd("<h3>How many queens?</h3>" +
			"<div id='PlayerSlider' style='width:300px;margin:10px'></div><br>" +
			"You'll hatch <span id='PlayerQueens' class='spanYellow marginSlim'>1</span> " +
			"<span id='PlayerQueensPlural'>queen</span> x " +
			"<span id='PlayerQueenCost' class='spanGray marginSlim'>" + Ant.Settings.ants.queenCost + "</span> food/queen = " +
			"<span id='PlayerCost' class='spanGreen marginSlim'>" + Ant.Settings.ants.queenCost + "</span> food.<br><br>" +
			"<input id='PlayerSubmit' type='button' value='Hatch queens'>" +
			"<span id='PlayerCancel' class='spanLink'>Cancel</span>"
		);
	
		$("#PlayerSlider").slider({
			value: 1,
			min: 1,
			max: max,
			step: 1,
			slide: function (event, ui) {
				$("#PlayerQueens").text(ui.value);
				$("#PlayerQueensPlural").text((ui.value === 1) ? "queen" : "queens");
				$("#PlayerCost").text(ui.value * Ant.Settings.ants.queenCost);
			}
		});
		$("#PlayerSubmit").click(function () {
			var numQueens = Util.cleanNumber($("#PlayerQueens").text());
	
			Ant.Board.addQueens(numQueens);
			Util.yetiDelete();
		});
		$("#PlayerCancel").click(function () {
			Util.yetiDelete();
		});
	}
};

Ant.Board.buyWorkers = function () {
	var max = Math.floor(Ant.Board.hills[Ant.Turn.player].food() / Ant.Settings.ants.workerCost);

	if (max < 1) {
		Util.yetiDelete();
		Util.yetiAdd("<h3>Wouldn't it be nice to hatch some workers?</h3>" +
			"<i>You can't afford to hatch any workers.</i><br><br>" +
			"<input id='PlayerSubmit' type='button' value='Okay, got it'>"
		);

		$("#PlayerSubmit").click(function () {
			Util.yetiDelete();
		});
	} else {
		Util.yetiDelete();
		Util.yetiAdd("<h3>How many workers?</h3>" +
			"<div id='PlayerSlider' style='width:300px;margin:10px'></div><br>" +
			"<i>You have " + Ant.Board.hills[Ant.Turn.player].queens() +
			((Ant.Board.hills[Ant.Turn.player].queens() === 1) ? " queen" : " queens") + " available to hatch workers.</i><br><br>" +
			"You'll hatch <span id='PlayerWorkerSets' class='spanYellow marginSlim'>1</span> " +
			"<span id='PlayerWorkerSetsPlural'>brood</span> x " +
			"<span id='PlayerWorkerCost' class='spanGrayLight marginSlim'>" + Ant.Settings.ants.workerCost + "</span> food/brood = " +
			"<span id='PlayerCost' class='spanGreen marginSlim'>" + Ant.Settings.ants.workerCost + "</span> food = " +
			"<span id='PlayerWorkers' class='spanGray marginSlim'>" + Ant.Board.hills[Ant.Turn.player].queens() + "</span> " +
			"<span id='PlayerWorkersPlural'>workers</span>.<br><br>" +
			"<input id='PlayerSubmit' type='button' value='Hatch workers'>" +
			"<span id='PlayerCancel' class='spanLink'>Cancel</span>"
		);
	
		$("#PlayerSlider").slider({
			value: 1,
			min: 1,
			max: max,
			step: 1,
			slide: function (event, ui) {
				$("#PlayerWorkerSets").text(ui.value);
				$("#PlayerWorkerSetsPlural").text((ui.value === 1) ? "brood" : "broods");
				$("#PlayerCost").text(ui.value * Ant.Settings.ants.workerCost);
				$("#PlayerWorkers").text(ui.value * Ant.Board.hills[Ant.Turn.player].queens());
				$("#PlayerWorkersPlural").text((ui.value * Ant.Board.hills[Ant.Turn.player].queens() === 1) ? "worker" : "workers");
			}
		});
		$("#PlayerSubmit").click(function () {
			var numWorkers = Util.cleanNumber($("#PlayerWorkerSets").text()) * Ant.Board.hills[Ant.Turn.player].queens();
	
			Ant.Board.addWorkers(numWorkers);
			Util.yetiDelete();
		});
		$("#PlayerCancel").click(function () {
			Util.yetiDelete();
		});
	}
};

Ant.Board.addQueens = function (numQueens) {
	var cost = Ant.Settings.ants.queenCost * numQueens;

	// check cost
	if (cost > Ant.Board.hills[Ant.Turn.player].food()) {
		return false;
	} else {
		Ant.Board.hills[Ant.Turn.player].food(Ant.Board.hills[Ant.Turn.player].food() - cost);
		Ant.Board.hills[Ant.Turn.player].queens(Ant.Board.hills[Ant.Turn.player].queens() + numQueens);

		Ant.Board.updateUpkeep(Ant.Turn.player);

		return true;
	}
};

Ant.Board.addWorkers = function (numWorkers) {
	// worker set cost
	var cost = (Ant.Settings.ants.workerCost * numWorkers) / Ant.Board.hills[Ant.Turn.player].queens();

	// check cost of worker sets
	if (cost > Ant.Board.hills[Ant.Turn.player].food()) {
		return false;
	} else {
		Ant.Board.hills[Ant.Turn.player].food(Ant.Board.hills[Ant.Turn.player].food() - cost);
		Ant.Board.hills[Ant.Turn.player].workers(Ant.Board.hills[Ant.Turn.player].workers() + numWorkers);

		Ant.Board.updateUpkeep(Ant.Turn.player);

		return true;
	}
};

Ant.Board.startMove = function (draggable) {
	var from, fromID = Util.cleanNumber(draggable.attr("data-id")),
		leftCol = 0, rightCol = 0,
		numTiles = 3 * Ant.Board.players.length,
		marked = [],
		i = 0;

	// abort if no player moves remaining
	if (Ant.Turn.move === Ant.Settings.board.movesPerTurn) {
		return false;
	}

	// find source
	// calls to workers() method will overload with player,
	// which is ignored on hills, but essential on tiles
	if (draggable.attr("data-type") === "hill") {
		from = Ant.Board.hills[fromID];
	} else {
		from = Ant.Board.tiles[fromID];
		leftCol = from.col - 1;
		rightCol = from.col + 1;
	}

	if (from.type === "hill") {
		// mark all tiles just right of hill
		Ant.Board.tiles[fromID * 3].markMove(true);
		Ant.Board.tiles[fromID * 3 + 1].markMove(true);
		Ant.Board.tiles[fromID * 3 + 2].markMove(true);

		marked.push(fromID * 3);
		marked.push(fromID * 3 + 1);
		marked.push(fromID * 3 + 2);
	} else {
		// same col:
		// guarded on whether from is not first or last in column
		// if first, set to last, or vice versa, to create "round" board
		if (fromID > Ant.Board.tileColumnIDs[from.col].first) {
			Ant.Board.tiles[fromID - 1].markMove(true);
			marked.push(fromID - 1);
		} else {
			Ant.Board.tiles[Ant.Board.tileColumnIDs[from.col].last].markMove(true);
			marked.push(Ant.Board.tileColumnIDs[from.col].last);
		}

		if (fromID < Ant.Board.tileColumnIDs[from.col].last) {
			Ant.Board.tiles[fromID + 1].markMove(true);
			marked.push(fromID + 1);
		} else {
			Ant.Board.tiles[Ant.Board.tileColumnIDs[from.col].first].markMove(true);
			marked.push(Ant.Board.tileColumnIDs[from.col].first);
		}

		// left col:
		// guarded on whether a left col exists, and marked tiles are in column
		if (from.col > 0) {
			if ((fromID - numTiles) >= Ant.Board.tileColumnIDs[from.col - 1].first) {
				Ant.Board.tiles[fromID - numTiles].markMove(true);
				marked.push(fromID - numTiles);
			}

			if ((fromID - numTiles + 1) <= Ant.Board.tileColumnIDs[from.col - 1].last) {
				Ant.Board.tiles[fromID - numTiles + 1].markMove(true);
				marked.push(fromID - numTiles + 1);
			}
		}

		// right col:
		// guarded on whether a right col exists, and marked tiles are in column
		if (rightCol < Ant.Settings.board.tileColumns) {
			if ((fromID + numTiles - 1) >= Ant.Board.tileColumnIDs[from.col + 1].first) {
				Ant.Board.tiles[fromID + numTiles - 1].markMove(true);
				marked.push(fromID + numTiles - 1);
			}

			if ((fromID + numTiles) <= Ant.Board.tileColumnIDs[from.col + 1].last) {
				Ant.Board.tiles[fromID + numTiles].markMove(true);
				marked.push(fromID + numTiles);
			}
		}
	}

	// enable droppable on all marked tiles
	for (i = 0; i < marked.length; i++) {
		Ant.Board.tiles[marked[i]].DOM.self.droppable("enable");
	}
};

Ant.Board.stopMove = function (draggable) {
	$("div.tileMove").removeClass("tileMove").droppable("disable");
};

Ant.Board.moveWorkers = function (draggable, droppable) {
	var from, fromID = Util.cleanNumber(draggable.attr("data-id")),
		fromWorkers = 0, fromWorkersPlural = false,
		fromOldYield = 0, fromNewYield = 0,
		to, toID = Util.cleanNumber(droppable.attr("data-id")),
		toWorkers = 0,
		toOldYield = 0, toNewYield = 0,
		yielde = 0;

	// abort if no player moves remaining
	if (Ant.Turn.move === Ant.Settings.board.movesPerTurn) {
		Util.yetiDelete();
		Util.yetiAdd("<h3>Wouldn't it be nice to keep moving your ants forever?</h3>" +
			"<i>You don't have any moves left this turn.</i><br><br>" +
			"<input id='PlayerSubmit' type='button' value='Okay, got it'>"
		);

		$("#PlayerSubmit").click(function () {
			Util.yetiDelete();
		});
	
		return false;
	}

	// find source
	// calls to workers() method will overload with player,
	// which is ignored on hills, but essential on tiles
	if (draggable.attr("data-type") === "hill") {
		from = Ant.Board.hills[fromID];
	} else {
		from = Ant.Board.tiles[fromID];
	}

	if (droppable.attr("class").match(/hill/)) {
		to = Ant.Board.hills[toID];
	} else {
		to = Ant.Board.tiles[toID];
	}

	fromWorkers = from.workers(null, Ant.Turn.player);
	fromWorkersPlural = ((fromWorkers - 1) === 1) ? " worker" : " workers";
	toWorkers = to.workers(null, Ant.Turn.player);

	// abort if draggable === droppable, or both are hills,
	// or "to" hill is not this player,
	// or "to" tile is not active,
	// or not enough workers in "from"
	if ((from.type === to.type && from.id === to.id) ||
		(from.type === "hill" && to.type === "hill") ||
		(to.type === "hill" && to.id !== Ant.Turn.player) ||
		(to.type === "tile" && to.active() === false) ||
		(fromWorkers < 1)) {
		return false;
	}

	// calculate old and new yields on both from and to
	fromOldYield = from.yielde(Ant.Turn.player);
	fromNewYield = from.yielde(Ant.Turn.player, { workers: (fromWorkers - 1) });
	toOldYield = to.yielde(Ant.Turn.player);
	toNewYield = to.yielde(Ant.Turn.player, { workers: (toWorkers + 1) });

	// calculate potential yield change
	yielde = (toNewYield - toOldYield) + (fromNewYield - fromOldYield);

	Util.yetiDelete();
	Util.yetiAdd("<h3>How many workers will swarm?</h3>" +
		"<div id='PlayerSlider' style='width:300px;margin:10px'></div><br>" +
		"Swarm <span id='PlayerWorkers' class='spanYellow'>1</span> " +
		"<span id='PlayerWorkersPlural'>worker</span>.&nbsp;&nbsp;" +
		"<span id='PlayerLeft' class='spanGray'>" + (fromWorkers - 1) + "</span> " +
		"<span id='PlayerLeftPlural'>" + fromWorkersPlural + "</span> stay behind.&nbsp;&nbsp;" +
		"Your yield changes by " +
		"<span id='PlayerYield' class='" + ((yielde > 0) ? "spanGreen" : "spanRed") + "'>" + yielde + "</span> food.<br><br>" +
		"<input id='PlayerSubmit' type='button' value='Swarm workers'>" +
		"<span id='PlayerCancel' class='spanLink'>Cancel</span>"
	);

	$("#PlayerSlider").slider({
		value: 1,
		min: 1,
		max: from.workers(null, Ant.Turn.player),
		step: 1,
		slide: function (event, ui) {
			var fromWorkers = from.workers(null, Ant.Turn.player),
				fromOldYield = 0, fromNewYield = 0,
				toWorkers = to.workers(null, Ant.Turn.player),
				toOldYield = 0, toNewYield = 0,
				yielde = 0;

			$("#PlayerWorkers").text(ui.value);
			$("#PlayerWorkersPlural").text((ui.value === 1) ? "worker" : "workers");
			$("#PlayerLeft").text(fromWorkers - ui.value);
			$("#PlayerLeftPlural").text(((fromWorkers - ui.value) === 1) ? "worker" : "workers");

			// calculate old and new yields on both from and to
			fromOldYield = from.yielde(Ant.Turn.player);
			fromNewYield = from.yielde(Ant.Turn.player, { workers: (fromWorkers - ui.value) });
			toOldYield = to.yielde(Ant.Turn.player);
			toNewYield = to.yielde(Ant.Turn.player, { workers: (toWorkers + ui.value) });
		
			// calculate potential yield change
			yielde = (toNewYield - toOldYield) + (fromNewYield - fromOldYield);

			$("#PlayerYield").removeClass().addClass((yielde > 0) ? "spanGreen" : "spanRed").text(yielde);
		}
	});
	$("#PlayerSubmit").click(function () {
		var numAnts = Util.cleanNumber($("#PlayerWorkers").text());

		// move workers
		from.workers((from.workers(null, Ant.Turn.player) - numAnts), Ant.Turn.player);
		to.workers((to.workers(null, Ant.Turn.player) + numAnts), Ant.Turn.player);

		// update move
		Ant.Turn.nextMove();

		// calculate new yield
		Ant.Board.updateYield(Ant.Turn.player);

		Util.yetiDelete();
	});
	$("#PlayerCancel").click(function () {
		Util.yetiDelete();
	});
	$("#PlayerWorkers").focus();
};

Ant.Board.updateYield = function (player) {
	var yielde = 0;

	// calculate player yield from each tile
	for (var i = 0; i < Ant.Board.tiles.length; i++) {
		yielde += Ant.Board.tiles[i].yielde(player);
	}

	Ant.Board.players[player].yielde.next = yielde;

	// update board if current player
	if (player === Ant.Turn.player) {
		Ant.DOM.Yielde.text(yielde);

		if (yielde > 0) {
			Ant.DOM.Yielde.removeClass("spanRed").addClass("spanGreen");
		} else {
			Ant.DOM.Yielde.removeClass("spanGreen").addClass("spanRed");
		}
	}
};

Ant.Board.updateUpkeep = function (player) {
	var upkeep = 0;

	// calculate player upkeep on the hill
	upkeep += (Ant.Board.hills[player].workers() * Ant.Settings.ants.workerUpkeep) +
		(Ant.Board.hills[player].queens() * Ant.Settings.ants.queenUpkeep);

	// calculate player upkeep from each tile
	for (var i = 0; i < Ant.Board.tiles.length; i++) {
		if (Ant.Board.tiles[i].workers() > 0) {
			upkeep += Ant.Board.tiles[i].workers(null, player) * Ant.Settings.ants.workerUpkeep;
		}
	}

	Ant.Board.players[player].upkeep.next = upkeep;

	// update board if current player
	if (player === Ant.Turn.player) {
		Ant.DOM.Upkeep.text(upkeep);
	}
};

Ant.Board.viewTile = function (tile) {
	var t = Ant.Board.tiles[$(tile).attr("data-id")],
		rows = [];

	Util.yetiDelete();
	Util.yetiAdd("<h3>Tile demographic</h3>" +
		"<div id='PlayerDemographic'></div><br>" +
		"<span id='PlayerCancel' class='spanLink'>Close</span>"
	);

	if (t.workers() > 0) {
		// show workers and yield for each player
		for (var i = 0; i < Ant.Board.players.length; i++) {
			rows.push(
				new Util.el("tr")
					.append(
						new Util.el("td")
							.append(Ant.Board.players[i].name)
							.self(),
						new Util.el("td")
							.append(
								new Util.el("span", { "class": "spanYellow marginSlim" })
									.append(t.workers(null, i))
									.self(),
								" worker" + ((t.workers(null, i) === 1) ? "" : "s") + " "
							)
							.self(),
						new Util.el("td", { "class": "right" })
							.append(
								new Util.el("span", { "class": "spanGreen marginSlim" })
									.append(t.yielde(i))
									.self(),
								" yield"
							)
							.self()
					)
					.self()
			);
		}

		$("#PlayerDemographic").append(
			new Util.el("table", {
					"class": "rowDivider",
					"width": 300
				})
				.append(rows)
				.self()
		);
	} else {
		$("#PlayerDemographic").html("<i>No ants have colonized this area yet.</i>");
	}

	$("#PlayerCancel").click(function () {
		Util.yetiDelete();
	});
};

Ant.Board.viewScore = function () {
	var player,
		rows = [];

	Util.yetiDelete();
	Util.yetiAdd("<h3>Score &mdash; Round " + Ant.Turn.round + "</h3>" +
		"<div id='PlayerDemographic'></div><br>" +
		"<span id='PlayerCancel' class='spanLink'>Close</span>"
	);

	// show workers and yield for each player
	for (var i = 0; i < Ant.Board.players.length; i++) {
		player = Ant.Board.players[i];

		// update stats
		Ant.Board.updateYield(i);
		Ant.Board.updateUpkeep(i);

		rows.push(
			new Util.el("tr")
				.append(
					new Util.el("td")
						.append(player.name)
						.self(),
					new Util.el("td", { "class": "right" })
						.append(
							new Util.el("span", {
									"class": ((player.yielde.last > 0) ? "spanGreen" : "spanRed") + " marginSlim"
								})
								.append(player.yielde.last)
								.self(),
							" last yield"
						)
						.self(),
					new Util.el("td", { "class": "right" })
						.append(
							new Util.el("span", {
									"class": ((player.yielde.next > 0) ? "spanGreen" : "spanRed") + " marginSlim"
								})
								.append(player.yielde.next)
								.self(),
							" next yield"
						)
						.self(),
					new Util.el("td", { "class": "right" })
						.append(
							new Util.el("span", { "class": "spanRed marginSlim" })
								.append(player.upkeep.next)
								.self(),
							" upkeep"
						)
						.self()
				)
				.self()
		);
	}

	$("#PlayerDemographic").append(
		new Util.el("table", {
				"class": "rowDivider",
				"width": 500
			})
			.append(rows)
			.self()
	);

	$("#PlayerCancel").click(function () {
		Util.yetiDelete();
	});
};

Ant.Turn.first = function (numPlayers) {
	Ant.Board.createSettings();
	Ant.Board.createPlayers(numPlayers);
	Ant.Board.create();

	Ant.Turn.updatePlayer();
	Ant.Turn.nextRound();

	Ant.DOM.Meta.show();
	Ant.DOM.Turn.show();
	Ant.DOM.Board.show();
};

Ant.Turn.nextMove = function () {
	var move = 0;

	Ant.Turn.move++;

	move = Ant.Settings.board.movesPerTurn - Ant.Turn.move;

	Ant.DOM.Moves.text(move);
	Ant.DOM.MovesPlural.text((move === 1) ? "move" : "moves");

	if (move > 0) {
		Ant.DOM.Moves.removeClass("spanGrayLight").addClass("spanGray");
	} else {
		Ant.DOM.Moves.removeClass("spanGray").addClass("spanGrayLight");
	}
};

Ant.Turn.nextPlayer = function () {
	var last = Ant.Turn.player,
		next = last + 1,
		player,
		foundActive = false,
		nextRound = false;

	// if not first turn, assess yield, then upkeep
	if (Ant.Turn.round > 0) {
		Ant.Turn.doYield();
		Ant.Turn.doUpkeep();
	}

	// update previous player's hill to inactive
	Ant.Board.hills[last].markActive(false);

	// find next active player
	while (!foundActive) {
		// check if next should be first player in next round
		if (next >= Ant.Board.players.length) {
			next = 0;
			nextRound = true;
		}

		player = Ant.Board.players[next];

		if (player.active()) {
			foundActive = true;
		} else {
			// if no active players, return to prevent infinite loop
			if (last === next) {
				return false;
			}

			next++;
		}
	}

	Ant.Turn.player = next;
	Ant.Turn.updatePlayer();

	if (nextRound) { Ant.Turn.nextRound(); }
};

Ant.Turn.nextRound = function () {
	Ant.Turn.round++;
};

Ant.Turn.updatePlayer = function () {
	// update current player's hill to active
	Ant.Board.hills[Ant.Turn.player].markActive(true);

	// check all tiles for this player
	for (var i = 0; i < Ant.Board.tiles.length; i++) {
		// show draggable worker on tile if workers exist, and mark active
		if (Ant.Board.tiles[i].workers(null, Ant.Turn.player) > 0) {
			Ant.Board.tiles[i].markActive(true);
			Ant.Board.tiles[i].DOM.ants.text(Ant.Board.tiles[i].workers(null, Ant.Turn.player));
			Ant.Board.tiles[i].DOM.dragWorker.removeClass("cloak");
		} else {
			Ant.Board.tiles[i].markActive(false);
			Ant.Board.tiles[i].DOM.ants.text(0);
			Ant.Board.tiles[i].DOM.dragWorker.addClass("cloak");
		}
	}

	// reset player moves
	Ant.Turn.move = -1;
	Ant.Turn.nextMove();

	// reset yield and upkeep
	Ant.Board.updateYield(Ant.Turn.player);
	Ant.Board.updateUpkeep(Ant.Turn.player);
};

Ant.Turn.doUpkeep = function() {
	var player = Ant.Turn.player,
		hill = Ant.Board.hills[player], tile,
		// bind aliased functions to get correct context
		food = hill.food.bind(hill),
		yielde = Ant.Board.players[player].yielde.last,
		upkeep = Ant.Board.players[player].upkeep.next,
		workers, i = 0,
		foodLeft = 0, deficit = 0,
		workersStarved = 0, queensStarved = 0;

	// check if food isn't enough to cover upkeep
	if (food() < upkeep) {
		foodLeft = food() - upkeep;

		if (foodLeft > 0) {
			food(food() - upkeep);
		} else {
			deficit = foodLeft;
			i = Ant.Board.tiles.length - 1;

			// starve workers, beginning in farthest tiles from hill
			while (deficit < 0 && i >= 0) {
				tile = Ant.Board.tiles[i];
				workers = tile.workers(null, player);

				// only analyze if player has workers in this tile
				if (workers > 0) {
					while (deficit < 0 && workers > 0) {
						// workers starve one by one
						tile.workers((workers - 1), player);
						deficit += Ant.Settings.ants.workerUpkeep;
						workers = tile.workers(null, player);
						workersStarved++;
					}
				}

				i--;
			}

			// if still deficit, starve workers in hill
			if (deficit < 0) {
				if (hill.workers() > 0) {
					while (deficit < 0 && hill.workers() > 0) {
						// workers starve one by one
						hill.workers(hill.workers() - 1);
						deficit += Ant.Settings.ants.workerUpkeep;
						workersStarved++;
					}
				}
			}

			// if still deficit, starve queens in hill
			if (deficit < 0) {
				if (hill.queens() > 0) {
					while (deficit < 0 && hill.queens() > 0) {
						// workers starve one by one
						hill.queens(hill.queens() - 1);
						deficit += Ant.Settings.ants.queenUpkeep;
						queensStarved++;
					}
				}
			}

			// calculate new yield and upkeep, due to worker starvation
			Ant.Board.updateYield(player);
			Ant.Board.updateUpkeep(player);
		}

		Util.yetiDelete();
		Util.yetiAdd("<h3>Starvation occurred for " + Ant.Board.players[player].name + ".</h3>" +
			"<i>Your hill had " + (food() - yielde) + "</span> food.&nbsp;&nbsp;" +
			"You gained " + yielde + " yield and owed " + upkeep + " upkeep.</i><br><br>" +
			"You have " +
			"<span class='" + ((foodLeft > 0) ? "spanGreen" : "spanRed") + " marginSlim'>" + 
			((foodLeft > 0) ? foodLeft : 0) + "</span> food remaining.<br><br>" +
			"<div id='PlayerWorkers'></div>" +
			"<div id='PlayerQueens'></div>" +
			"<input id='PlayerSubmit' type='button' value='Okay, got it'>"
		);

		// if no queens left alive, prevent default click on yetiBackground
		// from closing yeti: close must go through PlayerSubmit
		if (hill.queens() === 0) {
			$("div.yetiBackground").off("click");
		}

		// show ant starvation numbers
		if (workersStarved > 0) {
			$("#PlayerWorkers").addClass("marginBottomSlim")
				.html(
					"You lost <span class='spanRed marginSlim'>" + workersStarved + "</span> " +
					((workersStarved === 1) ? "worker" : "workers") + " to starvation."
				);
		}
		if (queensStarved > 0) {
			$("#PlayerQueens").addClass("marginBottomSlim")
				.html(
					"You lost <span class='spanRed marginSlim'>" + queensStarved + "</span> " +
					((queensStarved === 1) ? "queen" : "queens") + " to starvation."
				);
		}

		$("#PlayerSubmit").click(function () {
			Util.yetiDelete();

			// if no queens left alive, checkmate
			if (hill.queens() === 0) { Ant.Turn.gameOver(player); }
		});
	}

	// update board
	if (food() - upkeep > 0) {
		food(food() - upkeep);
	} else {
		food(0);
	}
};

Ant.Turn.doYield = function() {
	var hill = Ant.Board.hills[Ant.Turn.player],
		// bind aliased functions to get correct context
		food = hill.food.bind(hill),
		yielde = Ant.Board.players[Ant.Turn.player].yielde.next;

	// add yield to hill food
	food(food() + yielde);

	// save yield as last
	Ant.Board.players[Ant.Turn.player].yielde.last = yielde;
};

Ant.Turn.gameOver = function (player) {
	// mark player and hill inactive
	Ant.Board.players[player].active(false);
	Ant.Board.hills[player].active(false);

	Util.yetiDelete();
	Util.yetiAdd("<h3>Oh dear. You've gone extinct.</h3>" +
		"All your food is gone.<br>" +
		"All your workers are dead.<br>" +
		"All your queens are dead.<br><br>" +
		"From where the sun now stands, you will swarm no more forever.<br><br>" +
		"<input id='PlayerSubmit' type='button' value='Rest in peace'>"
	);

	// prevent default click on yetiBackground from
	// closing yeti: close must go through PlayerSubmit
	$("div.yetiBackground").off("click");

	$("#PlayerSubmit").click(function () {
		Util.yetiDelete();
	});
};

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
