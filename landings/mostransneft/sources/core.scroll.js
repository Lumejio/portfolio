var Scroll = {
	WHEEL_INDEX: 1.35,
	THUMB_HIDE_TIME: 1100,

	pos: 0,
	realPos: 0,
	available: null,
	elem: $('.content-wrapper'),
	elemHeight: null,

	thumb: {
		elem: $('.scrollbar-thumb'),
		elemHeight: null,
		available: null,
		timer: null
	},

	init: function(){
		this.updateSizes();
		$(window).on('resizeEvent', this.updateSizes.bind(this) )
			.on('mousewheel', this.wheelHandler.bind(this) );

		this.initTouchEvents();
	},
	initTouchEvents: function(){
		var TIME_CONSTANT = 325, // ms

			pressed = false,
			reference, velocity, amplitude,
			frame, timestamp, ticker,
			offset = 0;

		function ypos(e) {
			if (e.originalEvent) e = e.originalEvent;
			if (e.targetTouches && (e.targetTouches.length >= 1)) {
				return e.targetTouches[0].clientY;
			}
			return e.clientY;
		}
		function scroll(y){
			offset = y;
			Scroll.pos = Math.max( 0, Math.min( Scroll.available, y ));
			Scroll.move( 0 );
		}

		function track(){
			var now, elapsed, delta, v;

			now = Date.now();
			elapsed = now - timestamp;
			timestamp = now;
			// offset= Scroll.pos;
			delta = offset - frame;
			frame = offset;

			v = 1000 * delta / (1 + elapsed);
			velocity = 0.8 * v + 0.2 * velocity;
		}
		function autoScroll() {
		    var elapsed, delta;

		    if (amplitude) {
		    	elapsed = Date.now() - timestamp;
		    	delta = -amplitude * Math.exp(-elapsed / TIME_CONSTANT);
		    	if (delta > 0.5 || delta < -0.5) {
		    		scroll(target + delta);
		    		requestAnimationFrame(autoScroll);
		    	} else {
		    		scroll(target);
		    	}
		    }
		}

		this.elem.on('touchstart',function(e){
			pressed = true;
			reference = ypos(e);

			offset = Scroll.realPos;

			velocity = amplitude = 0;
			frame = offset;
			timestamp = Date.now();
			clearInterval(ticker);
			ticker = setInterval(track, 100);

			// e.preventDefault();
			// e.stopPropagation();
		}).on('touchmove',function(e){
			var y, delta;
			if (pressed) {
				y = ypos(e);
				delta = reference - y;
				if (delta > 2 || delta < -2) {
					reference = y;
					scroll( offset+delta );
				}
			}
			// e.preventDefault();
			// e.stopPropagation();
		}).on('touchend',function(e){
			pressed = false;

			clearInterval(ticker);
			if (velocity > 10 || velocity < -10) {
				amplitude = 0.8 * velocity;
				target = Math.round(offset + amplitude);
				timestamp = Date.now();
				requestAnimationFrame(autoScroll);
			}

			// e.preventDefault();
			// e.stopPropagation();
		});
	},
	updateSizes: function(){
		var elemHeight = this.elemHeight = this.elem.height();
		this.available = elemHeight - w.height;

		var viewRel = w.height/elemHeight;
		this.thumb.elem.css('height', this.thumb.elemHeight = Math.max( 85, viewRel*w.height ) );

		// xxx on resize (pos if > max height)
	},
	move: function( duration ){
		var _this = this;

		TweenMax.to( this.elem, duration || 0.8, { y: -this.pos, ease: Power2.easeOut, onUpdate: function(){
			Scroll.realPos = -_this.elem[0]._gsTransform.y;
			$(window).trigger('scrollEvent');
		} });

		var thumb = this.thumb;
		var rel = this.pos/this.available;
		TweenMax.to( thumb.elem, 0.1, { y: rel*(w.height-thumb.elemHeight), ease: Power2.easeOut });

		clearTimeout( thumb.timer );
		thumb.elem.addClass('visible');
		thumb.timer = setTimeout(function(){
			thumb.elem.removeClass('visible');
		}, this.THUMB_HIDE_TIME );
	},
	wheelHandler: function(e){
		var _this = this;

		var wheelDelta = e.deltaFactor*e.deltaY*this.WHEEL_INDEX;
		this.pos = Math.max( 0, Math.min( this.available, this.pos - wheelDelta ));
		
		this.move( 0.8 );

		e.preventDefault();
	}
}
Scroll.init();
$(window).one('load', Scroll.updateSizes.bind(Scroll) );