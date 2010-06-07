function LevelOne(vwidth, vheight){
	this.mapname = "Level One";
	this.vHeight = vheight;
	this.vWidth = vwidth;
	this.backgroundColor = "#CCCCCC";
	
	Map.call(this, this.mapname, "LevelOne", this.vWidth, this.vHeight, this.backgroundColor);
	
	this.walkable = [
		// should identify the whole thing as walkable, with holes following
		{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 800 }, { x: 0, y: 800 },
	
		{ x: 64, y: 328 }, { x: 343, y: 298 }, { x: 403, y: 328 }, { x: 404, y: 395 }, 
		{ x: 65, y: 405 }, { x: 64, y: 328 }, // repeat first point 

		{ x: 428, y: 534 }, { x: 829, y: 461 }, { x: 928, y: 437 }, { x: 931, y: 633 }, 
		{ x: 427, y: 551 }, { x: 428, y: 534 }, // repeat first point 

		{ x: 31, y: 173 }, { x: 254, y: 173 }, { x: 254, y: 163 }, { x: 29, y: 157 }, 
		{ x: 31, y: 173 }, // repeat first point 
	];
}

LevelOne.prototype = new Map();
LevelOne.prototype.constructor = LevelOne;