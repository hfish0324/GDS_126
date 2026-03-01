/*------------------------------------------------------------------------------------------------------------------
IMPORTANT: This file has been modified with an additional "world" property. If you don't want an object to move within
the level it's "world" property should be set to {x:0, y:0}. Typically the player's world is {x:0, y:0}, while
everything in the level will use the level object as it's world.
--------------------------------------------------------------------------------------------------------------------*/

function GameObject(obj)
{
		this.x = canvas.width/2;
		this.y = canvas.height/2;
		this.start = {x:this.x, y:this.y};
		this.width = 100;
		this.height = 100;

		this.color = "#ff0000";
		this.force = 1;
		this.ax = 1;
		this.ay = 1;
		this.vx = 0;
		this.vy = 0;
		this.world = {x:0, y:0};

		// Main image reference (drawSprite uses this.img)
		this.img = new Image();

		// NEW: cache for multiple spritesheets (one per state)
		this._spriteImgs = {}; // src -> Image

		this.data;
		this.dir = 1;

		// Legacy "ready" flag; we also check img.complete to support cached/preloaded images
		var ready = false;

		Object.defineProperty(this, `hitBoxWidth`, {
			get : function () {return this._hitBoxWidth},
			set : function (_value) {this._hitBoxWidth = _value}
		});

		Object.defineProperty(this, `hitBoxHeight`, {
			get : function () {return this._hitBoxHeight},
			set : function (_value) {this._hitBoxHeight = _value}
		});

		this.setHitBox =  function(obj)
		{
			// left as-is (typo preserved to avoid changing existing behavior)
			this.hitboxWidth = obj.width;
			this.hitBoxHeight = obj.height;
			return this;
		};

		this.img.addEventListener(`load`, function(e){
			ready = true;
		});

		this.colColor = ``;
		this.fin = true;

		//the angle that the graphic is drawn facing.
		this.angle = 0;
		this.currentState = `idle`;
		this.currentFrame = 0;
		this.spriteData;
		this.counter;

		//------Allows us to pass object literals into the class to define its properties--------//
		if(obj!== undefined)
		{
			for(value in obj)
			{
				if(this[value]!== undefined)
				this[value] = obj[value];
			}
		}

	this._hitBoxWidth = this.width;
	this._hitBoxHeight = this.height;

	//whether or not the object can jump
	this.canJump = false;
	this.jumpHeight = -35;

	this.collisionPoints = {
		top:{x:0,y: -this.hitBoxHeight/2},
		right:{x:this.hitBoxWidth/2,y:0},
		bottom:{x:0,y:this.hitBoxHeight/2},
		left:{x:-this.hitBoxWidth/2,y:0}
	};

	console.log(this.collisionPoints);

	for(let i in this.collisionPoints)
	{
		Object.defineProperty(this, i, {
			get : function () {return {x:this.x+this.collisionPoints[i].x, y:this.y + this.collisionPoints[i].y, world:this.world}},
			set : function (_value) {this.collisionPoints[i] = _value}
		});
	}

	// NEW: ensure an Image exists & is cached for a given src
	this._getSpriteImage = function(src)
	{
		if(!src) return null;

		if(this._spriteImgs[src]) return this._spriteImgs[src];

		const im = new Image();
		im.src = src;
		this._spriteImgs[src] = im;
		return im;
	};

	// NEW: swap this.img to match currentState (uses states[state].src if present)
	this._syncImageToState = function()
	{
		if(!this.spriteData) return;

		const st = this.spriteData.states[this.currentState];
		const src = (st && st.src) ? st.src : (this.spriteData.info ? this.spriteData.info.src : null);
		const im = this._getSpriteImage(src);

		if(im)
		{
			this.img = im;
			ready = (this.img.complete && this.img.naturalWidth > 0);

			// keep legacy ready behavior if image wasn't already cached
			if(!ready)
			{
				this.img.addEventListener('load', function(){ ready = true; }, { once:true });
			}
		}
	};

	this.makeSprite = function(data)
	{
		this.spriteData = data;

		// Preload all unique state srcs for instant switching
		const states = this.spriteData.states;
		for(let stateName in states)
		{
			const src = states[stateName].src || (this.spriteData.info ? this.spriteData.info.src : null);
			if(src) this._getSpriteImage(src);
		}

		// Set initial image + counter
		this._syncImageToState();
		this.counter = this.spriteData.states[this.currentState].fps;
		return this;
	};

	this.changeState = function(_newState)
	{
		if(this.currentState != _newState && this.fin)
		{
			this.currentState = _newState;
			this.currentFrame = 0;

			// ✅ FIX: reset counter so the new animation plays from frame 0 correctly
			this.counter = this.spriteData.states[this.currentState].fps;

			// NEW: swap image to match state
			this._syncImageToState();

			// lockout for non-looping animations
			if(this.spriteData.states[this.currentState].cycle == false)
			{
				this.fin = false;
			}
		}
		return this;
	};

	this.play = function(_func=function(){return})
	{
		// ✅ FIX: use <= 0 so you don't get an extra tick stuck per frame
		if(this.counter <= 0)
		{
			this.currentFrame++;

			if(this.currentFrame > this.spriteData.states[this.currentState].frames.length - 1)
			{
				this.currentFrame = (this.spriteData.states[this.currentState].cycle)
					? 0
					: this.spriteData.states[this.currentState].frames.length - 1;
			}

			this.counter = this.spriteData.states[this.currentState].fps;
		}

		if(
			this.currentFrame == this.spriteData.states[this.currentState].frames.length - 1 &&
			this.spriteData.states[this.currentState].cycle == false
		)
		{
			this.fin = true;
			_func();
		}

		this.counter--;
		return this;
	};

	this.drawStaticImage = function(_args={})
	{
		let _data = {};
		_data.x = -this.width/2;
		_data.y = -this.height/2;
		_data.w = this.width;
		_data.h = this.height;

		for(let i in _args)
		{
			if(_args[i] !== undefined)
			{
				_data[i] = _args[i];
			}
		}

		const imgReady = ready || (this.img && this.img.complete && this.img.naturalWidth > 0);

		if(imgReady)
		{
			context.save();
			context.translate(this.x + this.world.x, this.y + this.world.y);
			context.scale(this.dir, 1);
			context.rotate(this.angle * Math.PI/180);

			context.drawImage(this.img, _data.x, _data.y, _data.w, _data.h);
			context.restore();
		}
		return this;
	};

	this.drawSprite = function()
	{
		const imgReady = ready || (this.img && this.img.complete && this.img.naturalWidth > 0);

		if(imgReady)
		{
			context.save();
			context.translate(this.x + this.world.x, this.y + this.world.y);
			context.scale(this.dir, 1);
			context.rotate(this.angle * Math.PI/180);

			let drawWidth = this.width;
			let drawHeight = this.height;

			if(this.spriteData.states[this.currentState].width)
			{
				drawWidth = this.spriteData.states[this.currentState].width;
			}
			if(this.spriteData.states[this.currentState].height)
			{
				drawHeight = this.spriteData.states[this.currentState].height;
			}

			context.drawImage(
				this.img,
				this.spriteData.states[this.currentState].frames[this.currentFrame].startX,
				this.spriteData.states[this.currentState].frames[this.currentFrame].startY,
				this.spriteData.states[this.currentState].frames[this.currentFrame].width,
				this.spriteData.states[this.currentState].frames[this.currentFrame].height,
				-this.width/2,
				-this.height/2,
				drawWidth,
				drawHeight
			);

			context.restore();
		}
		return this;
	};

	this.drawMask = function(_color)
	{
		context.save();
		context.fillStyle = _color;
		context.translate(this.x + this.world.x, this.y + this.world.y);
		context.fillRect((-this.width/2), (-this.height/2), this.width, this.height);
		context.restore();
		return this;
	};

	this.drawRect = function(_args={})
	{
		let _data = {};
		_data.x = -this.width/2;
		_data.y = -this.height/2;
		_data.w = this.width;
		_data.h = this.height;

		for(let i in _args)
		{
			if(_args[i] !== undefined)
			{
				_data[i]=_args[i];
			}
		}

		context.save();
		context.fillStyle = this.color;
		context.translate(this.x + this.world.x, this.y + this.world.y);
		context.rotate(this.angle * Math.PI/180);
		context.translate(_data.x, _data.y);
		context.fillRect(0, 0, _data.w, _data.h);
		context.restore();
	};

	this.drawCircle = function()
	{
		context.save();
		context.fillStyle = this.color;
		context.beginPath();
		context.translate(this.x + this.world.x, this.y + this.world.y);
		context.arc(0, 0, this.radius(), 0, 360 * Math.PI/180, true);
		context.closePath();
		context.fill();
		context.restore();
	};

	this.drawTriangle = function()
	{
		context.fillStyle = this.color;
		context.translate(this.x + this.world.x, this.y + this.world.y);
		context.rotate(this.angle * Math.PI/180);
		context.beginPath();
		context.moveTo(0 + this.width/2, 0);
		context.lineTo(0 - this.width/2, 0 - this.height/2);
		context.lineTo(0 - this.width/2, 0 + this.height/2);
		context.closePath();
		context.fill();
		context.restore();
	};

	this.render = function(_func=`drawRect`, _args=undefined)
	{
		this[_func](_args);
		return this;
	};

	this.move = function()
	{
		this.x += this.vx;
		this.y += this.vy;
	};

	this.overlap = function(obj)
	{
		if(obj.constructor.name === `GameObject`)
		{
			if(this.left.x + this.world.x <= obj.right.x + obj.world.x &&
			   this.right.x + this.world.x >= obj.left.x + obj.world.x &&
			   this.top.y + this.world.y <= obj.bottom.y + obj.world.y &&
			   this.bottom.y + this.world.y >= obj.top.y + obj.world.y)
			{
				return true;
			}
		}
		else
		{
			if(obj.x + obj.world.x >= this.left.x + this.world.x &&
			   obj.x + obj.world.x <= this.right.x + this.world.x &&
			   obj.y + obj.world.y >= this.top.y + this.world.y &&
			   obj.y + obj.world.y <= this.bottom.y + this.world.y)
			{
				return true;
			}
		}

		return false;
	};

	this.overlapShape = function(obj)
	{
		if(this.leftx + this.world.x <= obj.right.x + obj.world.x &&
		   this.right.x + this.world.x >= obj.left.x + obj.world.x &&
		   this.top.y + this.world.y <= obj.bottom.y + obj.world.y &&
		   this.bottom.y + this.world.y >= obj.top.y + obj.world.y)
		{
			return true;
		}
		return false;
	};

	this.overlapPoint = function(obj)
	{
		if(obj.x + obj.world.x >= this.left.x + this.world.x &&
		   obj.x + obj.world.x <= this.right.x + this.world.x &&
		   obj.y + obj.world.y >= this.top.y + this.world.y &&
		   obj.y + obj.world.y <= this.bottom.y + this.world.y)
		{
			return true;
		}
		return false;
	};

	this.radius = function(newRadius)
	{
		if(newRadius == undefined)
		{
			return this.width/2;
		}
		else
		{
			return newRadius;
		}
	};

	this.drawDebug = function()
	{
		var size = 5;
		context.save();
		context.fillStyle = "black";
		// left as-is (may be broken if left/right/top/bottom are not functions anymore)
		context.fillRect(this.left().x-size/2, this.left().y-size/2, size, size);
		context.fillRect(this.right().x-size/2, this.right().y-size/2, size, size);
		context.fillRect(this.top().x-size/2, this.top().y-size/2, size, size);
		context.fillRect(this.bottom().x-size/2, this.bottom().y-size/2, size, size);
		context.fillRect(this.x-size/2, this.y-size/2, size, size);
		context.restore();
	};
}