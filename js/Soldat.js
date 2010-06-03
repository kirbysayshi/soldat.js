function Soldat(){
	this.key = new InputDetection();
	this.frameRate = 60;
	this.timerRef;
}

Soldat.prototype = {

	Init: function(){
		var self = this;
		this.timerRef = setInterval(function(){
			self.Main();
		});
	},
	Main: function(){
		this.Render();
	},
	Render: function(){
		
	}
	

};