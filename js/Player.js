function Player(){
	
	this.addEventListener('InputDetection.W', function(){
		// move left
	}, false);
	
	
	ComplexSprite.call(this);
}

Player.prototype = new ComplexSprite();
Player.prototype.constructor = Player;