function Soldat(){
	var self = this;
	this.key = new InputDetection();
	this.renderObjects = Array();
	this.addedObjects = Array();
	this.frameRate = 60;
	this.timerRef;
	this.backBuffer = document.createElement('canvas');
	this.backBuffer.width = this.canvas.width;
	this.backBuffer.height = this.canvas.height;
	this.backCtx = this.backBuffer.getContext('2d');
	this.assetList = {
		'Name_to_reference_by': 			['assettype', "path/to/asset/name.png"]
	};
	this.as = new AssetLoader(function(){
		self.init();
	});
	
	
	// GO!
	this.preload();
}

Soldat.prototype = {

	init: function(){
		var self = this;
		
		// init player
		this.player = new Player();
		this.addChild(this.player);
		
		// init other players
		
		// sync
		
		// begin mainloop
		this.timerRef = setInterval(function(){
			self.main();
		});
	},
	main: function(){
		this.render();
	},
	preload: function(){
		for(var a in this.assetList){
			console.log(a);
			this.as.queue( this.assetList[a][0], {src: this.assetList[a][1], name: a} );
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
		//this.mt.draw(this.backCtx);
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(this.backBuffer, 0, 0);
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