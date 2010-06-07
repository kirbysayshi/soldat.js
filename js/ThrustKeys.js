function ThrustKeys(){
	InputDetection.call(this);
	this.thrustAmounts = [];
	this.limits = [];
	
	// default all keys to 100
	for(var prop in InputDetection){
		if(prop != "prototype"){
			this.limits[ InputDetection[prop] ] = 100; 
		}
	}
	
	// override keys here
	this.limits[InputDetection.SPACE] = 500; // 60 fps, inc++ each frame... == (ms / 1000) * fps
	//this.limits[InputDetection.CTRL] = 10;
	this.limits[InputDetection.D] = 100;

	var me = this;
	this.window = window;
	this.window.addEventListener('keydown', function(e){
		me._onKeyDown(e);
	}, false);
	this.window.addEventListener('keyup', function(e){
		me._onKeyUp(e);
	}, false);
}

ThrustKeys.prototype = new InputDetection();
ThrustKeys.prototype.constructor = ThrustKeys;

ThrustKeys.prototype.incrementThrusts = function(){
	for(var i = 0; i < this.thrustAmounts.length; i++){
		if(this.thrustAmounts[i] < this.limits[i]){
			this.thrustAmounts[i] += 1;
		} 
	}
};

ThrustKeys.prototype._onKeyDown = function(e){
	this.pressed[e.keyCode] = true;
	this.thrustAmounts[e.keyCode] = 0;
};
ThrustKeys.prototype._onKeyUp = function(e){
	this.pressed[e.keyCode] = undefined;
	this.lastkey = e.keyCode;
	this.thrustAmounts[e.keyCode] = undefined;
};
ThrustKeys.prototype.thrustPercentage = function(key){
	return this.thrustAmounts[key] / this.limits[key];
}