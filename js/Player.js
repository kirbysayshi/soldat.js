function Player(){
	
	ComplexSprite.call(this);
}

Player.prototype = new ComplexSprite();
Player.prototype.constructor = Player;