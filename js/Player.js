function Player(){
	this.UNIQUEPROP = true;
	
	this.animationMetrics = {
		stop_down: [
			{xStart: 194, yStart: 6  , width: 34, height: 39, xHSOffset:  17, yHSOffset: 39, delay: 10}
		]
	};
	
	
	
	// physics stuff begin
	this.maxThrust = 2;
	this.mass = 200;
	this.friction = 0.8;
	this.gravAccel = 1; // this is positive because upper left is 0, 0, not lower left
	
	this.vx = 0;
	this.vy = 0;
	this.ax = 0;
	this.ay = 0;
	
	ComplexSprite.call(this, 'ZeroMovement', this.animationMetrics);
}

Player.prototype = new ComplexSprite();
Player.prototype.constructor = Player;

Player.prototype.applyHorizontalVelocity = function(){
	this.mapX += this.vx;
}

Player.prototype.applyVerticalVelocity = function(){
	this.mapY += this.vy;
}

Player.prototype.thrustRight = function(force){
	this.ax += force;
};

Player.prototype.thrustLeft = function(force){
	this.ax -= force;
};

Player.prototype.calculateVelocity = function(){
	this.ax *= this.friction;
	this.ay = (this.ay + this.gravAccel) * this.friction ;
	
	this.vx *= this.friction;
	this.vy *= this.friction;
	
	if(this.ax > -0.01 && this.ax < 0.01) this.ax = 0;
	if(this.ay > -0.01 && this.ay < 0.01) this.ay = 0;
	
	if(this.vx > -0.01 && this.vx < 0.01) this.vx = 0;
	if(this.vy > -0.01 && this.vy < 0.01) this.vy = 0;
	
	this.vx = (this.vx + this.ax);
	this.vy = (this.vy + this.ay);
};