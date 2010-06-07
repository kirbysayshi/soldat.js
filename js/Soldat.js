function Soldat(){
	var self = this;
	this.key = new ThrustKeys();
	this.renderObjects = Array();
	this.addedObjects = Array();
	this.frameRate = 60;
	this.frameInterval = 1000 / this.frameRate;
	this.timerRef;
	
	this.canvas = document.getElementById("soldat-stage");
	this.ctx = this.canvas.getContext('2d');
	this.backBuffer = document.createElement('canvas');
	this.backBuffer.width = this.canvas.width;
	this.backBuffer.height = this.canvas.height;
	this.backCtx = this.backBuffer.getContext('2d');
	
	this.assetList = {
		'ZeroMovement': 			['image', 'assets/mmzsheet.gif'],
		'LevelOne_lower': 			['image', 'assets/LevelOne_lower.png'],
		'LevelOne_upper': 			['image', 'assets/LevelOne_upper.png']
	};
	SOLDATASSETS = new AssetLoader(function(){
		self.init();
	});
	
	// FPS Meter
	this.fps = new FPSMonitor();
	this.fpsMeter = document.getElementById('fpsMeter');
	
	// GO!
	this.preload();
}

Soldat.prototype = {

	init: function(){
		var self = this;
		console.log("SOLDAT INIT");
		// init map
		this.map = new LevelOne(this.canvas.width, this.canvas.height);
		//this.map.scrollToAndCenter(0, 0);
		
		// init player
		this.player = new Player();
		this.player.setPositionOnMap(50, 50);
		this.player.setSequence('stop_down');
		this.addChild(this.player);
		
		// init other players
		
		// sync
		
		// bind debug keys, like pause
		window.addEventListener('keyup', function(e){
			switch(e.keyCode){
				case InputDetection.CTRL:
					if(self.timerRef != null) self.stop();
					else self.start();
					break;
			}
		}, false);
		
		// begin mainloop
		this.start();
	},
	main: function(){
		this.key.incrementThrusts();
		this.player.calculateVelocity();
		this.player.applyHorizontalVelocity();
		this.player.applyVerticalVelocity();
		this.map.scrollToAndCenter(this.player.mapX, this.player.mapY);
		this.render();
		this.checkGlobalKeys();
		this.fpsMeter.innerHTML = this.fps.check();
	},
	start: function(){
		var self = this;
		this.timerRef = setInterval(function(){
			self.main();
		}, this.frameInterval);
		console.log("Beginning Execution");
	},
	stop: function(){
		clearInterval(this.timerRef);
		this.timerRef = null;
		console.log("Ending Execution");
	},
	preload: function(){
		for(var a in this.assetList){
			console.log(a);
			SOLDATASSETS.queue( this.assetList[a][0], {src: this.assetList[a][1], name: a} );
		}
	},
	addChild: function(obj){
		this.addedObjects.push(obj);
	},
	_processNewChildren: function(){
		if( this.addedObjects.length != 0){
			for(var i = 0; i < this.addedObjects.length; i++){
				this.renderObjects.push(this.addedObjects[i]);
			}
			this.addedObjects = new Array();
			this._zSort();
		}
	},
	_zSort: function(){
		this.renderObjects.sort(function(a,b){return a.z - b.z;});
		return this;
	},
	render: function(){
		this.backCtx.clearRect(0, 0, this.backBuffer.width, this.backBuffer.height);
		// process current map layers
		this.map.drawBackground(this.backCtx);
		this.map.drawUnderlays(this.backCtx);
		
		// process display list
		this._processNewChildren();
		for(var i = 0; i < this.renderObjects.length; i++){
			this.renderObjects[i].draw(this.backCtx, this.map.x, this.map.y, this.renderObjects[i]);
			for(var c = 0; c < this.renderObjects[i].children.length; c++){
				this.renderObjects[i].children[i].draw(this.backCtx, this.map.x, this.map.y, this.renderObjects[i].children[i]);
			}
		}
		
		this.map.drawOverlays(this.backCtx);
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(this.backBuffer, 0, 0);
	},
	// handle global keys... what goes here?
	checkGlobalKeys: function(){
		if(this.key.isDown(InputDetection.D)){
			this.player.thrustRight(this.player.maxThrust * this.key.thrustPercentage(InputDetection.D));
		}
		
		if(this.key.isDown(InputDetection.A)){
			this.player.thrustLeft(this.player.maxThrust * this.key.thrustPercentage(InputDetection.A));
		}
	
		if(this.key.isDown(InputDetection.SPACE)){
			console.log(this.player.ax, this.player.vx);
			
		}
	
	},
	// x,y: position of main char relative to VIEWPORT
	scrollNeeded: function(direction, x, y){
		//console.log(x - (this.map.vWidth * 0.5));
		//console.log(y - (this.map.vHeight * 0.5));
		var right = x - (this.map.vWidth * 0.5) > 0.1;
		var left  = x - (this.map.vWidth * 0.5) < -0.1;
		var up 	  = y - (this.map.vHeight * 0.5) < -0.1;
		var down  = y - (this.map.vHeight * 0.5) > 0.1;
		
		if(direction == 'lowerright' && right && down){
			return true;
		} else if(direction == 'upperright' && right && up){
			return true;
		} else if(direction == 'lowerleft' && left && down){
			return true;
		} else if(direction == 'upperleft' && left && up){
			return true;
		} else if(direction == 'right' && right){
			return true;
		} else if(direction == 'left' && left){
			return true;
		} else if(direction == 'up' && up){
			return true;
		} else if(direction == 'down' && down){
			return true;
		} else
			return false;
	},
	

};