// =========
//  General
// =========

var page = $('.page')[0];
var $thumb = $('body > .thumb');
var $parallax = $('.parallax-item');
var $background = $('body > .background');
var $overlay = $('.grab-overlay');
if ($.browser.mobile) $overlay.remove();

// Retina handle
if (window.devicePixelRatio > 1) {
	$('.\\@1.5x-available, .\\@2x-available, .\\@3x-available').each(function(i){
		if (this.hasAttribute('height') === false
		 && this.hasAttribute('width') === false
		 && this.naturalHeight > 0
		 && this.naturalWidth > 0) {
				// fallback
				this.height = this.naturalHeight;
				this.width = this.naturalWidth;
		}

		var rate = 0;
		if ($(this).hasClass('@1.5x-available')) rate = 1.5;
		if ($(this).hasClass('@2x-available') && (devicePixelRatio >= 2 || rate == 0)) rate = 2;
		if ($(this).hasClass('@3x-available') && (devicePixelRatio >= 3 || rate == 0)) rate = 3;
		if (rate === 0) return 'WTF';
		
		var src = this.src;
		var dotIndex = src.lastIndexOf('.');
		this.src = src.substr(0,dotIndex)+'@'+rate+'x'+src.substr(dotIndex);
	});
}

// Hover click-sound
if ($(document.body).hasClass('no-click-sound') === false) {
	var Click = new Audio();
		Click.src = 'media/click.mp3';
		Click.load();
		Click.volume = 0.25;
		Click.elements = 'a, .social-media li, .icons canvas, .slide-down-button';
	$(document).on('mouseenter', Click.elements, function(){
		Click.currentTime = 0;
		Click.play();
	});
}

// IE9 Placeholders
$('input, textarea').placeholder();

// Old browser fallbacks
if (!$.support.transition) {
	$('[class*="animation-"]').each(function(){
		var effect = this.className.match(/animation-[\w-]*/)[0];
		$(this).removeClass(effect);
	});
}
if (!$.support.flexBox) {
	$('.flex-blocks').each(function(){
		var fullWidth = this.offsetWidth;
		var blocksWidth = 0;

		var $blocks = $('> div, > article', this );
		var $rest = $('.block-rest', this );
			$blocks.not( $rest ).each(function(){
				blocksWidth += $(this).outerWidth(true);
			});
				blocksWidth -= ($rest.length-1)*6;
			$rest.each(function(){
				$(this).css('width', (fullWidth-blocksWidth)/$rest.length );
			});
	});
	$('.footer-block').each(function(){
		var fullWidth = 1170; // magic number
		var collector = 0;
		var $columns = $('.column', this ).each(function(){
			collector += $(this).outerWidth();
		});
		var margin = (fullWidth-collector)/($columns.length-1);
			$columns.not(':last').css('marginRight', margin );
	});
	$('.post-tags').each(function(i){
		var $share = $('.share-block', this );
		var width = $share.outerWidth() || 0;
		$('> p',this).css('width', $(this).width()-width-22 );
	});
}



// ==============
//  Constructors
// ==============

function ElementVisibility( elem, bindHeightCoef ){
	var _this = this;
		_this.elem = elem;
	var top = getOffsetTop( elem );
	var visible = this.visible = false;
	var callbacks = _this.todo = { show: [], hide: [], scroll: [] };
	bindHeightCoef = bindHeightCoef === undefined ? 0.5 : bindHeightCoef;

	$(window).on('pagePrepare resizeEvent',function(e){
		top = getOffsetTop( elem );
	});
	$(page).on('scrolling',function(e,pos){
		if (Scroll.skipTriggers) return;

		var initVisibility = visible;
		var top = getOffsetTop( elem ),
			height = elem.offsetHeight,
			bindHeight = bindHeightCoef*height;
			bindHeight = Math.min( bindHeight, w.height*0.4 );
		visible = _this.visible = (w.height-pos > top+bindHeight) && (-pos+bindHeight < top+height);
		if (visible) {
			callbacks.scroll.forEach(function( func, i ){
				func.call( _this, (w.height-pos-top)/height, pos );
			});
		}
		if (initVisibility == visible) return;
		callbacks[ visible ? 'show' : 'hide' ].forEach(function( func, i, cbArray ){
			func.call( _this, Scroll.position, top, height );
			if (func.once) cbArray[i] = function(){}
		});
	});

	_this.onshow = function( func, once ){
		if (once) func.once = true;
		callbacks.show.push( func );
	}
	_this.onhide = function( func, once ){
		if (once) func.once = true;
		callbacks.hide.push( func );
	}
	_this.onscroll = function( func ){
		callbacks.scroll.push( func );
	}
}

function TouchMove( opts ){
	var _this = this;
	var namespace = this.namespace = opts.namespace || 'touchmove';
	var vert = this.vertical = !!opts.vertical;
	var pageDir = vert ? 'clientY' : 'pageX';
	var inertia = this.inertia = {
		allow: opts.inertia || true
	}
	this.pos = opts.pos || 0;
	this.downed = false;

	var touched = false;
	opts.elem.on('mousedown.'+namespace+' touchstart.'+namespace, function(e){
		var touch = _this.touchEvent = e.type == 'touchstart';
		if (touch) {
			touched = true;
		} else {
			if (touched) return;
		}
		_this.hoax = false;
		_this.downed = true;
		if (!opts.noOverlay) $overlay.show();
		// if (!touch && opts.ondown) var ondown = opts.ondown.call( _this, _this.pos, e );
		if (opts.ondown) var ondown = opts.ondown.call( _this, _this.pos, e );
		var initX = e[ pageDir ] || e.originalEvent.touches[0][ pageDir ];
		var initPos = _this.pos;
		if (inertia.allow) {
			inertia.momentum = 0;
			inertia.X = initX;
			inertia.time = getTime();
		}
		if (touch) {
			e.stopPropagation();
			if (vert || opts.alwaysPrevent) {
				var prevent = true;
			} else {
				var prevent = null;
				var initY = e.originalEvent.touches[0].clientY;
			}
		}
		$(window).on('mousemove.'+namespace+' touchmove.'+namespace, function(e){
			var pointer = e[ pageDir ] || e.originalEvent.touches[0][ pageDir ];
			var diff = pointer - initX;
			if (touch) {
				if (prevent === null) {
					var pointerY = e.originalEvent.touches[0].clientY;
					prevent = Math.abs(pointerY-initY) < Math.abs(diff);
					if (prevent == false) {
						_this.hoax = true;
						$(window).triggerHandler('touchend');
					} else {
						// if (opts.ondown) var ondown = opts.ondown.call( _this, _this.pos, e );
					}
				}
				if (prevent == false) return;
			}
			_this.pos = initPos - diff;
			if (opts.onmove) var newPos = opts.onmove.call( _this, _this.pos, diff, e );
			if (typeof newPos == 'number') _this.pos = newPos;
			if (inertia.allow) {
				inertia.momentum = (pointer - inertia.X)/(getTime()+1-inertia.time);
				inertia.X = pointer;
				inertia.time = getTime();
			}
			if (!touch || (touch && prevent)) e.preventDefault();
		}).one('mouseup touchend',function(e){
			_this.downed = false;
			if (inertia.allow) _this.pos -= inertia.momentum*120;
			var diff = initPos - _this.pos;
			if (opts.onup) var newPos = opts.onup.call( _this, -_this.pos, diff, e );
			if (typeof newPos == 'number') _this.pos = newPos;
			if (!opts.noOverlay) $overlay.hide();
			$(window).off('mousemove.'+namespace).off('touchmove.'+namespace);
		});
		if (!touch && ondown === false) $(window).trigger('mouseup');
		if (!touch) e.preventDefault();
	});
}

function TouchBubbles( container ){
	var _this = this;
		_this.container = container;
	var canvas = this.canvas = document.createElement('canvas');
		canvas.className = 'touch-bubbles';
	canvas.setDimensions( container.offsetWidth, container.offsetHeight, false, false );
	// I think there's no point to Retinize these canvases
	var x = this.ctx = canvas.getContext('2d');
		x.strokeStyle = 'white';

	var $canvas = $(canvas).hide().addClass('grab-cursor').prependTo( container );

	var request,
		timestamp,
		opacitySaved;
	_this.X = _this.Y = 0;
	_this.opacity = 0;
	_this.visible = false;

	_this.show = function( x, y ){
		if ($.browser.mobile) return;
		$canvas.show();
		_this.visible = true;
		saveOpacity();
		if (_this.opacity == 0) _this.position( x, y );
	}
	_this.position = function( x, y ){
		if ($.browser.mobile) return;
		_this.X = x;
		_this.Y = y;
		cancelAnimationFrame( request );
		renderFrame();
	}
	_this.hide = function(){
		if ($.browser.mobile) return;
		_this.visible = false;
		saveOpacity();
	}
	_this.showEvent = function( e, offset ){
		offset = offset || 0;
		var inner = e.originalEvent || e;
			inner = e.touches ? e.touches[0] : e;
		_this.show( inner.pageX, inner.clientY+Scroll.position+offset );
	}
	_this.positionEvent = function( e, offset ){
		offset = offset || 0;
		var inner = e.originalEvent || e;
			inner = e.touches ? e.touches[0] : e;
		_this.position( inner.pageX, inner.clientY+Scroll.position+offset );
	}

	function saveOpacity(){
		timestamp = getTime();
		opacitySaved = _this.opacity;
	}
	function getOpacity( opacity ){
		var time = Math.min( _this.fadeDuration, getTime()-timestamp );
		var rel = MoveAnimation.easing.ease( time, 0, 1, _this.fadeDuration );
		var diff = (_this.visible ? 1 : 0) - opacitySaved;
		return opacitySaved + diff*rel;
	}
	function renderFrame(){
		x.clearCanvas();
		_this.opacity = getOpacity();
		if (_this.visible == false && _this.opacity == 0) return $canvas.hide();

		var dur = _this.interval,
			num = _this.linesNum;
		for (var i = 0; i < _this.linesNum; i++) {
			var t = ( (getTime() + (dur/num)*i) % dur )/dur;
				t = Math.min( 1, Math.max( 0, t ));
			var relative = -t*(t-2);

			x.lineWidth = 1+3*relative;
			x.globalAlpha = (1-relative)*0.2*Math.min( 1, _this.opacity );
			x.beginPath();
			x.arc( _this.X, _this.Y, relative*_this.radius+_this.baseRadius, 0, 2*Math.PI );
			x.stroke();
		}

		request = requestAnimationFrame( renderFrame );
	}
}
TouchBubbles.prototype = {
	baseRadius: 0,
	interval: 4000,
	linesNum: 5,
	radius: 100,
	fadeDuration: $.browser.mobile ? 100 : 500
}

function Togglers( opts ){
	var _this = this;
	this.active = 0;
	this.opts = opts;
		opts.amount = opts.amount || 0;
		opts.handler = opts.handler
	if (opts.style) opts.elem.addClass( opts.style );

	var $thumbOver = $('<hr class="over-active" />').appendTo( opts.elem );
	var $wrapper = $('<div class="movable" />').appendTo( opts.elem );
	for (var i = 0; i < opts.amount; i++) {
		$wrapper.append('<hr />');
	}

	var thumbWidth = opts.thumbWidth || $wrapper.children('hr').outerWidth( true );
	var marginLeft = parseInt( $wrapper.children('hr').css('marginLeft'), 10 ) || 0;
	opts.elem.css('width', opts.amount*thumbWidth );
	if (opts.absolute) opts.elem.css('marginLeft', opts.amount*thumbWidth/-2 );
	$wrapper.on('mousedown',function(e){
		e.stopPropagation();
	}).on('click','hr',function(e){
		$wrapper.find('.sheb').remove();

		var index = $wrapper.children('hr').index( this );
		opts.handler.call( _this, index );
		_this.setActive( index );
		e.preventDefault();
	});

	if (opts.amount < 2) $(opts.elem).addClass('one-toggler');

	this.setAmount = function( amount ){
		opts.amount = amount;
		opts.elem.css('width', amount*thumbWidth ).toggleClass('one-toggler', amount < 2 );
		if (opts.absolute) opts.elem.css('marginLeft', amount*thumbWidth/-2 );
			$wrapper.find('.sheb').remove();
		var $circles = $wrapper.find('hr:not(.sheb):not(.over-active)');
			$circles.slice( amount ).remove();
		for (var i = 0; i < amount; i++) {
			if ($circles[i] === undefined) $wrapper.append('<hr />');
		}
	}
	this.setActive = function( index ){
		if (index == _this.active) return;
		$wrapper.find('.sheb').remove();
		var direction = index < _this.active; // to the right?
		_this.active = index;

		// Reset
		$wrapper.add( $wrapper.children('hr') ).css({
			opacity: '',
			marginLeft: '',
			transition: '0s'
		});

		setTimeout(function(){
			$wrapper.append('<hr />').css('transform3d','translateX('+(direction ? -thumbWidth : thumbWidth )+'px)');
			if (direction) {
				$wrapper.children('hr:first').css('opacity', 0 );
				$wrapper.children('hr:last').addClass('sheb');
			} else {
				$wrapper.children('hr:first').css('marginLeft', -thumbWidth+marginLeft ).addClass('sheb');
				$wrapper.children('hr:last').css('opacity', 0 );
			}

			setTimeout(function(){
				$wrapper.add( $wrapper.children('hr') ).css('transition','.45s');
				$wrapper.css('transform3d','translateX(0)');
				$wrapper.children('hr:'+(direction ? 'last' : 'first') ).css('opacity', 0 );
				$wrapper.children('hr:'+(direction ? 'first' : 'last') ).css('opacity', 1 );
				if ($.support.transition) {
					$thumbOver.css('transform3d','translateX('+thumbWidth*index+'px) scale(1.12)');
				} else {
					$thumbOver.stop().animate({ left: thumbWidth*index }, 450 );
				}
			}, 10-10 );
		}, 10-10 );
	}
}

function Preloader( $container ){
	var svgCode = '<div class="preloader-box">\
	<svg viewBox="-2 -1 106 106" width="70px" height="70px" class="preloader">\
	<defs><filter id="blur"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5,1" /></filter></defs>\
	<path class="drib" d="M92,29c0,0-0.061-19.398-15-22c-9.445-1.645-11.993,4.08-12,7\
	c-0.004,1.832,1.753,6.201,6,6s3.118-1.947,9-2S89.118,22.482,92,29z"/>\
	<path class="drib" d="M95.79,64.313c0,0,13.246-14.172,4.146-26.302\
	c-5.753-7.668-11.532-5.245-13.537-3.122c-1.258,1.332-2.971,5.718,0.26,8.481c3.231,2.763,3.605,0.718,7.926,4.709\
	C98.906,52.069,98.156,57.59,95.79,64.313z"/>\
	<path class="drib" d="M72.381,90.905c0,0,19.353,1.367,23.518-13.269\
	c2.634-9.253-2.808-12.204-5.719-12.425c-1.827-0.139-6.368,1.283-6.614,5.514c-0.247,4.23,1.613,3.238,1.048,9.08\
	C84.048,85.646,79.185,88.525,72.381,90.905z"/>\
	<path class="drib" d="M38.165,95.71c0,0,13.023,14.379,26.159,6.697\
	c8.304-4.857,6.418-10.752,4.47-12.927c-1.222-1.364-5.485-3.48-8.59-0.598c-3.105,2.883-1.076,3.455-5.527,7.28\
	C50.226,99.987,44.723,98.7,38.165,95.71z"/>\
	<path class="drib" d="M10.03,73.406c0,0-0.645,19.189,13.984,22.792\
	c9.248,2.278,11.967-3.208,12.08-6.096c0.071-1.812-1.502-6.253-5.695-6.348c-4.193-0.094-3.144,1.711-8.942,1.358\
	C15.658,84.759,12.633,80.051,10.03,73.406z"/>\
	<path class="drib" d="M5.738,38.287c0,0-11.969,15.012-2.382,26.633\
	c6.061,7.347,11.517,4.568,13.331,2.318c1.138-1.411,2.526-5.914-0.781-8.492c-3.308-2.578-3.543-0.504-7.985-4.248\
	C3.479,50.755,3.861,45.172,5.738,38.287z"/>\
	<path class="drib" d="M29.455,9.937c0,0-19.167,1.131-21.402,16.029\
	c-1.413,9.419,4.301,11.62,7.186,11.465c1.81-0.097,6.087-2.074,5.794-6.257s-1.994-2.972-2.178-8.778\
	C18.67,16.59,23.079,13.143,29.455,9.937z"/>\
	<path class="drib" d="M64.234,5.833c0,0-14.84-12.182-26.596-2.762\
	c-7.433,5.955-4.732,11.451-2.508,13.296c1.395,1.158,5.877,2.611,8.502-0.66c2.625-3.271,0.554-3.536,4.36-7.923\
	C51.799,3.395,57.376,3.857,64.234,5.833z"/>\
	</svg></div>';

		$container = $($container);
	var $preloader = this.$preloader = $(svgCode).appendTo( $container );
	var _preloader = this;

	this.start = function( func ){
		if (!$.support.transition) {
			$preloader.css('opacity',0).stop().animate({ opacity: 1 }, 1200 );
			var CYCLETIME = 2000;
			(function tick(){
				var angle = (getTime() % CYCLETIME) / CYCLETIME * -360;
				$preloader.css('transform','rotate('+angle+'deg)');
				_preloader.sTimer = setTimeout( tick, 1000/40 );
			})();
		}
		$preloader.addClass('started');
		if (func) setTimeout( func, 1200 );
	}
	this.stop = function(){
		if (!$.support.transition) {
			$preloader.stop().animate({ opacity: 0 }, 1500, function(){
				clearTimeout( _preloader.sTimer );
				$(this).remove();
			});
		} else {
			$preloader.removeClass('started');
			setTimeout(function(){
				$preloader.remove();
			}, 2000 );
		}
	}
}

function handleAppendedBlocks( container ){
	drawIcons();
	$('.skills-block', container ).each(function(){
		var skills = new SkillsBlock( this );
	});
}



// ============
//  Navigation
// ============

var Menu = {
	SLIDE_WIDTH: 207,

	open: false,

	$container: $('.menu'),
	$nav: $('.menu nav'),
	$sections: $('section[data-name]'),
	$anchors: $(), // initially, it's empty jQ object waiting to add elements

	setActive: function( index ){
		this.$container.find('.active').removeClass('active');
		if (index < 0) return;
		this.$anchors.eq( index ).addClass('active');
	},
	resetMenu: function(){
		$(window).one('resizeEvent', this.resetMenu.bind(this));
		this.vertical = w.width <= 965;
		var positionCss = this.vertical && this.$container.height() > w.height ? 'absolute' : 'fixed';
		this.$container.css('position', positionCss );
		if (this.open) return;
		Menu.$container.addClass('resizable').css({ left: '', top: '' });
		if ($.support.transition) {
			if (this.vertical) {
				this.$anchors.css('transform3d','translateY(-70px)').css('opacity',0);
			} else {
				this.$anchors.css('transform3d','translateX(-'+Menu.SLIDE_WIDTH+'px)')
			}
		} else {
			if (this.vertical) {
				this.$anchors.css('top', -40 ).css('left','').css('opacity','');
			} else {
				this.$anchors.css('left', -Menu.SLIDE_WIDTH ).css('top','');
			}
		}
	},
	init: function(){
		this.$anchors = this.$nav.find('a').on('click',function(e){
			if (this.href === location.href) $(window).triggerHandler('hashchange');
		});
		this.resetMenu();
		this.$container.on('mouseenter',function(e){
			if (Menu.touched) return;
			Menu.open = true;
			Scroll.disabled = true;
			if ($.support.transition) {
				Menu.$container.transitOff().removeClass('resizable');
				runApart(function(){
					Menu.$container.addClass('showed');
				});
			} else {
				var anim = Menu.vertical ? { top: this.offsetHeight } : { left: this.offsetWidth };
				Menu.$container.stop(true).animate( anim, 700 );
			}
			Menu.$anchors.each(function( i ){
				var delay = Menu.vertical ? 100+(Menu.$anchors.length-i)*50 : 100+50*i;
				$(this).stop( true ).delay( delay ).queue(function(){
					if ($.support.transition) {
						$(this).css('transform3d','').css('opacity','').dequeue();
					} else {
						$(this).animate({ left: 0, top: 0 }, 500 ).dequeue();
					}
				});
			});
			var active = -1, saved = 0;
			Menu.$anchors.each(function(i){
				if (this.href.replace(/#.*/,'') != location.href.replace(/#.*/,'')) return;
				if (active == -1) active = 0;
				var hash = this.href.match(/#.*/);
				if (hash == null) return active = i;
					// hash = hash[0] ? hash[0].substr(1) : '';
					hash = hash[0].substr(1);
				// if (hash == '') return active = i;
				var pos = Menu.$sections.filter('[data-name="'+hash+'"]').getOffsetTop();
				if (pos <= Scroll.position+w.height*0.2 && pos > saved) {
					active = i;
					saved = pos;
				}
			});
			Menu.setActive( active );
		}).on('mouseleave',function(e){
			Scroll.disabled = false;
			if ($.support.transition) {
				Menu.$container.transitEnd( animationAfter ).removeClass('showed');
			} else {
				var anim = Menu.vertical ? { top: 50 } : { left: 50 };
				Menu.$container.stop(true).animate( anim, 700, animationAfter );
			}
			function animationAfter(){
				Menu.open = false;
				Menu.$anchors.stop( true ).css({
					left: '',
					transition: 'none'
				});
				Menu.resetMenu();
				runApart(function(){
					Menu.$anchors.css('transition','');
				});
			}
		}).on('touchstart',function(e){
			var touches = e.originalEvent.touches;
			if (touches[0] === undefined) return;

			var $tar = $(e.target);
			if ($tar.closest('.menu-inner').length) return;

			Menu.touched = true;
			Menu.$container.addClass('resizable');
			e.preventDefault();
			
			var dir = Menu.vertical ? 'Y' : 'X';
			var touchedTime = getTime();
			var startY = touches[0]['page'+dir];
			var startPos = Menu.$container.getTranslate()[dir];

			var pos = startPos;
			var max = -Menu.$container[ Menu.vertical ? 'height' : 'width' ]()-50;
			$(window).on('touchmove.menu',function(e){
				var touches = e.originalEvent.touches;
				var diff = touches[0]['page'+dir]-startY;
				pos = Math.min( -50, Math.max( startPos+diff, max ));
				Menu.$container.css('transform','translate'+dir+'('+pos+'px)');
			}).one('touchend',function(e){
				var rel = (pos+50)/(max+50);
				var shown = (function(){
					if (Menu.open) {
						return rel > 0.4 ? false : true;
					} else {
						return rel > 0.6 ? false : true;
					}
				})();

				var click = (getTime()-touchedTime < 400) && (Math.abs(startPos - pos) < 15);
				if (click) shown = !Menu.open;

				Menu.touched = false;
				Menu.$container.removeClass('resizable')
					.toggleClass('showed', shown ).css('transform','')
					.trigger( shown ? 'mouseenter' : 'mouseleave' );
				$(window).off('touchmove.menu');
			});
		});		
	}
}
Menu.init();

$(window).one('pageReady',function(e){
	Scroll.disabled = false;
	setTimeout(function(){
		if ($.support.transition) {
			Menu.$container.removeClass('resizable').addClass('ready').transitEnd(function(){
				$(this).addClass('resizable');
			});
		} else {
			var anim = Menu.vertical ? { top: 50 } : { left: 50 };
			Menu.$container.animate( anim, 700, 'bez_0p25,0p1,0p25,1', function(){
				$(this).css({ top: '', left: '' }).addClass('ready');
			});
		}
	}, 700 );
});

$(window).on('hashchange', handleHash ).one('pageReady', handleHash );
function handleHash( e ){
	if (pageReady == false) return;

	var hash = location.hash.substr(1);

	var $target = $('section[data-name="'+hash+'"]');
	var pos = $target.getOffsetTop() || 0;
		pos = Math.min( pos, Scroll.available );
	var duration = 500+Math.abs( Scroll.position-pos )/4;
	if (pos !== Scroll.position) {
		// Scroll.disabled = true;
		Scroll.skipTriggers = true;
		Scroll.to( pos, duration, 'easeInOutSine');
		$(page).one('scrollingOver',function(){
			// Scroll.disabled = false;
			Scroll.skipTriggers = false;
			$(page).trigger('scrolling',[-Scroll.position]);
		});
	} else {
		$(page).trigger('scrolling',[-Scroll.position]);
	}

	var sectionIndex = 0;
	Menu.$anchors.each(function(i){
		if (location.href == this.href) sectionIndex = i;
	});
	Menu.setActive( sectionIndex );

	e.preventDefault();
}



// =================
//  Page Preloading
// =================

var pageReady = false;
var Loader = {
	$loader: $('.page-preloader'),
	loaded: 0,
	items: [],
	anim: new MoveAnimation({ pos: 0 }),
	init: function(){
		var variation = this.variation = parseInt( this.$loader.data('preloader'), 10 );
		var canvas = this.canvas = createCanvas( w.width, w.height, true );
		this.$loader.append( canvas );
		this.$text = this.$loader.children('p');

		this.bgColor = this.$loader.css('backgroundColor');
		this.$text.addClass('shown');

		this.update();
		$(window).on('resizeEvent', this.update.bind(this) );
	},
	update: function(){
		this.canvas.setDimensions( w.width, w.height, false, true );
		var fontSize = 24; // magic number?
		var x = this.canvas.getContext('2d');
			x.font = '200 '+fontSize+'px '+this.$loader.css('fontFamily');
			x.textAlign = 'center';
			x.textBaseline = 'top';
		this.render( 0 );
	},
	load: function( item ){
		document.body.scrollTop = 0;
		document.body.parentNode.scrollTop = 0;

		var _this = this;
		var rel = ++this.loaded/this.items.length;
		var dur = (1+this.anim.node.pos)*1500; // or just 1000
		if (this.variation == 2) {
			if (rel >= 1) allLoaded();
			return;
		}
		this.anim.animate( rel, dur, {
			easing: 'draggerRailEase',
			dontRound: true,
			step: function( pos ){
				_this.render( -pos );
			},
			complete: function(){
				if (rel < 1) return;
				allLoaded();
			}
		});

		function allLoaded(){
			Scroll.resize();
			$(window).trigger('pagePrepare');

			_this.$loader.css('transition','none');
			if ($.support.transition) {
				_this.$text.removeClass('shown');
				_this.$loader.css({
					transition: 'opacity .9s',
					opacity: 0
				}).transitEnd( startPage );
			} else {
				_this.$loader.animate({ opacity: 0 },{
					duration: 900,
					complete: function(){
						_this.$text.removeClass('shown');
						startPage();
					}
				});
			}

			function startPage(){
				_this.$loader.hide();
				pageReady = true;
				$(window).trigger('pageReady');
			}
		}
	},
	leave: function( url ){
		this.$loader.css({
			transition: 'opacity .65s',
			background: '#1e1e1e',
			opacity: 0,
			display: 'block'
		});
		this.render( 0 );
		setTimeout(function(){
			$(window).trigger('pageLeave');

			if ($.support.transition) {
				this.$loader.css({
					opacity: 1
				}).transitEnd(function(){
					location.href = url;
				});
			} else {
				this.$loader.stop().animate({ opacity: 1 }, 700, function(){
					location.href = url;
				});
			}
			if (this.variation == 1 || this.variation == 2) {
				// this.$text.addClass('shown');
			}
		}.bind(this), 20 );
	},
	render: function renderFrame( rel ){
		var x = this.canvas.getContext('2d');
			x.clearCanvas();

		if (this.variation == 1) {
			if (rel > 0) x.style('white').fR(0,Math.floor(h.height)-1,w.width*rel,2);
		} else if (this.variation == 3) {
			var W = this.$text.innerWidth();
			if (rel > 0) x.style('white').fR(h.width-W/2,Math.floor(h.height)-1,W*rel,1);
			var percent = Math.round( rel*100 );
			if (!pageReady) x.style('white').text(percent+'%',h.width,h.height+8);
		}
	}
}
Loader.init();

function LoaderItem( name ){
	this.name = name;
	Loader.items.push( this );
	setTimeout( this.done.bind(this), this.timeout, true );
}
LoaderItem.prototype = {
	timeout: 7000+2000, // xxx
	ready: false,
	done: function( timeout ){
		if (this.ready) return;
		this.ready = true;
		Loader.load( this );
		if (timeout && console && console.log) console.log( this.name );
	}
}

var fake = new LoaderItem('fake');
setTimeout(function(){
	fake.done();
}, 800 );

$('a').on('click',function(e){ // I cannot bind it on document
	if (e.isDefaultPrevented()) return;
	if (e.which != 1) return;
	if (!this.href || isExternal(this.href)) return;
	if (this.href.replace(/#.*/,'') == location.href.replace(/#.*/,'')) return;
	if (this.target == '_blank' || this.target == 'blank') return;
	e.preventDefault();
	Loader.leave( this.href );
});



// ========
//  Scroll
// ========

var useScrollTop = $.browser.donkey;
var useBrowserScroll = $.browser.mobile || $.platform.mac || $(document.body).hasClass('no-custom-scroll');
var Scroll = {
	EDGE: 499,
	disabled: true,
	position: 0,
	anim: new MoveAnimation({ pos: 0 }),
	step: function( func ){
		$(page).on('scrolling', function(e,pos){
			func( -pos );
		});
	},
	to: function( pos, duration, easing ) {
		this.position = pos;
		this.scrollMove( duration, easing );
	},
	scrollMove: function( duration, easing ){
		if (useBrowserScroll) {
			$(document.body).stop().animate({ scrollTop: this.position },{
				duration: duration || 800,
				complete: function(){
					$(page).trigger('scrollingOver');
				}
			});
			return;
		}

		clearTimeout( this.timer );

		$thumb.stop(true)
			.animate({ opacity: 1 }, 70)
			.delay(800)
			.animate({ opacity: 0 }, 600);

		if (this.position < 0) {
			this.position = this.position*0.5;
			this.timer = setTimeout(function(){
				Scroll.to( 0 );
			}, 50 );
		} else if (this.position > this.available) {
			this.position = this.available+(this.position-this.available)*0.5;
			this.timer = setTimeout(function(){
				Scroll.to( Scroll.available );
			}, 50 );
		}

		this.anim.animate( this.position, duration || 800, {
			// useZ: true,
			dontRound: true,
			disableSubpixelsOnIdle: true,
			easing: easing || null,
			/*modifyValue: function(val){
				return val >> 0; // xxx risky
			},*/
			complete: function(){
				$(page).trigger('scrollingOver');
			},
			step: function( pos ){
				if (pageReady) $(page).trigger('scrolling',[pos]);

				if (pos > 0) {
					var Y = 0;
					var S = 1-(pos/Scroll.EDGE);
					var P = Math.min( 1, pos/70 );
				} else if (-pos > Scroll.available) {
						S = 1-(-pos-Scroll.available)/Scroll.EDGE;
						Y = Scroll.thumbAvailable+(1-S)*Scroll.thumbHeight;
						P = Math.min( 1, (pos+Scroll.available)/-70 );
				} else {
						Y = -pos/(Scroll.available)*Scroll.thumbAvailable;
						S = 1;
						P = 0;
				}
				$thumb.css({
					backgroundColor: 'rgba('+(255*P >> 0)+','+(205*P >> 0)+',0,'+(0.55+P*0.45)+')',
					transform3d: 'translateY('+Y+'px)',
					height: Scroll.thumbHeight*S
				});

				if (useScrollTop) {
					var elem = document.body;
						elem = $.browser.webkit ? elem : elem.parentNode;
						elem.scrollTop = -pos;
					if (pos > 0) {
						var $elem = $(page).children(':first');
						if ($elem.hasClass('main') === false) $elem = $(page);
							$elem.css('transform','translateY('+pos+'px)');
					} else if (-pos > Scroll.available) {
						var diff = Scroll.available+pos;
						$(page).css('transform','translateY('+diff+'px)');
					}
				} else {
					$(page).css('transform','translateY('+pos+'px)');
				}
			}
		});
	},
	resize: function selfResize(){
		clearTimeout( this.resizeTimer );
		if ($(page).is(':hidden')) return;

		this.resizeTimer = setTimeout(function(){
			selfResize.call( Scroll );
		}, 1000 ); // xxx it should fix
		var pageHeight = page.scrollHeight;
		if (pageHeight === 0) return;
		//if ($('.footer-block, footer').length > 0)
			pageHeight -= 400;
		if (this.pageHeight && this.pageHeight == pageHeight) return;
			this.pageHeight = pageHeight;
		this.available = pageHeight-w.height;

		if (useBrowserScroll) {
			this.position = document.body.parentNode.scrollTop;
			return;
		}

		this.thumbHeight = (w.height/pageHeight)*w.height; // it's ratio in brackets
		this.thumbAvailable = w.height-this.thumbHeight;
		$thumb.css('height', this.thumbHeight );

		var savedPosition = this.position;
		if (this.position > this.available) this.position = this.available;
		if (this.position != savedPosition) this.scrollMove();
	}
}
if (useBrowserScroll) {
	$(window).on('pagePrepare',function(){
		$(document.body.parentNode).addClass('browser-scroll').css('overflow-y','visible');
	}).on('scroll',function(e){
		var sct = $(this).scrollTop();
		Scroll.position = sct;
		$(page).trigger('scrolling',[-sct]);
	});
} else {
	if (useScrollTop) {
		$(window).on('pagePrepare',function(){
			$(document.body.parentNode).addClass('browser-scroll');
		});
	}
	;(function keyBind(){
		$(window).on('keydown',function(e){
			if (Scroll.disabled) return;
			var down = e.keyCode == 40;
			if (!down && e.keyCode != 38) return;
			var start = getTime();
			var timer = setInterval(function(){
				Scroll.position += down ? 20 : -20;
				Scroll.scrollMove();
			}, 1000/60 );
			$(window).off('keydown').one('keyup',function(e){
				clearInterval( timer );
				keyBind();
				if (getTime() - start > 250) return;
				Scroll.position += down ? 150 : -150;
				Scroll.scrollMove();
			});
		});
	})();
	$(window).on('keydown',function(e){
		if (e.keyCode != 32 || Scroll.disabled) return;
		if (e.target.contentEditable == 'true') return;
		if ('value' in e.target) return;
		Scroll.position += e.shiftKey ? -w.height : w.height;
		Scroll.scrollMove();
	}).on('mousewheel DOMMouseScroll',function(e){
		if (Scroll.disabled) return;
		var ev = e.originalEvent;
		Scroll.position += ev.wheelDelta/-1.6 || ev.detail*25;
		Scroll.scrollMove();
		e.preventDefault();
	}).on('resizeEvent.scroll', Scroll.resize.bind(Scroll) );
}



// ==========
//  Parallax
// ==========

$parallax.each(function(){
	var canvas = this.tagName == 'CANVAS' ? this : null;
	var $par = $(this).parent();
	var parHeight;

	if ($.support.flexBox) {
		parHeight = calcHeight();
		$par.css('height', parHeight );
	} else {
		setNoFlexBoxHeight();
	}
	function setNoFlexBoxHeight(){
		if ($par.children(':not(.parallax-item)').length === 1) {
			parHeight = calcHeight();
			$par.css('height', parHeight );
			$par.css('lineHeight', parHeight+'px');
		} else {
			var heights = calcHeight( true );
			parHeight = Math.max( heights[0], heights[1] );
			var diff = (parHeight - heights[1])/2;
			$par.css({
				height: heights[1],
				padding: diff+'px 0'
			});
		}
	}

	var blogHeader = $par.hasClass('blog-header');
	var noFading = $(this).hasClass('no-fading');
	var whitePattern = $(this).hasClass('white-pattern');
	var darkPattern = $(this).hasClass('dark-pattern');
	var isBlock = $par.hasClass('parallax-block');

	var parSpeed = 1.5;

	function notCanvasUpdate( pos ){
		if ($.browser.mobile) return;
		var top = elem.parentNode.offsetTop;
		var Y = (top-pos)*0.5-top+pos;
		if (pos+w.height > top && pos < top+elemHeight) {
			$(elem).css('transform3d','translateY('+Y+'px)');

			// Outfading
			var rel = isBlock ? 0.5 : 0.0; // base value
			var offsetTop = (top-pos);
			if (offsetTop+parHeight > w.height) {
				rel += 0.5*(1-(w.height-offsetTop)/parHeight);
			} else if (offsetTop < 0) {
				rel += 0.5*Math.abs(offsetTop/parHeight);
			}
			if (!noFading) $darker.css('opacity', rel );

			// Parallax Video
			if (elem.video && elem.video.state == 'idle') {
				elem.video.setLoop( true );
				$(elem).one('playing',function(){
					elem.video.volume(0);
					// $(elem).trigger('spread');
				});						
			}
			if (elem.video && $(elem).hasClass('playing') == false) {
				elem.video.play();
			}
		} else {
			if ($(elem).hasClass('playing')) {
				elem.video.pause();
			}
		}
	}
	if (!canvas) {
		var elem = this;
		var elemHeight = calcParHeight();
			$(elem).css('height', elemHeight );
		if ($(elem).hasClass('video')) {
			$(elem).addClass('no-controls spreaded');
		}
		if (!noFading) {
			var $darker = $('<hr class="darker parallax-darker">').prependTo( $par );
		}

		$(window).on('resizeEvent', stateUpdate );

		Scroll.step( notCanvasUpdate );
		return;
	}

	canvas.setDimensions( w.width, parHeight, false, true );
	var src = $(canvas).data('src');
	var ctx = canvas.getContext('2d');
	var img = new FakeImage( src );
	if (canvas.hasAttribute('data-crop-position')){
		img.crop = canvas.getAttribute('data-crop-position').split(' ');
	}

	var loader = new LoaderItem('parallax image');
	$(window).one('loadHeavy',function(e){
		img.fakeLoad();
		$(img).onImageReady(function(){
			loader.done();
		});
	});

	function calcHeight( dontChoose ){
			// $par.css('height','');
		var height = $par.data('height') || $par.outerHeight(true) || 580;
		var scrollHeight = 0;
		$(canvas).siblings(':not(canvas,.darker)').each(function(){
			scrollHeight += $(this).outerHeight(true);
		});
		if (blogHeader) height = 572;
		if (dontChoose) return [height,scrollHeight];
		return Math.max( height, scrollHeight );
	}
	function calcParHeight(){
		var index = blogHeader && false ? 1.2 : parSpeed;
		var subheight = parHeight > h.height ? parHeight+(w.height-parHeight)*(index-1) : h.height*index;
		var maxHeight = Math.max( parHeight, w.height );
		return Math.min( maxHeight, subheight );
	}

	if (blogHeader) {
		var blurRadius = 14;
		var blurHeight = 194; // blur stripe height (149+45 here)
		var bufferRatio = 0.25; // blur buffer downscales to get higher performance

		var blur = document.createElement('canvas');
			blur.crop = img.crop;
		var blurCtx = blur.getContext('2d');
		var buffer = document.createElement('canvas');
		var bufferCtx = buffer.getContext('2d');
		$(img).onImageReady(function(){
			var width = img.naturalWidth || img.width;
			var height = img.naturalHeight || img.height;
			blur.width = width;
			blur.height = height;
			buffer.width = width*bufferRatio;
			buffer.height = height*bufferRatio;

			bufferCtx.drawImage( img, 0, 0, buffer.width, buffer.height );
			stackBlurCanvasRGB( buffer, 0, 0, buffer.width, buffer.height, Math.round( bufferRatio*blurRadius ) );
			blurCtx.drawImage( buffer, 0, 0, width, height );
		});
	}

	$(window).one('pagePrepare', stateUpdate ).on('resizeEvent', stateUpdate );
	function stateUpdate(){
		var checkHeight = calcHeight();
		if (checkHeight != parHeight) {
			if ($.support.flexBox) {
				parHeight = checkHeight;
				$par.css('height', parHeight );
			} else {
				setNoFlexBoxHeight();
			}
		}
		if (!canvas) {
			$(elem).css('height', calcParHeight() );
			notCanvasUpdate( Scroll.position );
		} else {
			canvas.setDimensions( w.width, parHeight, false, true );
			parallaxUpdate( Scroll.position, $.browser.mobile );
		}
	}
	if (!$.browser.mobile) Scroll.step( parallaxUpdate );

	function parallaxUpdate(pos,forced){
		if (isNaN(+pos)) pos = Scroll.position;
		var top = $par[0].offsetTop;
		if (!forced) {
			if (pos+w.height < top || pos > top+parHeight) return;
		}

		var fullHeight = calcParHeight();
		if (parHeight > w.height) fullHeight = parHeight;
		var Y = (top-pos)*0.5-top+pos;
		if (forced) Y = 0;
		if (blogHeader) {
			ctx.drawFilledImage( img, 0, Y, w.width, fullHeight );
			ctx.save();
			ctx.begin().rect( 0, parHeight, w.width, -blurHeight );
			ctx.clip();
				ctx.drawFilledImage( blur, 0, Y, w.width, fullHeight );
			ctx.restore();
		} else {
			ctx.drawFilledImage( img, 0, Y, w.width, fullHeight );
		}

		if (whitePattern || darkPattern) {
			ctx.fillStyle = darkPattern ? parallaxPatternDark : parallaxPatternWhite;
			ctx.fillRect( 0, 0, canvas.width, canvas.height );
		}
		if (noFading) return;

		// Scroll outfading
		var rel = isBlock ? 0.5 : 0.0; // base value
		if (!forced) {
			var offsetTop = (top-pos);
			if (offsetTop+parHeight > w.height) {
				rel += 0.5*(1-(w.height-offsetTop)/parHeight);
			} else if (offsetTop < 0) {
				rel += 0.5*Math.abs(offsetTop/parHeight);
			}
		}
		ctx.fillStyle = 'rgba(0,0,0,'+rel+')';
		ctx.fillRect( 0, 0, w.width, parHeight );
	}
});



// ==============
//  Canvas draws
// ==============

var stripesPattern = (function(){
	var stripeWidth = 100;
	var canvasWidth = stripeWidth*2;
	var canvas = createCanvas( canvasWidth, canvasWidth );

	var x = canvas.context;
		x.style('rgba(255,255,255,0.05)');
	for (var i = 1; i < 4; i+=2){
		x.begin();
		var p = i*stripeWidth;
		x.move( p, 0 )
			.line( p+stripeWidth, 0 )
			.line( p+stripeWidth-canvasWidth, canvasWidth )
			.line( p-canvasWidth, canvasWidth )
			.closePath();
		x.fill();
	}
	return x.createPattern( canvas, 'repeat');
})();
var parallaxPatternWhite = (function(){
	var canvas = createCanvas( 7, 7 );
	var x = canvas.context;
		x.style('rgba(255,255,255,0.05)').fR(3,3);
	return x.createPattern( canvas, 'repeat');
})();
var parallaxPatternDark = (function(){
	var canvas = createCanvas( 7, 7 );
	var x = canvas.context;
		x.style('rgba(0,0,0,0.15)').fR(3,3);
	return x.createPattern( canvas, 'repeat');
})();
;(function(){
	// Rounded arrows
	function redrawArrows(){
		var canvas = createCanvas( 40, 40, true );
		var x = canvas.context;
			x.strokeStyle = window.COLOR || $('.arrow-prev, .arrow-next').css('color');
			x.lineWidth = 2;
			drawRoundedArrow()
		addRules({'.arrow-next': 'background: url('+canvas.toDataURL()+') 0 0 / 40px 40px'});
			x.clearCanvas();
			x.scale( -1, 1 );
			x.translate( -40, 0 );
			drawRoundedArrow();
		addRules({'.arrow-prev': 'background: url('+canvas.toDataURL()+') 0 0 / 40px 40px'});

		function drawArrow( a, b ){
			a = a || 0; b = b || 0;
			x.beginPath();
			x.moveTo( a+1, b+1 );
			x.lineTo( a+7, b+6.5 );
			x.lineTo( a+1, b+13 );
			x.stroke();
		}
		function drawRoundedArrow(){
			x.beginPath();
			x.arc( 20, 20, 19, 0, Math.PI*2 );
			x.stroke();
			drawArrow( 17, 13 );
		}
	}
	redrawArrows();
	$(window).on('previewRedraw', redrawArrows );

	// Photo-enlarge arrows
	var canvas = createCanvas( 9, 9, true );
	var x = canvas.context;
		x.fillStyle = x.strokeStyle = 'white';
		x.lineWidth = 1.1;
	drawEnlargeArrow();
	addRules({'.photo-enlarge::before': 'background: url('+canvas.toDataURL()+') 0 0 / 9px 9px'});
		x.clearCanvas();
		x.translate( 9, 9 );
		x.rotate( Math.PI );
	drawEnlargeArrow();
	addRules({'.photo-enlarge::after': 'background: url('+canvas.toDataURL()+') 0 0 / 9px 9px'});
	function drawEnlargeArrow(){
		x.fR(9,0,-7.5,1).fR(9,0,-1,7.5)
			.begin().move(8,1).line(0.5,8.2).stroke();
	}
})();



// =======
//  Icons
// =======

function drawIcons( redrawExisting ){
	// Inline icons
	function drawIconImage( img, ctx ){
		ctx.drawImage( img, 0, 0, img.width*ctx.ratio, img.height*ctx.ratio );

		var color = ctx.color.split(/,|\(|\)/);
		var r = +color[1];
		var g = +color[2];
		var b = +color[3];
		var a = color.length > 5 ? parseFloat( color[4] ) : null;

		var imageData = ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height );
		var pixels = imageData.data;
		for (var i = 0; i < pixels.length; i+=4) {
			pixels[i+0] = r;
			pixels[i+1] = g;
			pixels[i+2] = b;
			if (a !== null) pixels[i+3] = pixels[i+3]*a;
		}
		ctx.putImageData( imageData, 0, 0 );
	}

	var iconAppearance = {};
	var letterImage = new Image();
		letterImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAcCAYAAACUJBTQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzExNzRCRTIwOTQ3MTFFNThGN0JCRjZERUMxRDAxODgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzExNzRCRTMwOTQ3MTFFNThGN0JCRjZERUMxRDAxODgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozMTE3NEJFMDA5NDcxMUU1OEY3QkJGNkRFQzFEMDE4OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozMTE3NEJFMTA5NDcxMUU1OEY3QkJGNkRFQzFEMDE4OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ple3FVEAAAJcSURBVHjarJRNiE5RGMfH62UyZDRJQ5KdfBRFWUizUBpfYRL5Kt8LLAbFiCILiYURu1EzkmEhND4jY2x8ZSxYYEX52JDSaCaTwe+p/9Htds5979H71K/uPfec+z/nPP/nKVTExRzYDZNjFhUi5jbCORgL92FhRZljJ7yRgMUM+Az1eRYPyth1rZ5rYAu0w8fEnOlQB0vh3v+IvNRPv5XYZCXsh3XQGXs9JjIh59zZurq6ciQ+FE9hBVyCub4JRc/YapiSGmuGYZ65n+AIPIImuAEL9B4UWQnH4EtqvAuGeES+J56/yhiXYRk8853KjvwBJkXmxMUiuADzlKNZ6ZMsh5MwH956ftAGValdbw+IWaFugA5YDC+K2sFpFdbrwMJrqevqLXGqu7BJOao3kTWmliHgRGKjG3rMSMVE9bbCRhgIiAz3jL+DbZ7x0eoCf5I5aVTrOAubPYuaA3b/4Rmr0XVdgX6odgvtpUE7bvG0m66cVzRKAh2qn6Z0xf+U0HiY6vlBrX7Q53GbC2v/d+BwVlvpk50fwN7EicbImp16/q3rqNT3kXAAjsPBPL3L7LkEpql2nECbukGP8mYFd1U5uAWPYV9Mg+xV/cyUtS/CicR3c81WtZ/38Bz2hBJVzEjiUNn2FBz1fB9QwVmRTtT8/piTVCvJ1+WSUJjQepmmPbTpQoaAcSiHbU1orZ5NaHApEXPJbXgot+SNX2pPdnXn00JJkRFwE57IvrFh+ViljbYmhZxIlQS6s1ySU6hBvavF/d+JnIFXsMs1tTIIjVNP/OcGK7gdouzxV4ABANIZgqMqCs/jAAAAAElFTkSuQmCC';
	iconAppearance['letter'] = function( ctx ){
		this.setIconDimensions( 25, 28 );
		$(letterImage).onImageReady(function(){
			drawIconImage( letterImage, ctx );
		});
	}

	iconAppearance['quote'] = function( ctx ){
		this.setIconDimensions( 25, 30 );
		ctx.lineWidth = 4.5;
		drawQuote();
		ctx.trans(14,0);
		drawQuote();
		function drawQuote(){
			ctx.fR(0.5,18,9,12);
			ctx.save();
				ctx.R(0,0,9,30).clip();
				ctx.begin().move(2.75,18).line(2.75,11)
					.bezier(2.75,7,7,2.75,11,3).stroke();
			ctx.restore();
		}
	}

	iconAppearance['heart'] = function( ctx ){
		this.setIconDimensions( 12, 11 );
		drawHalf();
		ctx.scale(-1,1);
		ctx.trans(-12,0);
		drawHalf();
		function drawHalf(){
			ctx.begin().move(6,2)
				.bezier(4.8,-1.65,-0.6,0,0,4.2)
				.bezier(0.4,6.5,2,7.7,3.4,8.6)
				.bezier(4.8,9.5,5.8,10.5,6,11)
				.close().fill();
		}
	}
	iconAppearance['author'] = function( ctx ){
		this.setIconDimensions( 11, 12 );
		ctx.lineWidth = 1.01;
		ctx.fR(2,10,7,2).cR(3,10,5,1)
			.fR(0,11,1,1).fR(10,11,1,1)
			.begin().move(0.5,11.5).bezier(0.5,4.5,10.5,4.5,10.5,11.5).stroke();
		ctx.lineWidth = 1.00;
		ctx.begin().drawArc( 5.5, 2.5, 2 ).stroke();
	}
	iconAppearance['category'] = function( ctx ){
		this.setIconDimensions( 15, 12 );
		ctx.fR(0,2,15,10).cR(1,9,13,2).cR(1,3,13,5).cR(2,2,11,1)
			.fR(3,0,9,4).cR(4,1,7,3).fR(5,2,5,1);
	}
	iconAppearance['comments'] = function( ctx ){
		this.setIconDimensions( 15, 12 );
		ctx.fR(0,0,12).fR(11,1,1,8).fR(5,8,6).fR(4,9).fR(3,10).fR(2,8,1,3).fR(0,8,2).fR(0,1,1,7)
			.fR(6,10,4).fR(10,11,2).fR(11,10,4).fR(14,3,1,7).fR(13,3)
			.fR(2,4,2).fR(5,4,2).fR(8,4,2);
	}

	iconAppearance['calendar-small'] = function( ctx ){
		this.setIconDimensions( 9, 10 );
		ctx.fR(0,1,9,9).cR(1,1,7,8).fR(1,3,7)
			.fR(2,0,1,2).fR(4,1,1,2).fR(6,0,1,2)
			.fR(2,5).fR(4,5).fR(6,5).fR(2,7).fR(4,7).fR(6,7);
	}
	iconAppearance['comments-small'] = function( ctx ){
		this.setIconDimensions( 11, 10 );
		ctx.fR(0,0,9).fR(8,1,1,6).fR(4,6,4).fR(3,7).fR(2,8).fR(1,7,1,2).fR(0,6,2).fR(0,1,1,5)
			.fR(5,8,3).fR(8,9,2).fR(9,8,2).fR(10,3,1,5).fR(9,3)
			.fR(2,3,1).fR(4,3,1).fR(6,3,1);
	}

	iconAppearance['date'] = function( ctx ){
		this.setIconDimensions( 12, 12 );
		ctx.fR(0,1,12,11).cR(1,4,10,7).cR(2,1,3,2).cR(7,1,3,2)
			.fR(3,0,1,2).fR(8,0,1,2)
			.fR(2,5,2,2).fR(5,5,2,2).fR(8,5,2,2)
			.fR(2,8,2,2).fR(5,8,2,2).fR(8,8,2,2);
	}
	iconAppearance['time'] = function( ctx ){
		this.setIconDimensions( 12, 12 );
		ctx.drawArc(6,6,5.5).fR(5,3,1,3).fR(5,6,3,1);
	}

	iconAppearance['video'] = function( ctx ){
		this.setIconDimensions( 26, 26 );
		ctx.fR(0,0,26,26).cR(7,2,12,10).cR(7,14,12,10)
			.cR(2,2,3,2).cR(2,6,3,2).cR(2,10,3,2).cR(2,14,3,2).cR(2,18,3,2).cR(2,22,3,2)
			.cR(21,2,3,2).cR(21,6,3,2).cR(21,10,3,2).cR(21,14,3,2).cR(21,18,3,2).cR(21,22,3,2);
	}
	iconAppearance['photo'] = function( ctx ){
		this.setIconDimensions( 26, 26 );
		ctx.fR(0,0,26,26).cR(2,2,22,17)
			.cR(2,21,2,3).cR(6,21,2,3).cR(10,21,2,3).cR(14,21,2,3).cR(18,21,2,3).cR(22,21,2,3)
			.drawArc(7,7,1.5,1.5)
			.begin().move(5,16).line(20.5,16).line(17,9,14,13).line(13.5,13).line(11.5,10.5).line(9,14).line(7.5,13).close().fill();
	}

	iconAppearance['cross'] = function( ctx ){
		this.setIconDimensions( 30, 30 );
		ctx.lineWidth = 2;
		ctx.begin().move(0.5,0.5).line(29.5,29.5).stroke();
		ctx.begin().move(29.5,0.5).line(0.5,29.5).stroke();
	}
	iconAppearance['details'] = function( ctx ){
		this.setIconDimensions( 30, 30 );
		ctx.fR(0,5,26.3,2).fR(0,11,28,2).fR(0,17,22.5,2).fR(0,23,28,2);
	}
	iconAppearance['bar'] = function( ctx ){
		this.setIconDimensions( 30, 30 );
		// ctx.fR(0,0,30,30).cR(2,2,26,26);
		ctx.fR(0,13,8,4).fR(10,13,8,4).fR(20,13,8,4);
	}

	var $inlineIcons = $('[class*="icon-"]');
	$inlineIcons.each(function(i){
		if ($(this).find('canvas').length && !redrawExisting) return;
		var color = getComputedStyle( this ).color;
		if (redrawExisting) {
			var $canvas = $(this).find('canvas');
			if (color === $canvas[0].context.color) return;
				$canvas.remove();
		}

		var width = this.offsetWidth || 0;
		var height = this.offsetHeight || 0;

		var canvas = createCanvas( width, height );
		var ctx = canvas.context;
			ctx.fillStyle = ctx.strokeStyle = ctx.color = color;
			ctx.disableSmooth();

		$(this).append( canvas );

		for (var key in iconAppearance) {
			if ($(this).hasClass('icon-'+key)) return iconAppearance[key].call( canvas, ctx );
		}
	});
}
drawIcons();



// =========
//  Content
// =========

$('section[data-background]').each(function(){
	var _this = this;
	var $this = $(this);
	var preload = new LoaderItem('background image');
	$(window).one('loadHeavy',function(e){
		var src = $this.data('background');

		if ($this.hasClass('blog-page')) $this = $('body > .background');

			$this.css('background-color', src );
		if (_this.style.backgroundColor == '') {
			// Thus we know that src is actually src
			$this.css('background-image','url('+src+')');
			var img = new Image();
				img.src = src;
				img.onload = function(){
					preload.done();
				}
		} else {
			preload.done();
		}
	});
});

$('.separator-diamond').each(function(){
	$(this).append('<hr><hr><hr>');
});

$('.links-footer a, .sidebar-links a').each(function(){
	$(this).contents().wrap('<span />');
});
$('.list-footer article:has(.list-bullet)').addClass('has-bullet');

$('.aside-image').each(function(){
	// Responsive behaviour of aside images
	var $frame = $(this),
		width, height;
	$(window).on('pagePrepare',function(){
		width = $frame.outerWidth();
		height = $frame.outerHeight();
		update();
	}).on('resizeWidth', update );
	function update(){
		var parentWidth = $frame.parent().width();
		if (parentWidth > width) return $frame.css({ transform: '', marginBottom: '' });

		var rate = Math.min( 1, parentWidth/width );
		var marginBottom = -(1-rate)*height+20;
		$frame.css({
			transform: 'scale('+rate+')',
			marginBottom: marginBottom
		});
	}
});

$(window).one('handled',function(){
	// `handled` event will fire at the very end
	$('.sidebar-gallery-block img, .gallery-footer img').centerImages();
	$('.ipad-frame, .iphone-frame, .imac-frame').each(function(i){
		$('img',this).centerImages( this.clientWidth, this.clientHeight );
	});

	$('.video').each(function(i){
		if ($(this).closest('.main').length) return; // filter

		var _video = this;
		var preload = new LoaderItem('video');

		$(window).one('loadHeavy',function(e){
			var type = getMediaTypeByClass( _video );
			var video = new VideoPlayer({
				container: $(_video),
				type: type,
				source: $(_video).data(),
				controls: !$(_video).hasClass('no-controls'),
				spreaded: $(_video).hasClass('spreaded'),
				overlay: true,
				onload: function(){
					preload.done();
				}
			});
			_video.video = video;
		});
	});
});



// =============
//  Block: Main
// =============

function MainBlock( container ){
	this.container = container;
	var _this = this;

	var $container = $(container);
	var $content = $container.children('.content');

	var $headers = $container.find('.main-parallax-headers');
	var $headerLineTop = $('<hr class="main-parallax-headers-line above">').insertBefore( $headers ),
		$headerLineBottom = $('<hr class="main-parallax-headers-line below">').insertAfter( $headers ),
		$headerLines = $headerLineTop.add( $headerLineBottom );
	$headerLineTop.before('<br>');
	$headerLineBottom.after('<br>');

	var slides = [],
		$slides = $('.main-slides > *', container ),
		sliderCanvas = $('.main-parallax', container )[0],
		$sliderVideo = $('<div class="main-video" />').prependTo( container );
	if ($slides.length > 1) $content.addClass('grab-cursor');

	var firstSlideReady = false;
	var available,
		animating = false,
		active = 0,
		amount = $slides.length,
		max = amount-1;
	var fullHeight = Math.max( $container.height(), w.height );
	var blockOffset = 0;

	// these are necessary for desktop only
	var fadeValue = 0,
		parallaxOffset = 0,
		stripesOpacity = 0;

	if ($.browser.mobile) {
		var $stripes = $('<div class="main-parallax-stripes" />').prependTo( container );
		var transition = false;
	}

	$slides.each(function(i){
		var slide = this;
		var preload;
		var $headerOne = $('<div class="parallax-header"></div>')
			.append( $(this).children() ).appendTo( $headers );
		$('a', $headerOne ).exclusiveClick();

		if ($(this).hasClass('video')) {
			var video,
			$video = $('<div class="'+this.className+' spread'+'" />').on('playing',function(){
				video.volume( 0 );
				video.setLoop( true ); // xxx
			}).css('left', i*100+'%' ).appendTo( $sliderVideo );
			if (i > 0) {
				preload = new LoaderItem('main video');
				$video.one('ready',function(){
					preload.done();
				});
				$(window).one('loadHeavy',function(){
					video = slides[i] = initVideoSlide();
				});
				slides.push({}); // just to fill the space at this moment
			} else {
				$video.one('ready',function(){
					initOtherSlides();
				});
				$(window).on('pagePrepare',function(){
					video.play();	
				});
				video = initVideoSlide();
				slides.push( video );
			}
			function initVideoSlide(){
				return new VideoPlayer({
					container: $video,
					type: getMediaTypeByClass( slide ),
					source: $(slide).data(),
					loop: true,
					controls: false,
					overlay: true,
					spreaded: true
				});
			}
		} else {
			var img = new FakeImage( $(this).data('src') );
			$(img).on('load',function(){
				i > 0 ? preload.done() : initOtherSlides(); // xxx was > 1
			});
			if (i > 0) {
				preload = new LoaderItem('main image');
				$(window).one('loadHeavy',function(){
					img.fakeLoad();
				});
			} else {
				img.fakeLoad();
			}

			if (slide.hasAttribute('data-crop-position')){
				img.crop = slide.getAttribute('data-crop-position').split(' ');
			}

			if ($.browser.mobile) {
				$('<div class="slider-image" />').css('left', i*100+'%' )
					.append( img ).appendTo( $sliderVideo );
				$(img).centerImages();
				$(window).on('resizeWidth',function(){
					$(img).centerImages();
				});
			}

			slides.push( img );
		}
	}).parent().remove();
	$(window).one('pageReady',function(e){
		setTimeout( setLinesWidth, 1000 );
	});
	function initOtherSlides(){
		$(sliderCanvas).css({
			transition: '700ms ease-in-out',
			opacity: 1
		}).transitEnd(function(){
			firstSlideReady = true;
			$(window).triggerHandler('loadHeavy');
			if ($.browser.mobile) $stripes.css('opacity', 1 );
		}, null, 'opacity');
		setTimeout(function(){
			// making sure all's fine
			if (firstSlideReady) return;
				firstSlideReady = true;
			$(window).triggerHandler('loadHeavy');
			if ($.browser.mobile) $stripes.css('opacity', 1 );
		}, 1000 );
		renderFrame();
	}

	var anim = new MoveAnimation({ pos: 0 });
	var bubbles = new TouchBubbles( container );
	var togglers = new Togglers({
		elem: $('.togglers', container ),
		amount: amount,
		absolute: false,
		handler: function( index ){
			setActive( index );
		}
	});
	var touch = new TouchMove({
		elem: $container,
		namespace: 'main',
		ondown: function( pos, event ){
			if ($.browser.mobile) {
				var sliderX = $sliderVideo.getTranslate().X || 0;
				var hadTrans = transition;
				$sliderVideo.add( $headers ).add( $stripes ).css('transition','');				
				if (hadTrans) moveSlider( -sliderX, 0, 'flat');
			} else {
				moveSlider( touch.pos, 0 );
			}
			if (touch.touchEvent && event.originalEvent.touches[0]) {
				bubbles.baseRadius = event.originalEvent.touches[0].radiusX+10;
			}
			bubbles.showEvent( event );
		},
		onmove: function( pos, diff, event ){
			stripesOpacity = Math.max( stripesOpacity, Math.abs(diff/200) );
			moveSlider( pos, 200 );
			bubbles.positionEvent( event );
		},
		onup: function( pos ){
			var index = Math.round(-pos/w.width);
				index = Math.max( 0, Math.min( amount-1, index ));
			setActive( index );
			bubbles.hide();
		}
	});

	Scroll.step(function(pos){
		if ($.browser.mobile) return;

			pos -= blockOffset;
		if (pos > fullHeight) {
			clearTimeout( buttonTimer );
			return;
		}
		fadeValue = Math.abs(pos)/fullHeight;
		parallaxOffset = pos-pos*0.5;

		if (!animating && firstSlideReady) renderFrame();

		renderArrow();
	});

	function updateRender( a ){
		blockOffset = $container.getOffsetTop();
		fullHeight = Math.max( $container.height(), w.height );

		$(sliderCanvas).css('transition','');
		sliderCanvas.setDimensions( w.width, fullHeight, false, true );
		anim.node.pos = sliderCanvas.pos = -active*w.width;
		touch.pos = -sliderCanvas.pos;
		available = max*w.width;

		if ($.browser.mobile) {
			sliderCanvas.getContext('2d').style('rgba(0,0,0,0.35)').fR(0,0,w.width,fullHeight);
		}

		if (firstSlideReady) {
			if (pageReady) setLinesWidth();
			renderFrame(); // here was settimeout
		}
	}
	$(window).on('resizeEvent.home', updateRender ).on('fontsUpdated', setLinesWidth );
	updateRender();

	function setActive( index ){
		var currIndex = active;
		var currOpacity = stripesOpacity;
		var duration = 800+250*Math.abs(currIndex-index);
			active = index;

		togglers.setActive( index );

		// Play next video
		var nextSlide = slides[active];
		if (currIndex != active && nextSlide.state) {
			nextSlide.seekTo( 0 );
			nextSlide.play();
		}
		
		if ($.browser.mobile) {
			transition = true;
			$sliderVideo.add( $headers ).add( $stripes ).css('transition',duration+'ms')
				.first().transitEnd(function(){
					transition = false;
				});
		}

		moveSlider( index*w.width, duration, function( pos, rel ){
			stripesOpacity = (1-rel)*Math.min( currOpacity, 1 );
		},function(){
			// Stop video
			if (currIndex != active) {
				slides.forEach(function(item){
					if (item.state && item != nextSlide) item.stop(); // xxx stop only playing ones // xxx pauseAtStart
				});
			}

			stripesOpacity = 0;
			if (!$.browser.mobile) renderFrame();
		});
	}

	function setLinesWidth(){
		if ($headers.length) {
			var $active = $headers.find('h2').eq( active );
			var rate = $active.innerWidth()/10;
			$headerLines.css('transform3d','scale('+rate+',1)');
		}
	}

	function moveSlider( pos, dur, step, complete ){
		var flat = step == 'flat';
		if (flat) step = null;
		if (!flat && pos < 0) pos /= 2;
		if (!flat && pos > available) pos = available+(pos-available)/2;

		setLinesWidth();

		if ($.browser.mobile) dur = 0;
		if (dur === 0) {
			animating = false;
			anim.clear();
			anim.node.pos = sliderCanvas.pos = -pos;
			touch.pos = pos;
			renderFrame();
			if (step) step( -pos, 1 );
			if (complete) complete();
			return;
		}
		animating = true;
		anim.animate( pos, dur, {
			complete: function(){
				animating = false;
				if (complete) complete();
			},
			step: function(pos,rel){
				if (step) step( pos, rel );

				sliderCanvas.pos = pos;
				touch.pos = -pos;
				renderFrame();
			}
		});
	}

	function renderFrame(){
		if ($.browser.mobile) {
			if (sliderCanvas.pos >= 0) {
				var stripesPos = sliderCanvas.pos/w.width*(w.width-150)-w.width;
				$stripes.css('transform3d','translateX('+Math.round(stripesPos)+'px)');
			} else if (-sliderCanvas.pos >= available) {
				var stripesPos = (sliderCanvas.pos+available)/w.width*(w.width-150);
				$stripes.css('transform3d','translateX('+Math.round(stripesPos)+'px)');
			}
		} else {
			var x = sliderCanvas.getContext('2d');
			x.clearCanvas();
			slides.forEach(function( slide, i ){
				if (!slide.src) return;
				x.drawFilledImage( slide, sliderCanvas.pos+i*w.width, parallaxOffset, w.width, fullHeight );
			});

			// Fade on scroll
			x.fillStyle = 'rgba(0,0,0,'+(0.35+0.5*fadeValue)+')';
			x.fillRect( 0, 0, w.width, fullHeight );

			// Stripes
			if (stripesOpacity > 0) {
				var stripeOffset = (sliderCanvas.pos % 160) / 160;
					stripeOffset *= 200;
				x.save();
					x.globalAlpha = Math.min( stripesOpacity, 1 );
					x.fillStyle = stripesPattern;
					x.translate( stripeOffset, 0 );
					x.fillRect( -stripeOffset, 0, x.canvas.width, x.canvas.height );
				x.restore();
			}
		}

		var headersPos = sliderCanvas.pos/w.width*(w.width+500);
		$headers.css('transform3d','translateX('+Math.round(headersPos)+'px)');

		$sliderVideo.css('transform3d','translate('+sliderCanvas.pos+'px,'+parallaxOffset+'px)');
	}

	// Slide-down button
	var $button = $('.slide-down-button', container );
	if ($button.length) {
		$button.on('mousedown',function(e){
			e.stopPropagation();
		}).on('click',function(e){
			Scroll.to( fullHeight );
		})[0].setDimensions( 16, 29, false, true );

		var drawArrow = function( x, offsetY, intensity ){
			x.strokeStyle = window.COLOR || $button.css('color');
			x.globalAlpha = intensity;
			x.lineWidth = 2.35;
			x.beginPath();
			x.moveTo( 0+1.2, offsetY+1.2 );
			x.lineTo( 8, offsetY+7.5 );
			x.lineTo( 16-1.2, offsetY+1.2 );
			x.stroke();
		}
		var renderArrow = function(){
			clearTimeout( buttonTimer );
			buttonTimer = setTimeout( renderArrow, 1000/40 );
			var x = $button[0].getContext('2d');
				x.clearCanvas();
			var p = getTime() % 2000 / 10;
				p -= 50;
				p *= 0.2;
			draw( 0 );
			draw( 10 );
			draw( 20 );
			function draw( n ) {
				var s = Math.abs( p-n );
					s = Math.max( 0, Math.min( 1, 1-s*0.12 ) );
				drawArrow( x, n, 0.4+s*0.6 );
			}
		};
		var buttonTimer = null;
		renderArrow();
	} else {
		var renderArrow = function(){};
	}
}
var $mainBlock = $('.main').each(function(){
	var container = this;
	var main = new MainBlock( container );
});
if ($mainBlock.length === 0 || !$.support.transition) {
	setTimeout(function(){
		// Waiting for loader text appearing
		$(window).triggerHandler('loadHeavy');
	},1000);
} else {
	Loader.$loader.css('background','none');
}



// ==================
//  Block: Portfolio
// ==================

function PortfolioBlock( container ){
	this.container = container;
	var _this = this;

	var $preview = $('.portfolio-preview', container ).addClass('grab-cursor');
	var $items = $('article', container );
	var $sortedItems = $items;
	var $thumb = $('<hr class="thumb-horizontal">').appendTo( container );
	var $stripes = $('<canvas class="portfolio-stripes">').appendTo( container );

	var thumbTimer = null;
	var visibility = new ElementVisibility( container, 0 );
	visibility.onscroll(function( rel, scrollPos ){
		clearTimeout( thumbTimer );
		setScrollThumbPos( scrollPos );
	});
	function setScrollThumbPos( scrollPos ){
		var extra = $filter.length ? 51 : 0;
		var pos = Math.max( 2, 2+previewHeight-w.height+scrollPos+container.offsetTop+extra );
		$thumb.css('bottom', pos );
	}

	var visibleAmount,
		available,
		itemWidth, itemHeight, itemRatio,
		rows, rowLength,
		previewHeight;
	var thumbWidth,
		thumbAvailable;
	function updatePreview( init ){
		visibleAmount = Math.round(w.width/_this.item.w);
		itemWidth = _this.itemWidth = Math.ceil(w.width/visibleAmount);
		itemRatio = itemWidth/_this.item.w;
		itemHeight = _this.itemHeight = Math.round( _this.item.h*itemRatio );

		rows = Math.min( 3, Math.ceil($items.length/visibleAmount) );
		rowLength = Math.ceil( $items.length / rows );
		rowLength = Math.max( visibleAmount, rowLength );

		available = rowLength*itemWidth-w.width;
		thumbWidth = w.width*(w.width/(available+w.width));
		if (w.width < 800) thumbWidth = Math.max( w.width/5, thumbWidth );
		thumbAvailable = w.width-thumbWidth;

		$thumb.css('width', thumbWidth );
		$preview.toggleClass('grab-cursor', available > 2 );

		previewHeight = itemHeight*rows;
		$preview.css({
			height: previewHeight,
			width: itemWidth*rowLength
		});

		if (!$.support.flexBox) {
			$items.find('.info-hover').each(function(){
				var collector = 0;
				$(this).children().each(function(){
					collector += $(this).outerHeight(true);
				}).parent().css('paddingTop', (itemHeight-collector)/2 );
			});
		}

		$stripes.attr({
			width: w.width,
			height: previewHeight
		})[0].getContext('2d').fillStyle = stripesPattern;
		if ($.browser.mobile) {
			var x = $stripes[0].getContext('2d');
				x.trans( 0, 0 ).fR( 0, 0, x.canvas.width, x.canvas.height );
		}

		if (init) Scroll.resize();
	}
	$(window).on('resizeEvent.portfolio',function(e){
		updatePreview();
		touch.pos = Math.max( 0, Math.min( touch.pos, available ));
		movePortfolio( touch.pos, 700 );
		setPlaces( false );
		$items.find('.preview img').centerImages();
		$filterStrike.css({ left: $activeFilter[0].offsetLeft });

		clearTimeout( thumbTimer );
		thumbTimer = setTimeout(function(){
			setScrollThumbPos( -Scroll.position );
		}, 200 ); // `.main` has 200ms animation on resize
	}).one('pagePrepare', function(){
		runApart(function(){
			$filterStrike.css({ left: $activeFilter[0].offsetLeft });
		});
	}).on('fontsUpdated',function(){
		$filterStrike.css({
			width: $activeFilter[0].offsetWidth, 
			left: $activeFilter[0].offsetLeft
		});
	}).one('pageReady',function(){
		$filterStrike.css({
			width: $activeFilter[0].offsetWidth, 
			left: $activeFilter[0].offsetLeft
		});
	});

	updatePreview( true );
	$items.find('.preview img').centerImages();

	var clickTime, clickTarget,
		hold, hover, releaseTime = 0;

	var anim = new MoveAnimation({ pos: 0 });
	var bubbles = new TouchBubbles( container );
	var bubblesOffset = $(container).getOffsetTop();
	var touch = new TouchMove({
		elem: $preview,
		namespace: 'portfolio',
		ondown: function( pos, event ){
			bubblesOffset = $(container).getOffsetTop();
			bubbles.showEvent( event, -bubblesOffset );

			clickTime = getTime();
			clickTarget = event.target;

			if ($.browser.mobile) {
				$preview.add( $stripes ).add( $thumb ).css('transition','');
				$thumb.add( $stripes ).css('opacity', 1 );
			} else {
				$stripes.cssAnim({ opacity: 1 }, 1000 );
				$thumb.stop(true).animate({ opacity: 1 }, 600 );
			}
		},
		onmove: function( pos, diff, event ){
			bubbles.positionEvent( event, -bubblesOffset );
			movePortfolio( pos, 200 );
		},
		onup: function( pos, diff ){
			bubbles.hide();

			if ($.browser.mobile) {
				if (!touch.hoax) {
					$preview.add( $stripes ).css('transition','900ms');
					$thumb.css('transition','all 900ms, opacity 1s .9s')
				}
				$thumb.add( $stripes ).css('opacity', 0 );
			} else {
				$stripes.cssAnim({ opacity: 0 }, 1000 );
				$thumb.stop(true).animate({ opacity: 0 }, 600 );
			}

			if (!$.browser.mobile && getTime() - clickTime < 350 && Math.abs(diff) < 10) {
				return $(clickTarget).click();
			}
			pos = Math.max( 0, Math.min( -pos, available ) );
			pos = Math.round(pos/itemWidth)*itemWidth;
			movePortfolio( pos, 900 );
			return pos;
		}
	});
	function movePortfolio( pos, duration ){
		if (pos < 0) pos /= 2;
		if (pos > available) pos = (pos-available)/2+available;

		if ($.browser.mobile) duration = 0;
		if (duration === 0) {
			anim.clear();
			touch.pos = pos;
			anim.node.pos = -pos;
			stepPortfolio( -pos );
		} else {
			anim.animate( pos, duration, { step: stepPortfolio });
		}

		function stepPortfolio( pos ){
			$preview.css('transform3d','translateX('+pos+'px)'); // xx 3d?

			if ($.browser.mobile) {
				var strPos = pos < 0 ? (pos+available)*0.5+h.width : pos*0.5-h.width;
				$stripes.css('transform','translateX('+strPos+'px)');
			} else {
				;(function(){
					var x = $stripes[0].getContext('2d');
						x.clearCanvas();
						x.save();
							x.translate( pos*0.5, 0 )
							x.fR( -pos*0.5, 0, x.canvas.width, x.canvas.height );
						x.restore();
				})();
			}

			// Thumb position, width and color
			(function( rel ){
				if (rel < 0) {
					var X = 0;
					var S = 1-(pos/h.width);
					var P = Math.min( 1, pos/h.width*2 );
				} else if (rel > 1) {
						// S = 2-rel;
						S = 1-(-pos-available)/h.width;
						X = thumbAvailable+(1-S)*thumbWidth;
						P = Math.min( 1, (rel-1)*2 );
				} else {
						X = rel*thumbAvailable;
						S = 1;
						P = 0;
				}
				var color = 'rgba(255,'+(255-Math.floor(50*P))+','+(255-Math.floor(255*P))+','+(0.55+P*0.45)+')';

				$thumb.css({
					background: color,
					width: S*thumbWidth,
					transform: 'translateX('+X+'px)'
				});
			})( -pos/available );
		}
	}

	var filter = 'all';
	var $filter = $('.portfolio-filter', container );
	var $filterStrike = $('.portfolio-filter-active', container );
	var $activeFilter = $('.active', $filter );
	$filter.find('a').on('click',function(e){
		if (e.isTrigger && $(this).data('filter') != 'all') return; // xxx

		$activeFilter.removeClass('active');
		$activeFilter = $(this).addClass('active');
		if ($.support.transition) {
			$filterStrike.css({
				left: this.offsetLeft,
				width: this.offsetWidth
			});
		} else {
			$filterStrike.stop().animate({ left: this.offsetLeft, width: this.offsetWidth }, 900 );
		}

		filter = $(this).data('filter');
		setPlaces( !e.isTrigger );
	}).first().click();
	if ($filter.length == 0) {
		setPlaces( false );
	}

	function setPlaces( isFilter ){
		if (filter == 'all') {
			var items = $items.removeClass('inactive').get();
		} else {
			var items = $items.get().sort(function(a,b){
				var aConf = $(a).data('filter').split(' ').indexOf( filter );
				var bConf = $(b).data('filter').split(' ').indexOf( filter );
				$(a).toggleClass('inactive', aConf == -1 );
				$(b).toggleClass('inactive', bConf == -1 );
				return aConf < bConf ? 1 : bConf < aConf ? -1 : 0;
			});
		}
		$sortedItems = $(items).each(function(i){
			var posX = i/rows >> 0;
			var posY = i % rows;
			var x = posX*itemWidth;
			var y = posY*itemHeight;
			$(this).css({
				width: itemWidth, height: itemHeight,
				transform: $.support.transition ? 'translate('+x+'px,'+y+'px)' : ''
			}).toggleClass('trans', isFilter ).transitEnd(function(){
				$(this).removeClass('trans');
			});
			if (!$.support.transition) $(this).stop().animate({ left: x, top: y }, 900 );
		});
	}

	if ($.browser.mobile) {
		$items.each(function(){
			var $item = $(this),
				$elems = $('.info-hover',this).children(),
				$before;
			// Select by priority
			if ($elems.filter('p').length) $before = $elems.filter('p')[0];
			if ($elems.filter('i').length) $before = $elems.filter('i')[0];
			if ($elems.filter('h5').length) $before = $elems.filter('h5')[0];

			$('<div class="mobile-plus" />').on('click',function(e){
				var opacity = $(this).css('opacity');
				if (opacity < 0.5) {
					e.stopPropagation();
					e.preventDefault();
				}
			}).insertAfter( $before );
		});
	}
	var disabled = false;
	$items.on('click',function(e){
		var $tar = $(e.target);
		if ($.browser.mobile) {
			if ($tar.is(':not(.mobile-plus)')) return;
		}
		// if ($tar.is(':not(h5,i,img,canvas)')) return; // xxx
		var $item = $(this).addClass('fixed');

		disabled = true;
		Scroll.disabled = true;
		var preloader = new Preloader( this );
		setTimeout(function(){
			$item.addClass('loading');
			preloader.start( initPortfolio );
		}, 20 );

		function initPortfolio(){
			var $portfolio = $('<div class="portfolio-fullscreen hidden" />').appendTo( document.body );
			var $portfolioItems = $('<div class="portfolio-items" />').appendTo( $portfolio );
			var $portfolioBar = $('<div class="portfolio-bar" />').appendTo( $portfolio );
			
			var $filtered = $sortedItems.filter(':not(.inactive)').each(function(i){
				var url = $(this).data('url');
				var mediaType = $(this).data('media') || 'photo';
				var preview = $('.preview img', this )[0].src;

				var $appItem = $('<article />').attr('data-url', url ).appendTo( $portfolioItems );
				var $appPreview = $('<article><i class="icon-'+mediaType+'"></i><img src="'+preview+'"></article>').appendTo( $portfolioBar );
			});
			drawIcons();

			var activeIndex = $filtered.index( $item );
			var startTime = getTime();
			var minTime = 1000;

			var portfolio = new Portfolio( $portfolio, activeIndex );
				portfolio.ready = function readyFunc(){
					var diffTime = minTime - (getTime()-startTime);
					if (diffTime > 0) return setTimeout( readyFunc, diffTime+10 );
					setTimeout( preloader.stop, 500 );
					if ($.support.transition) {
						$portfolio.removeClass('hidden').transitEnd(function(){
							$(page).hide(); // xxx
						});
					} else {
						$portfolio.css('opacity',0).removeClass('hidden').animate({ opacity: 1 }, 900, function(){
							$(page).hide();
						});
					}
				}
				portfolio.close = function(){
					$(page).show();
					if ($.browser.mobile) document.body.scrollTop = $(container).getOffsetTop();

					$(window).triggerHandler('resizeEvent');
					$(window).triggerHandler('resizeFix'); // xxx x2
					$(window).triggerHandler('resizeWidth');

					runApart(function(){
						disabled = false;
						Scroll.scrollMove( 1 );
						Scroll.disabled = false;
						$item.removeClass('loading').removeClass('fixed');
						if ($.support.transition) {
							$portfolio.addClass('hidden');
						} else {
							$portfolio.stop().animate({ opacity: 0 }, 950 );
						}
						setTimeout(function(){
							portfolio.destroy();
						}, 1000 );
					});
				}
		}
	});
}
PortfolioBlock.prototype = {
	item: { w: 384, h: 290 }
}
$('.portfolio').each(function(){
	var container = this;
	var portfolio = new PortfolioBlock( container );
});

var Portfolio = function( $container, start ){
	var _this = this;
	this.ready = false;
	this.$container = $container;

	var $itemsOriginal = $container.find('.portfolio-items').remove();
	var $bar = $container.find('.portfolio-bar').addClass('hidden');
		$bar.find('img').centerImages()//.makeSpread();
	var $viewport = $('<div class="portfolio-viewport" />').appendTo( $container ).addClass('grab-cursor');
	var $details = $('<div class="portfolio-details hidden" />').appendTo( $container );
	var $canvas = $('<canvas class="portfolio-canvas" />').appendTo( $viewport );
	var $stuff = $('<div class="portfolio-stuff" />').appendTo( $viewport );

	if ($.browser.mobile) {
		var $stripes = $('<div class="mobile-stripes" />').appendTo( $viewport );
	}

	$canvas[0].setDimensions( w.width, w.height, false, true );
	var ctx = $canvas[0].getContext('2d');

	var detailsCoef = 1.27; // 1.35;
	var blurScale = 8;
	var blocked = false;

	var $iconClose = $('<i class="icon-cross portfolio-close hidden"></i>').appendTo( $container );
		$iconClose.on('click', function(){
			_this.close();
		});

	var $iconInfo = $('<i class="icon-details portfolio-toggle-info hidden"></i>').appendTo( $container );
		$iconInfo.on('click', openInfo );

	var $iconBar = $('<i class="icon-bar portfolio-toggle-bar hidden"></i>').appendTo( $container );
		$iconBar.on('click',function(){
			barStateUpdate( !barInSight );
		});

	$canvas.on('click',function(e){
		if (barInSight) barStateUpdate( false );
	}).exclusiveClick();

	$details.on('click','.portfolio-close-info', closeInfo );

	var infoActive = false;
	var infoRel = 0;
	function openInfo(){
		barBlocked = true;
		infoActive = true;
		$(window).triggerHandler('mousemove');

		var plus = calcPlus();
		var $blocks = $details.find('.portfolio-info').each(function(i){
			var pos = (i+1)*w.width*detailsCoef+plus;
			$(this).css('left', pos )
				.children().removeClass('post-anim');
			if (i == active) {
				$(this).children().addClass('pre-anim')
					.filter('.portfolio-close-info').hide();
			}
		});

		$container.add($iconInfo).add($iconBar).addClass('info-active');

		runApart(function(){
			if (!$.browser.mobile) $details.removeClass('hidden');
			var iconClosePos = calcIconClose( $blocks, plus );
			if ($.support.transition) $iconClose.css('transform','translate('+-iconClosePos+'px)');
		});

		$details.css('transform','translate('+(active+1)*-w.width*detailsCoef+'px,'+-w.height+'px)');
		if ($.browser.mobile) {
			infoRel = 1;
			$details.css('transition','1s').removeClass('hidden');
			runApart( renderFrame );
			setTimeout(function(){
				$iconClose.hide();
				$blocks.eq(active).children().each(function(i){
					var $block = $(this);
					if ($block.hasClass('portfolio-close-info')) return $block.css('display','block');
					setTimeout(function(){
						$block.removeClass('pre-anim');
					}, i*150 );
				});
			}, 1010 );
			return;
		}
		singleAnimation({ position: 1, duration: 1000,
			step: function(pos){
				infoRel = -pos;
				if (animating) return;
				renderFrame();
			},
			complete: function(){
				$iconClose.hide();

				$blocks.eq(active).children().each(function(i){
					var $block = $(this);
					if ($.support.transition) {
						if ($block.hasClass('portfolio-close-info')) return $block.css('display','block');
						setTimeout(function(){
							$block.removeClass('pre-anim');
						}, i*150 );
					} else {
						$block.css('opacity',0).removeClass('pre-anim').show().stop().delay( i*150 ).animate({ opacity: 1 });
					}
				});
			}
		});
	}
	function closeInfo(){
		var $blocks = $details.find('.portfolio-info')
			$blocks.eq(active).children().addClass( $.support.transition ? 'post-anim' : '')
				.filter('.portfolio-close-info').hide();
		if (!$.support.transition) {
			$blocks.eq(active).children().stop().animate({ opacity: 0 }, 550 );
		}

		var iconClosePos = calcIconClose( $blocks );
		$iconClose.css('transform','translate('+-iconClosePos+'px)').show();

		setTimeout(function(){
			$iconClose.css('transform','');
			$iconInfo.removeClass('info-active');
			setTimeout(function(){
				$iconBar.removeClass('info-active');
			}, 250 );

			if ($.browser.mobile) {
				infoRel = 0;
				$details.css('transition','1s');
				renderFrame();
				setTimeout( onComplete, 1000 );
				return;
			}
			singleAnimation({ position: 1, duration: 800, ease: 'mcsEaseOut',
				step: function(pos){
					infoRel = 1+pos;
					if (animating) return;
					renderFrame();
				},
				complete: onComplete
			});
			function onComplete(){
				barBlocked = false;
				infoActive = false;
				
				$container.removeClass('info-active');
				$details.addClass('hidden');

				$blocks.eq(active).children().css('opacity','')
					.filter('.portfolio-close-info').show();
			}
		}, 600 );
	}
	function calcPlus(){
		var plus = h.width;
		if (w.width < 1170) plus = 1170/2;
		if (w.width < 985) plus += w.width-985;
		if (w.width < 360) plus = -40;
		return plus;
	}
	function calcIconClose( $blocks, plus ){
		plus = plus || calcPlus();
		var pos = w.width-$blocks[0].offsetWidth-plus-40-54;
		if (w.width <= 1040) pos += 59+3;
		return pos;
	}
	$(window).on('resizeEvent',function(e){
		if ($details.hasClass('hidden')) {
			$details.css('transform','').find('.portfolio-info').css('left','');
		} else {
			var plus = calcPlus();
			$details.find('.portfolio-info').each(function(i){
				var pos = (i+1)*w.width*detailsCoef+plus;
				$(this).css('left', pos );
			});
		}
	});
	drawIcons();

	var active = start;
	var length = $itemsOriginal.children().length;
	var items = [];
	$itemsOriginal.children().each(function(i){
		var item = new Item( i, $(this).data('url') );
			items.push( item );
	});

	function Item( index, url ){
		this.index = index;
		this.url = url;
		this.loaded = false;
		this.$inner = $('<article />').appendTo( $stuff );
	}
	Item.prototype.draw = function( ctx, pos ){
		this.$inner.css('transform','translateX('+(pos-w.width)+'px)');
	}
	Item.prototype.drawBlurInfo = Item.prototype.drawBlurBar = function( ctx, pos ){}
	Item.prototype.hide = function(){
		this.$inner.css('transform','');
	}
	Item.prototype.load = function( callback ){
		if (this.loaded) return;
		if (callback) callback();
	}
	Item.prototype.prepare = function( $item, prepareCallback ){
		this.prepare = function(){}
		var _item = this;

		var $media = $item.find('.portfolio-media').children();
		var $info = this.$info = $item.find('.portfolio-info');

		if ($info.children(':not(.portfolio-close-info)').length == 0) {
			$info.append('<div class="letter">N</div><h4>No caption.</h4>');
		}

		if ($.browser.mobile) {
			_item.$inner.css('left', _item.index*100+'%' );
		}

		var type = this.type = $media.prop('src') ? 'image' : 'video';
		if (type == 'image') {
			var img = this.image = new FakeImage( $media.prop('src') );
			var blur = createCanvas();
			$(img).on('load',function(e){
				_item.loaded = true;
				_item.preloader.stop();

				blur.width = this.width/blurScale;
				blur.height = this.height/blurScale;
				blur.context.drawImage( this, 0, 0, blur.width, blur.height );
				stackBlurCanvasRGB( blur, 0, 0, blur.width, blur.height, 3 );

				renderFrame();
			});
			if ($.browser.mobile) {
				$(img).appendTo( this.$inner ).centerImages();
			}

			var media = $media[0];
			if (media.hasAttribute('data-crop-position')){
				img.crop = blur.crop = media.getAttribute('data-crop-position').split(' ');
			}

			this.preloader = new Preloader( this.$inner );
			this.draw = function( ctx, pos ){
				if (!$.browser.mobile && img.complete && img.src != '') {
					ctx.drawFilledImage( img, pos, 0, w.width, w.height );
				} else {
					_item.$inner.css('transform','translateX('+(pos-w.width)+'px)');
				}
			}
			this.drawBlurInfo = function( ctx, pos, offset, width ){
				if (img.src == '' || !img.complete) return;
				ctx.drawFilledImage( blur, offset+pos*detailsCoef, 0, w.width, w.height, {
					x: offset+pos*(detailsCoef-1), y: 0, w: width, h: w.height*infoRel
				});
			}
			this.drawBlurBar = function( ctx, pos, height ){
				if (img.src == '' || !img.complete) return;
				ctx.drawFilledImage( blur, pos, w.height-height, w.width, w.height, {
					x: 0, y: w.height-height, w: w.width, h: height
				});
			}
			this.load = function( callback ){
				if (_item.loaded) return;
				this.preloader.start();
				if (callback) $(img).on('load', callback );
				img.fakeLoad();
			}

			if (prepareCallback) prepareCallback();
		} else {
			var $video = $item.find('.video').addClass('spread only-play').appendTo( this.$inner );
			var video = this.video = new VideoPlayer({
				container: $video,
				type: getMediaTypeByClass( $video[0] ),
				source: $video.data(),
				controls: true,
				overlay: true,
				onload: function(){
					if (prepareCallback) prepareCallback();
				}
			});

			var blur = createCanvas();
			var overlayImage = video.overlay;
			$(overlayImage).onImageReady(function(){
				overlayImage.checkTaint();
				if (overlayImage.tainted === false) {
					blur.width = overlayImage.width/blurScale;
					blur.height = overlayImage.height/blurScale;
					blur.context.drawImage( overlayImage, 0, 0, blur.width, blur.height );
					stackBlurCanvasRGB( blur, 0, 0, blur.width, blur.height, 3 );
				}
			});
			this.load = function( callback ){
				if (_item.loaded) return;
				$(overlayImage).onImageReady(function(){
					if (_item.loaded) return;
						_item.loaded = true;
					if (callback) callback();
				});
				setTimeout(function(){
					// fallback
					if (_item.loaded) return;
						_item.loaded = true;
					if (callback) callback();
				}, 3000 );
			}
			this.drawBlurInfo = function( ctx, pos, offset, width ){
				if (video.state != 'idle' || overlayImage.tainted !== false) return;
				ctx.drawFilledImage( blur, offset+pos*detailsCoef, 0, w.width, w.height, {
					x: offset+pos*(detailsCoef-1), y: 0, w: width, h: w.height*infoRel
				});
			}
			this.drawBlurBar = function( ctx, pos, height ){
				if (video.state != 'idle' || overlayImage.tainted !== false) return;
				ctx.drawFilledImage( blur, pos, w.height-height, w.width, w.height, {
					x: 0, y: w.height-height, w: w.width, h: height
				});
			}
		}
	}

	var itemsReady = 0;
	items.forEach(function( elem, index ){
		var time = getTime();
		loadItemData( index, function(){
			if (++itemsReady != items.length) return;

			items.forEach(function( elem, index ){
				elem.$info.appendTo( $details );
			});
			drawIcons();

			items[active].load(function(){
				renderFrame();
				_this.ready();
				setTimeout(function(){
					loadClosest();

					// animation
					barBlocked = false;
					$iconClose.removeClass('hidden');
					setTimeout(function(){
						$iconInfo.removeClass('hidden');
					}, 350 );
					setTimeout(function(){
						$iconBar.removeClass('hidden');
					}, 650 );
				}, 1000 );
			});
		});
	});
	function loadClosest( index ){
		index = index || active;
		var left = index-1;
		var right = index+1;
		if (items[index]) items[index].load();
		if (items[left]) items[left].load();
		if (items[right]) items[right].load();
	}

	function loadItemData( index, callback ){
		var item = items[index];
		if (item === undefined) return;
		$.ajax({
			cache: true,
			url: item.url,
			dataType: 'html'
		}).done(function( html ){
			var $html = $(html).filter('.portfolio-item');
			item.prepare( $html, function(){
				if (callback) callback( item );
			});
		}).error(function(){
			// console.log( arguments );
		});
	}

	function stopPlayingVideo( index ){
		var item = items[index];
		if (item.video) item.video.stop();
	}

	var animating = false;
	var swipePos = -w.width*active;
	var available = (length-1)*w.width;
	var anim = this.anim = new MoveAnimation({ pos: -w.width*active });
	var touch = new TouchMove({
		elem: $viewport,
		pos: w.width*active,
		namespace: 'portfolio',
		alwaysPrevent: true,
		ondown: function( pos, event ){
			if (blocked) return false;
			$container.addClass('drag');
			if ($.browser.mobile) {
				$stuff.add( $stripes ).add( $details ).css('transition','');
			}
		},
		onmove: function( pos, diff, event ){
			movePortfolio( pos, 200 );
		},
		onup: function( pos ){
			if (blocked) return;
			$container.removeClass('drag');
			var prev = active;
			var index = Math.round(-pos/w.width);
				index = Math.max( 0, Math.min( items.length-1, index ));
			// xxx make it slide at 40-45%
			if ($.browser.mobile) {
				$stuff.add( $stripes ).add( $details ).css('transition','1100ms');
			}
			movePortfolio( index*w.width, 1100, function(){
				if (prev == index) return;
				stopPlayingVideo( prev );
			});
			if (active == index) return;
			loadClosest( active = index );
			setActivePreview();
		}
	});
	$(window).on('resizeEvent',function(e){
		if ($.browser.mobile) {
			$stuff.find('article img').centerImages();
		}
		$canvas[0].setDimensions( w.width, w.height, false, true );
		if (animating) return;
		anim.node.pos = swipePos = -active*w.width;
		touch.pos = -swipePos;
		available = (length-1)*w.width;
		renderFrame();
	});
	function movePortfolio( position, duration, complete, easing ){
		if (position < 0) position /= 2; 
		if (position > available) position = available+(position-available)/2;;

		if ($.browser.mobile) duration = 0;
		if (duration === 0) {
			animating = false;
			anim.clear();
			touch.pos = position;
			swipePos = anim.node.pos = -position;
			renderFrame();
			if (complete) complete();
			return;
		}

		animating = true;
		anim.animate( position, duration, {
			easing: easing,
			complete: function(){
				animating = false;
				if (complete) complete();
			},
			step: function(pos,rel){
				swipePos = pos;
				touch.pos = -swipePos;
				renderFrame();
			}
		});
	}

	var blurCanvas = createCanvas( w.width/blurScale, w.height/blurScale );
	function renderFrame(){
		ctx.clearCanvas();
		var placeIndex = -swipePos/w.width;
		var leftIndex = placeIndex >> 0;
		var rightIndex = Math.ceil( placeIndex );
		if ($.browser.mobile) {
			$stuff.css('transform3d','translateX('+swipePos+'px)');

			var strPos = swipePos < 0 ? (swipePos+available)*0.5+h.width : swipePos*0.5-h.width;
			$stripes.css('transform','translateX('+strPos+'px)');
		} else {
			items.forEach(function( elem, index ){
				if (elem.skip) {
					elem.skip > 0 ? rightIndex = -1 : leftIndex = -1;
				}
			});
			items.forEach(function( elem, index ){
				if (elem.skip) {
					elem.draw( ctx, swipePos+(active+elem.skip)*w.width );
				} else if (index == leftIndex) {
					elem.draw( ctx, swipePos+index*w.width );
				} else if (index == rightIndex) {
					if (leftIndex != rightIndex) elem.draw( ctx, swipePos+index*w.width );
				} else {
					elem.hide();
				}
			});
			// stripes
			if (placeIndex < 0 || placeIndex > items.length-1) {
				var rectW = placeIndex < 0 ? swipePos : swipePos+available;
				var rectX = placeIndex < 0 ? 0 : w.width;
				ctx.fillStyle = stripesPattern;
				var offset = rectW*0.47;
				ctx.translate( offset, 0 );
				ctx.fillRect( rectX-offset, 0, rectW, w.height );
				ctx.translate( -offset, 0 );
			}
		}


		if (infoActive) {
			$details.css('transform','translate('+(placeIndex+1)*-w.width*detailsCoef+'px,'+w.height*(infoRel-1)+'px)');
			if ($.browser.mobile) return;

			var offset = calcPlus()+40;
			items.forEach(function( elem, index ){
				if (index != rightIndex && index != leftIndex) return;
				var pos = index*w.width+swipePos;
				var wide = $details.find('.portfolio-info')[0].offsetWidth; // 63 - padding, 0.25 - 25% width
				elem.drawBlurInfo( ctx, pos, offset, wide );
			});
		}
		if (barInSight && !$.browser.mobile) {
			items.forEach(function( elem, index ){
				if (index != rightIndex && index != leftIndex) return;
				var pos = index*w.width+swipePos;
				elem.drawBlurBar( ctx, pos, 147-barBlur );
			});
			ctx.fillStyle = 'rgba(255,255,255,'+barRel*0.3+')';
			ctx.fillRect( 0, 0, w.width, w.height+barBlur-147 );
		}
	}

	// Bar
	var $barMovable = $('<div class="movable-part" />').append( $bar.children() ).appendTo( $bar );
	var barAnim = new MoveAnimation( $barMovable[0], true );
	
	var barAvailable = $barMovable[0].scrollWidth-w.width+10;
	if (barAvailable <= 10) barAvailable = 15;
	$(window).on('resizeEvent',function(e){
			barAvailable = $barMovable[0].scrollWidth-w.width+10;
		if (barAvailable <= 10) barAvailable = 15;
	});

	var $barItems = $bar.find('article').on('click',function(e){
		var prev = active;
		var index = $(this).index();
		if (blocked || index == prev) return;
			blocked = true;

		var position = index*w.width;
		var activeItem = items[active];
		var checkResize = w.width;
		swipePos = active > index ? -position-w.width : -position+w.width;
		anim.node.pos = swipePos;
		activeItem.skip = active > index ? 1 : -1;
		if ($.browser.mobile) {
			$stuff.css('transition','1100ms');
		}
		movePortfolio( position, 1100, function(){
			stopPlayingVideo( prev );
			activeItem.skip = false;
			blocked = false;
			if (checkResize != w.width) movePortfolio( active*w.width, 1 );
		}, 'ease');

		active = index;
		loadClosest();
		setActivePreview();
	});
	$(window).on('keyup',function(e){
		if (infoActive) return;
		if (e.keyCode == 37 && active > 0) $barItems.eq( active-1 ).click(); 
		if (e.keyCode == 39 && active < items.length) $barItems.eq( active+1 ).click(); 
	});

	setActivePreview();
	function setActivePreview(){
		$barItems.filter('.active').removeClass('active');
		$barItems.eq( active ).addClass('active');
	}

	var barBlocked = true;
	var barVisible = false;
	var barInSight = false;
	$(window).on('mousemove.portfoliobar',function(e){
		if ($.browser.mobile) return;
		if (barVisible) {
			var rel = (e.pageX-10) / (w.width-20);
				rel = rel < 0.02 ? 0 : rel > 0.98 ? 1 : rel;
			barAnim.animate( rel*barAvailable, 1300 );
		}
	});
	function barStateUpdate( state ){
		var prev = barVisible;
			barVisible = state;
		if (barBlocked || touch.downed) barVisible = false;
		if (prev != barVisible) barToggle( barVisible );
	}
	var barToggleAnim = new MoveAnimation({ pos: -147 });
	var barBlur = 0,
		barRel = 0;
	function barToggle( flag ){
		if (flag) barInSight = true;
		if (!$.support.pointerEvents) $canvas.css('zIndex', barInSight ? 20 : 14 );
		$container.toggleClass('bar-active', flag );
		var pos = flag ? 0 : 147;
		if ($.browser.mobile) {
			if (flag == false) barInSight = false;
			return;
		} else {
			$iconBar.css('transition','none');
		}
		barToggleAnim.animate( pos, 900, {
			easing: 'ease',
			dontRound: true,
			step: function( pos ){
				barBlur = -pos;
				barRel = 1-barBlur/147;
				$bar.css('transform','translateY('+barBlur+'px)');
				$iconBar.css('transform','translateY('+(-147+barBlur)+'px)');
				if (animating || $.browser.mobile) return;
				renderFrame();
			},
			complete: function(){
				$iconBar.css({ transition: '', transform: '' });
				if (flag == false) barInSight = false;
				if (!$.support.pointerEvents) $canvas.css('zIndex', barInSight ? 20 : 14 );
			}
		});
	}
}
Portfolio.prototype.close = function(){
	this.destroy();
}
Portfolio.prototype.destroy = function(){
	$(window).off('mousemove.portfoliobar');
	this.anim.clear();
	this.$container.remove();
}



// ================
//  Block: Devices
// ================

function DevicesBlock( container ){
	this.container = container;
	var _this = this;

	var $items = $('.devices-item', container ),
		$images = $('.devices-image', container );

	if (!$.support.flexBox) {
		$items.each(function(){
			var $list = $('.devices-list', this );
				$list.prependTo( this );
		});
	}

	// Reflections
	$images.each(function handleImage(){
		var type = this.className.match(/iphone|ipad/);
		if (!type) type = ['custom'];
		if (type) {
			type = type[0];

			var deviceImage = this;
			var $deviceImage = $(this).data('type', type );
		} else return;

		if ($(this).hasClass('no-reflection')) return;
		if (this.offsetWidth == 0 || this.offsetHeight == 0) return setTimeout(function(){
			handleImage.call( deviceImage );
		}, 1000/60 );

		var hasAnimation = $(this).is('[class*="animation-"]');
		if (hasAnimation) {
			$(this).on('animationCompleted',function(e){
				$canvas.css({
					transition: 'opacity 1s',
					opacity: ''
				});
			});
		}

		var topOffset = type == 'ipad' ? -16 : type == 'iphone' ? -2 : 0;
		var $canvas = $('<canvas class="devices-reflection" />').insertAfter( this );
			$canvas[0].setDimensions( deviceImage.offsetWidth, 100, false, true );
			$canvas.css({
				top: deviceImage.offsetTop+deviceImage.offsetHeight+topOffset,
				left: deviceImage.offsetLeft,
				opacity: hasAnimation ? 0 : ''
			});
		var ctx = $canvas[0].getContext('2d');
		var gradient = ctx.createLinearGradient( 0, 0, 0, 100 );
			gradient.addColorStop( 0, 'transparent');
			gradient.addColorStop( 1, 'black');
		ctx.makeGradient = function(){
			ctx.globalCompositeOperation = 'destination-out';
			ctx.style( gradient ).fR( 0, 0, frame.width, 100 )
				.style('rgba(255,255,255,0.86)').fR( 0, 0, frame.width, 100 );
		}

		var initState = w.width > 1170 ? 1 : 0;
		if (w.width <= 750) initState = -1;
		$(window).on('resizeWidth',function(e){
			var state = w.width > 1170 ? 1 : w.width <= 750 ? -1 : 0;
			$canvas.css('display', state == initState ? '' : 'none' );
		});

		var frame = new Image();
		var img = this.querySelector('img');
		if (type == 'ipad')   frame.src = 'images/frames/ipad.png';
		if (type == 'iphone') frame.src = 'images/frames/iphone.png';
		if (type == 'custom') frame.src = img ? img.src : this.src;
			frame.onload = function(){
				ctx.scale(1,-1);
				ctx.drawImage( this, 0, -this.height-topOffset );
				if (type == 'custom') return checkOverlap();

				$(img).onImageReady(function(){
					$(img).centerImages();

					var imgHeight = type == 'ipad' ? 377 : 260;
					var imgWidth = type == 'ipad' ? 283 : 147;
					var imgLeft = type == 'ipad' ? 30 : 14;
					var imgTop = type == 'ipad' ? 42 : 40;
					var ratio = this.width/imgWidth;
					ctx.drawFilledImage( img, imgLeft, imgTop-frame.height-topOffset, imgWidth, imgHeight );

					checkOverlap();
				});
			}

		function checkOverlap(){
			ctx.scale( 1, -1 );

			var $item = $deviceImage.parent().data('reflect-ready', true );
			var $sibling = $item.siblings('.devices-item');

			if (!$.support.flexBox) {
				var containerHeight = $(container).height();
				$items.each(function(){
					var height = this.offsetHeight;
					var $list = $('.devices-list', this );
					var offset = (containerHeight-$list.height())/2;
						$list.css('marginTop', -(containerHeight-height)+offset );
				});
			}

			// Sort of reassurance
			$item.add($sibling).find('.devices-image').each(function(){
				var type = $(this).data('type');
				var topOffset = type == 'ipad' ? -16 : type == 'iphone' ? -2 : 0;
				$(this).find('.devices-reflection').css({
					top: this.offsetTop+this.offsetHeight+topOffset
				});
			});

			if ($sibling.length == 0) return ctx.makeGradient();
			if (!$item.hasClass('overlap') && !$sibling.hasClass('overlap')) return ctx.makeGradient();
			if ($sibling.data('reflect-ready') != true) return;

			var overCanvas = $item.hasClass('overlap')
				? $item.find('.devices-reflection')[0]
				: $sibling.find('.devices-reflection')[0];
			var underCanvas = !$item.hasClass('overlap')
				? $item.find('.devices-reflection')[0]
				: $sibling.find('.devices-reflection')[0];

			var underRect = underCanvas.getBoundingClientRect();
			var overRect = overCanvas.getBoundingClientRect();

			var underCtx = underCanvas.getContext('2d');
				underCtx.globalCompositeOperation = 'destination-out';
			var overX = overRect.left-underRect.left,
				overY = overRect.bottom-underRect.bottom;
				underCtx.drawImage( overCanvas, overX, overY, overRect.width, overRect.height );
				underCtx.makeGradient();

			var overCtx = overCanvas.getContext('2d');
				overCtx.makeGradient();
		}
	});
}
$('.devices-block').each(function(i){
	var devices = new DevicesBlock( this );
});



// ================
//  Block: Persons
// ================

function PersonsBlock( container ){
	this.container = container;
	var _this = this;

	var $container = $(container),
		$items = $('article', container ),
		$togglersContainer = $('.togglers', container ),
		$movable = $('<div class="movable-part" />').addClass('grab-cursor')
			.append( $items ).insertBefore( $togglersContainer );
	var $headerBefore = $(container).prev().filter('.section-header');
	var headerHeight = $headerBefore.outerHeight(true) || 0;
	// var headerHeight = $headerBefore.outerHeight() || 0;

	var containerHeight = $container.height();
	var containerWidth = $container.width();
	var itemMargin = parseInt( getComputedStyle( $items[0] ).marginRight, 10 );
	var offsetWidth = containerWidth+itemMargin;

	var anim = new MoveAnimation( $movable[0], true );
	var active = 0;
	var blocksVisible = Math.ceil(containerWidth/296); // 282 width + 14 margin right
	var blocksAmount = Math.ceil($items.length/blocksVisible);
	var available = (blocksAmount-1)*offsetWidth;
	var noBlur = $container.hasClass('no-blur');

	$container.css('height', containerHeight );
	$movable.css('width', blocksAmount*offsetWidth );

	$(window).on('resizeWidth',function(e){
		var calculated = 1170;
		if (w.width < 1170) calculated = 874;
		if (w.width < 902) calculated = 578;
		if (w.width < 606) calculated = 282;
		if (calculated == containerWidth) return
			containerWidth = calculated;

		offsetWidth = containerWidth+itemMargin;
		blocksVisible = Math.ceil(containerWidth/296);
		blocksAmount = Math.ceil($items.length/blocksVisible);
		available = (blocksAmount-1)*offsetWidth;

		setActive( 0 );
		togglers.setAmount( blocksAmount );
		togglers.setActive( 0 );
	});

	if ($.browser.mobile) {
		$items.each(function(){
			var $item = $(this),
				$elems = $('.info-hover',this).children(),
				$before;
			// Select by priority
			if ($elems.length === 0) $('.info-hover', this ).append('<p />'); // sort of fallback
			if ($elems.filter('.social-media').length) $before = $elems.filter('.social-media')[0];
			if ($elems.filter('p').length) $before = $elems.filter('p')[0];

			$('<div class="mobile-plus" />').on('click',function(e){
				var opacity = $(this).css('opacity');
				if (opacity < 0.5) {
					e.stopPropagation();
					e.preventDefault();
				}
			}).insertAfter( $before );
		});
	}
	$items.each(function( i ){
		var $item = $(this);
		var $preview = $('.preview', this );
		var $info = $('.info-hover', this );
		var $infoStatic = $('.info', this );
		var $img = $preview.children('img');
		if ($img.length === 0) return;

		var itemAnim = new MoveAnimation({ pos: 0 });
		var width = 282,
			height = 367;
		var $canvas = $('<canvas width="'+width+'" height="'+height+'" />').appendTo( $preview );
			$canvas[0].setDimensions( width, height, false, true );
		var ctx = $canvas[0].getContext('2d');
		var img = $img[0];
		var blur = createCanvas();

		var scrollAnimation = false;
		if ($item.is('[class*="animation-"]') || $container.is('[class*="animation-"]')) {
			scrollAnimation = true;
			renderFrame( -width );
				$infoStatic.css('transform3d','translateX(-'+width+'px)')
					.find('h5, .caption').css('opacity', 0 ).css('transform','translateY(10px)');

			var itemAnimated = $item.is('[class*="animation-"]');
			$( itemAnimated ? $item : $container ).one('animationCompleted',function(e){
				var delay = itemAnimated ? 0 : i*380;
				if ($.browser.mobile && i >= blocksAmount) delay = 0; // if it is not visible
				setTimeout(function(){

				singleAnimation({
					position: -width,
					duration: 380,
					easing: 'linear',
					step: function( pos ){
						renderFrame( pos-width );
						$infoStatic.css('transform3d','translateX('+(pos-width)+'px)');
					},
					complete: function(){
						$infoStatic.find('h5, .caption').css({
							transition: '.7s .1s',
							transform: '',
							opacity: ''
						});
						scrollAnimation = false;
					}
				});
				
				}, delay );
			});
		}

		$img.onImageReady(function(){
			$img.remove();
			if (noBlur) return renderFrame( scrollAnimation ? -width : 0 );

			var width = img.naturalWidth || img.width;
			var height = img.naturalHeight || img.height;
			blur.setDimensions( width, height );
			;(function( ctx ){
				var buffer = createCanvas( width/4, height/4 );
				var bufferCtx = buffer.getContext('2d');
					bufferCtx.drawImage( img, 0, 0, buffer.width, buffer.height );
				stackBlurCanvasRGB( buffer, 0, 0, buffer.width, buffer.height, 2 );
				ctx.drawImage( buffer, 0, 0, width, height );
			})( blur.getContext('2d') );

			renderFrame( scrollAnimation ? -width : 0 );
		});

		$item.on('mouseenter mouseleave',function(e){
			if (scrollAnimation) return;
			if (_this.detailsPage) return;
			var shown = e.type == 'mouseenter' || e.type == 'mouseover';
			var offset = shown ? $info.outerHeight() : 0;
			animateInfo( offset, 700, 'draggerRailEase', function(){
				if ($.support.transition) {
					$info.children().toggleClass('visible', shown );
				} else {
					$info.children().stop().animate({
						opacity: shown ? 1 : 0,
						top: shown ? 0 : 15
					}, shown ? 600 : 1 );
				}
			});
		}).on('click',function(e){
			var $tar = $(e.target);
			if ($.browser.mobile) {
				if ($(e.target).hasClass('mobile-plus') === false) return;
			}
			var url = $(this).data('url');
			if (!url) return;
			if (_this.detailsPage) return;
				_this.detailsPage = true;

			var $personPage,
				personHeight = null,
				ajaxReady = false,
				preloaderReady = false;

			$.ajax({
				cache: true,
				url: url,
				dataType: 'html'
			}).done(function( html ){
				$personPage = $(html).filter('.person-page');
				checkLoad( ajaxReady = true );
			}).error(function(){
				// console.log( arguments );
			});

			var preloader = new Preloader( $item[0] );
			animateInfo( -$infoStatic.outerHeight(), 800, 'ease', function(){
				$container.css('will-change','height, transform, opacity');
				preloader.start(function(){
					checkLoad( preloaderReady = true );
				});
			});

			function checkLoad(){
				if (ajaxReady == false || preloaderReady == false) return;

				$personPage.css('opacity', 0 ).appendTo( container )
					.css('marginTop', -headerHeight );
				personHeight = $personPage.outerHeight() - headerHeight;
				handleAppendedBlocks( $personPage );
				$personPage.find('img').onMultiImagesReady( initDetails );
				$personPage.find('.person-close').one('click', closePersonPage );
			}
			function initDetails(){
				$personPage.find('.person-photo img').centerImages();

				$headerBefore.css('transition','.7s').addClass('animation-fadezoom');
				$container.css('height', personHeight ).transitEnd(function(){
					Scroll.resize();

					$movable.add( $togglersContainer ).hide();
					$personPage.css('opacity','').addClass('showed');

					$container.removeClass('hide-preview').addClass('hide-page')
						.css('overflow','visible');
					runApart(function(){
						$headerBefore.removeClass('animation-fadezoom').addClass('animation-fadezoomout');
						$container.addClass('show-page').removeClass('hide-page').css('will-change','').addClass('opened');
						$(window).on('resizeWidth.persons', resizePersonPage );

					});
				}, 'fn', 'opacity').addClass('hide-preview');
			}
			function resizePersonPage(){
				personHeight = $personPage.outerHeight() - headerHeight;
				$container.css('height', personHeight );
				$personPage.find('.persons-photo img').centerImages();
			}

			function closePersonPage(){
				$(window).off('resizeWidth.persons');
				preloader.stop();
				$container.css('will-change','height, transform, opacity').transitEnd(function(){
					$personPage.remove();
					$movable.add( $togglersContainer ).show();

					$container.addClass('hide-preview')
						.removeClass('hide-page').removeClass('opened')
						.css('overflow','');
					runApart(function(){
						$headerBefore.removeClass('animation-fadezoomout');
						$container.css('height', containerHeight ).transitEnd(function(){
							$container.removeClass('show-page');
							Scroll.resize();
						}, 'fn', 'opacity').removeClass('hide-preview');
						_this.detailsPage = false;
						animateInfo( 0, 800, 'ease');						
					});
				}, 'fn', 'opacity').addClass('hide-page');
			}
		});

		function animateInfo( pos, dur, easing, complete ){
			itemAnim.animate( pos, dur || 700, {
				easing: easing,
				complete: complete,
				step: function( pos ){
					$info.add( $infoStatic ).css('transform3d','translateY('+pos+'px)'); // xxx about 3d
					renderFrame();
				}
			});
		}
		function renderFrame( widthDiff ){
			widthDiff = widthDiff || 0;
			ctx.drawFilledImage( img, 0, 0, width, height );

			if (noBlur) return;
			var offset = 78-itemAnim.node.pos;
			ctx.drawFilledImage( blur, 0, height-offset, width, height, {
				x: 0, y: height-offset, w: width+widthDiff, h: offset
			});
		}
	});

	var togglers = new Togglers({
		elem: $togglersContainer,
		amount: blocksAmount,
		handler: function( index ){
			setActive( index );
		}
	});
	if (blocksAmount == 1) $movable.removeClass('grab-cursor');

	var clickTime, clickTarget;
	var touch = new TouchMove({
		elem: $(container),
		namespace: 'persons',
		ondown: function( pos, event ){
			clickTime = getTime();
			clickTarget = event.target;
		},
		onmove: function( pos, diff, event ){
			if ($.browser.mobile) $movable.css('transition','');
			movePersons( pos, $.browser.mobile ? 0 : 200 );
		},
		onup: function( pos, diff, event ){
			if (!$.browser.mobile && getTime() - clickTime < 350 && Math.abs(diff) < 10) {
				return $(clickTarget).click();
			}
			setActive( calcClosest(-pos) );
			return togglers.setActive( active );
		}
	});

	function calcClosest( pos ){
		var index = Math.round( pos/offsetWidth );
			index = Math.max( 0, Math.min( blocksAmount-1, index ));
		return index;
	}
	function setActive( index ){
		if ($.browser.mobile) $movable.css('transition','1.1s');
		movePersons( offsetWidth*index, 1100, 'ease');
		active = index;
	}
	function movePersons( pos, dur, easing ){
		if (pos < 0) pos /= 2;
		if (pos > available) pos = available+(pos-available)/2;

		if ($.browser.mobile) dur = 0;
		if (dur === 0) {
			$movable.css('transform3d','translateX('+-pos+'px)');
			touch.pos = pos;
			return;
		}

		anim.animate( pos, dur || 700, {
			easing: easing,
			step: function( pos ){
				touch.pos = -pos;
			}
		});
	}
}
$('.persons-block').each(function(i){
	var persons = new PersonsBlock( this );
});



// ===================
//  Block: Blog Posts
// ===================

function BlogPostsBlock( container ){
	this.container = container;
	var _this = this;

	var $container = $(container),
		$items = $('article', container ),
		$movable = $('<div class="movable-part" />').addClass('grab-cursor')
			.append( $items ).prependTo( container );

	var noBlur = $container.hasClass('no-blur');

	$items.each(function(i){
		var $item = $(this);
		var $preview = $('.preview', this );
		var $img = $preview.children('img');
		if ($img.length === 0) return;

		var itemAnim = new MoveAnimation({ pos: 0 });
		var width = 274,
			height = 477;
		var $canvas = $('<canvas width="'+width+'" height="'+height+'" />').appendTo( $preview );
			$canvas[0].setDimensions( width, height, false, true );
		var ctx = $canvas[0].getContext('2d');
		var img = $img[0];
		var blur = createCanvas();
		$img.onImageReady(function(){
			$img.remove();
			if (noBlur) return renderFrame();

			var width = img.naturalWidth || img.width;
			var height = img.naturalHeight || img.height;
			blur.setDimensions( width, height );
			;(function( ctx ){
				var buffer = createCanvas( width/4, height/4 );
				var bufferCtx = buffer.getContext('2d');
					bufferCtx.drawImage( img, 0, 0, buffer.width, buffer.height );
				stackBlurCanvasRGB( buffer, 0, 0, buffer.width, buffer.height, 2 );
				ctx.drawImage( buffer, 0, 0, width, height );
			})( blur.getContext('2d') );

			renderFrame();
		});

		var hoverAvailable = false;
		$item.on('mouseenter mouseleave',function(e){
			hoverAvailable = false;
			var shown = e.type == 'mouseenter' || e.type == 'mouseover';
			$(this).toggleClass('hover', shown );
			var offset = shown ? 64 : 0;
			animateCircle( offset, 700, null, function(){
				if (shown) hoverAvailable = true;
			});
		}).on('mouseover','.preview a',function(){
			if (!hoverAvailable) return;
			createWave( 50, 2200 );
			setTimeout( createWave, 125, 30, 2200 );
		});

		function animateCircle( offset, dur, easing, complete ){
			var waved = false;
			itemAnim.animate( offset, dur || 700, {
				easing: easing,
				complete: complete,
				step: function( pos ){
					renderFrame();
					if (pos < -61.5 && !waved) {
						waved = true;
						createWave( 30 );
					}
				}
			});
		}
		function renderFrame(){
			var radius = -itemAnim.node.pos;
			ctx.drawFilledImage( img, 0, 0, width, height );
			ctx.save();
				ctx.fillStyle = $preview.find('a').css('borderColor') || 'rgba(255,255,255,0.1)';
				ctx.begin().arc( width/2, height/2, radius, 0, Math.PI*2, true);
				if (!noBlur) {
					ctx.clip();
					ctx.drawFilledImage( blur, 0, 0, width, height );
				}
				ctx.fill();
			ctx.restore();
		}

		// Bubbles stuff
		var $bubbles = $('<canvas class="hover-bubbles" />')
			.attr({ width: width, height: height }).appendTo( $preview );
		var bubblesCtx = $bubbles[0].getContext('2d');
		var canvasEmpty = true;
		var waves = [];
		function createWave( radius, time ){
			waves.push({
				start: getTime(),
				x: width/2, y: height/2,
				radius: radius,
				time: time || 1500
			});
			if (canvasEmpty) renderWaves();
		}
		function renderWaves(){
			var x = bubblesCtx;
				x.clearCanvas();
			canvasEmpty = true;
			waves.forEach(function( wave, i ){
				canvasEmpty = false;
				var t = (getTime()-wave.start) / wave.time;
					t = Math.min( 1, Math.max( 0, t ));
				var rel = -t*(t-2);
					rel = Math.min( 1, Math.max( 0, rel ));
				x.lineWidth = 1+rel*(wave.radius/6);
				var opacity = Math.max( 0, Math.min( 1, (1-rel)*0.15 ));
				if (opacity < 0.01) opacity = 0;
					var R = 63+wave.radius*rel*0.6;
					var lh = x.lineWidth/2;
					var grd = 'transparent';
					try {
						grd = x.createRadialGradient(wave.x, wave.y, R-lh, wave.x, wave.y, R+lh);
						grd.addColorStop( 0, 'rgba(255,255,255,0)');
						grd.addColorStop( 0.5, 'rgba(255,255,255,'+opacity+')');
						grd.addColorStop( 1, 'rgba(255,255,255,'+opacity/2+')');
					} catch (e) {}; // there are some problems with IE9
					x.strokeStyle = grd;
				x.beginPath();
				x.arc( wave.x, wave.y, 63+wave.radius*rel*0.6, 0, Math.PI*2 );
				x.stroke();
				if (t >= 1) delete waves[i];
			});
			if (canvasEmpty == false) requestAnimationFrame( renderWaves );
		}
	}).on('mousedown touchstart','a',function(e){
		e.stopPropagation();
		if ($.browser.mobile && $(this).css('opacity') < 0.5) {
			$(this).trigger('mouseover');
			e.preventDefault();
		}
	}).on('click','h5',function(e){
		//	
	});

	var active, max, outerWidth, available, containerWidth, rowLength;
	var anim = new MoveAnimation( $movable[0], true );
	var touch = new TouchMove({
		elem: $(container),
		namespace: 'blog',
		ondown: function( pos, event ){
			if ($.browser.mobile) $movable.css('transition','');
		},
		onmove: function( pos, diff, event ){
			movePosts( pos, 200 );
		},
		onup: function( pos, diff, event ){
			if ($.browser.mobile) $movable.css('transition','.7s');
			setActive( calcClosest(-pos) );
		}
	});

	function recalculate(){
		containerWidth = container.offsetWidth;
		outerWidth = $items.eq(0).outerWidth(true);
		rowLength = Math.ceil( containerWidth/outerWidth );
		max = $items.length-rowLength;
		available = max*outerWidth;

		if ($.browser.mobile) $movable.css('transition','');
		setActive( 0 );
	}
	recalculate();
	$(window).on('resizeResponsive', recalculate );

	$movable.css('width', $items.length*outerWidth );

	function calcClosest( pos ){
		var index = Math.round( pos/outerWidth );
			index = Math.max( 0, Math.min( max, index ));
		return index;
	}
	function setActive( index ){
		movePosts( outerWidth*index, 1100, 'ease');
		active = index;
	}
	function movePosts( pos, dur, easing ){
		if (pos < 0) pos /= 2;
		if (pos > available) pos = available+(pos-available)/2;

		if ($.browser.mobile) dur = 0;
		if (dur === 0) {
			touch.pos = pos;
			$movable.css('transform3d','translateX('+-pos+'px)');
			return;
		}

		anim.animate( pos, dur || 700, {
			easing: easing,
			step: function( pos ){
				touch.pos = -pos;
			}
		});
	}
}
$('.posts-block').each(function(i){
	var posts = new BlogPostsBlock( this );
});



// ===============
//  Block: Quotes
// ===============

$('.quotes-rotator').each(function(i){
	var $container = $(this);
	var $post = $('.quotes', this );
	var $items = $('article', $post );
	var $togglersContainer = $('.togglers', this );
	var $arrows = $('.arrow-prev, .arrow-next', this );

	var active = 0;
	var max = $items.length-1;
	var height = 0;

	$items.hide().first().show();
	setTimeout(function(){
		height = $items.first().height();
		$post.css('height', height );
	}, 50 );

	$(window).on('fontsUpdated',function(e){
		height = $items.eq( active ).height();
		$post.css('height', height );
	});

	var togglers = new Togglers({
		elem: $togglersContainer,
		amount: $items.length,
		handler: function( index ){
			setActive( index );
		}
	});

	if ($.browser.mobile || $container.hasClass('quotes-alternative')) {
		$items.addClass('grab-cursor');
		var touch = new TouchMove({
			elem: $container,
			namespace: 'posts',
			onup: function( pos, diff ){
				if (Math.abs(diff) < 20) return;
				$arrows.eq( diff > 0 ? 0 : 1 ).triggerHandler('click');
			}
		});
	}

	$arrows.on('click',function(e){
		var index = $arrows.index(this) ? active+1 : active-1;
		if (index < 0) index = max;
		if (index > max) index = 0;
		setActive( index );
		togglers.setActive( index );
	});

	function setActive( index ){
		if (index == active) return;

		if ($.support.transition) {
			$items.css('opacity', 0 );
		} else {
			$items.stop().animate({ opacity: 0 }, 480 );
		}
		setTimeout(function(){
			$items.eq( active ).hide();
			$items.eq( index ).show();
			active = index;

			var currHeight = $items.eq( index ).height();
			if (currHeight == height) {
				animateCurrent();
			} else {
				height = currHeight
				if ($.support.transition) {
					$post.css('height', height );
				} else {
					$post.stop().animate({ height: height }, 480 );
				}
				setTimeout( animateCurrent, 500 );
			}

			function animateCurrent(){
				if ($.support.transition) {
					$items.eq( index ).css('opacity', 1 );
				} else {
					$items.eq( index ).stop().animate({ opacity: 1 }, 480 );
				}
			}
		}, 500 );
	}

	$(window).on('resizeWidth',function(e){
		var height = $items[0].scrollHeight;
		$post.css('height', height );
	});

	if (max === 0) $arrows.hide();
	// render arrows + waves
	$arrows.each(function(){
		var $canvas = $('<canvas />').attr({ width: 100, height: 100 }).appendTo( this );
		var ctx = $canvas[0].getContext('2d');
		var waves = [];
		var canvasEmpty = true;

		$(this).on('click',function(e){
			createWave( 50 );
			setTimeout( createWave, 125, 30 );
		}).on('mouseover',function(e){
			createWave( 30 );
		});

		function createWave( radius ){
			waves.push({
				start: getTime(),
				radius: radius
			});
			if (canvasEmpty) renderWaves();
		}
		function renderWaves(){
			ctx.clearCanvas();
			canvasEmpty = true;
			waves.forEach(function( wave, i ){
				canvasEmpty = false;
				var t = (getTime()-wave.start) / 2200; // 2.2s is duration
					t = Math.min( 1, Math.max( 0, t ));
				var rel = -t*(t-2);
					rel = Math.min( 1, Math.max( 0, rel ));
				ctx.lineWidth = 0.2+rel*(wave.radius/20);
				var opacity = Math.max( 0, Math.min( 1, (1-rel)*0.2 ));
				ctx.strokeStyle = 'rgba(255,255,255,'+opacity+')';
				ctx.beginPath();
				ctx.arc( 50, 50, 20+wave.radius*rel*0.6, 0, Math.PI*2 );
				ctx.stroke();
				if (t >= 1) delete waves[i];
			});
			if (canvasEmpty == false) requestAnimationFrame( renderWaves );
		}
	});
});



// ==============
//  Block: Logos
// ==============

function ScrollableLogo( container ){
	var $container = $(container).addClass('grab-cursor');
	var $elements = $container.children();
	
	var anim = this.anim = new MoveAnimation({ pos: 0 });
	var positions = [];
	var runOnReady = [];
	
	var gridWidth = container.offsetWidth;

	var _this = this;
		_this.container = container;
		_this.active = 0;
		_this.amount = $elements.length;
		_this.positions = positions;
		_this.onReady = function( func ){
			if (positions.length) return func();
			runOnReady.push( func );
		}

	$elements.find('img').onMultiImagesReady( init );
	function init(){
		var fund = 0; // stores distance to currently processing element
		calculatePositions();
		_this.calculatePositions = calculatePositions;
		function calculatePositions(){
			positions = _this.positions = [];
			gridWidth = container.offsetWidth;
			fund = 0;
			_this.active = 0;

			$elements.each(function(i){
				var index_left = i;
				var index_right = i+1;
				var space  = getElementWidth( i );
				while (index_right < $elements.length && space + getElementWidth( index_right ) < gridWidth) {
					space += getElementWidth( index_right++ );
				}
				fund += getElementWidth( index_left-1 );
				$(this).data('fund', fund );

				var diff  = 0; // stores space between a pair of elements
				if (positions[0]) for (var k = positions.last().left; k < index_left; k++){
					diff += getElementWidth( k );
				}

				--index_right;
				if (positions.last() && positions.last().right == index_right) return;
				positions.push({
					left: index_left,
					right: index_right,
					padding: (gridWidth-space),
					position: fund,
					diff: diff,
					point: []
				});
			});
			positions.forEach(function( one, i ){
				$elements.each(function(k){
					var pos = $(this).data('fund') - one.position;
					if (k > one.right) pos += one.padding;
					if (k <= one.right && k >= one.left) pos += one.padding/2;
					one.point[k] = pos;
				});
			});

			setElementsPosition( 0 );
			_this.static = positions.length == 1;
		}

		if (positions.length == 1) return _this.static = true;

		_this.hold = _this.hover = false;
		_this.releaseTime = 0;
		var available = positions.last().position;
		var clickTime, clickTarget;
		var touch = _this.touch = new TouchMove({
			elem: $container,
			namespace: 'clients',
			ondown: function( pos, event ){
				_this.hold = true;
				clickTime = getTime();
				clickTarget = event.target;
				if ($.browser.mobile) $elements.css('transition','');
			},
			onmove: function( pos, diff, event ){
				animateElements( pos, 200 );
			},
			onup: function( pos, diff, event ){
				_this.hold = false;
				_this.releaseTime = getTime();
				if (!$.browser.mobile && getTime() - clickTime < 350 && Math.abs(diff) < 10) {
					return $(clickTarget).click();
				}
				return animateToClosest( pos );
			}
		});
		$container.on('mouseover mouseout',function(e){
			_this.hover = e.type == 'mouseover';
			if (!_this.hover) _this.releaseTime = getTime();
		});

		_this.getElementWidth     = getElementWidth;
		_this.setElementsPosition = setElementsPosition;
		_this.animateElements     = animateElements;
		_this.animateToClosest    = animateToClosest;
		_this.animateToActive     = animateToActive;

		runOnReady.executeFunctions();

		function getElementWidth( i ){
			var img = $elements.eq(i).children('img')[0];
			var pH = _this.options.paddingHalf;
			return ((i != -1 && img) ? img : { width: -pH }).width+pH;
		}
		function setElementsPosition( goal ) {
			var ind = 0;
			while (positions[ind] && positions[ind].position < goal) ind++;
			var curr = positions[ind-1] || positions[ind],
				next = positions[ind] || positions[ind-1];
			var rel = curr == next ? 1 : (goal - curr.position)/next.diff;
			$elements.each(function(i){
				var pos = rel*(next.point[i]-curr.point[i])+curr.point[i];
				if (goal < 0) pos -= goal*_this.options.slowerIndex;
				if (goal > available) pos -= (goal-available)*_this.options.slowerIndex;
				$(this).css('transform','translateX('+pos+'px)');
			});
		}
		function animateElements( pos, duration, easing ){
			if ($.browser.mobile) duration = 0;
			if (duration === 0) return setElementsPosition( pos );
			anim.animate( pos, duration || 700+Math.abs(anim.node.pos-pos)/5, {
				easing: easing,
				step: function(pos){
					setElementsPosition( -pos );
				}
			});
		}
		function animateToClosest( pos ){
			var fixedPos, range = 1e9;
			positions.forEach(function( one, i ){
				var onesRange = Math.abs( one.position + pos );
				if (range < onesRange) return;
					range = onesRange;
				fixedPos = one.position;
				_this.active = i;
			});
			if ($.browser.mobile) $elements.css('transition','1s');
			animateElements( fixedPos );
			return fixedPos;
		}
		function animateToActive( duration ){
			var pos = positions[_this.active].position;
			touch.pos = pos;
			if ($.browser.mobile) $elements.css('transition','1s');
			animateElements( pos, duration || 1000, 'ease');
		}
	}
}
ScrollableLogo.prototype.options = {
	gridWidth: 1170,
	slowerIndex: 0.35,
	paddingHalf: 30
}
$('.client-block').each(function(){
	var container = this;
	var clients = new ScrollableLogo( container );
	if (clients.static) {
		$(container).addClass('static-client-logos');
		return;
	}

	// Automatic change
	var timer = null;
	function scheduleChange( time ){
		clearTimeout( timer );
		timer = setTimeout( makeChange, time );
	}
	function makeChange(){
		scheduleChange( 3000 );
		if (clients.hover || clients.hold) return;
		var diff = getTime()-clients.releaseTime;
		if (diff < 3000) return scheduleChange( 3000-diff );
		moveBunch();
	}

	var dir = true; // while it is TRUE elements will move to the right
	function moveBunch(){
		var P = clients.positions;
		var initActive = clients.active;
		if (clients.static) return;
		if (dir && !P[clients.active+1]) dir = false;
		if (!dir && !P[clients.active-1]) dir = true;
		if (dir) {
			var index = P[clients.active].right;
			clients.active++;
		} else {
				index = P[clients.active].left;
			clients.active--;
		}
		if (initActive == clients.active) return moveBunch();
		clients.animateToActive( 1500 );
	}

	$(window).on('resizeResponsive',function(e){
		clients.calculatePositions();
		if (timer === null) return;
		clients.touch.pos = clients.anim.node.pos = 0;
		dir = true;
		scheduleChange( 2000 );
	});
	var visibility = new ElementVisibility( container );
		visibility.onshow(function(){
			scheduleChange( 2000 );
		});
		visibility.onhide(function(){
			clearTimeout( timer );
		});
});



// ==============
//  Block: Stats
// ==============

function StatsBlock( container ){
	this.container = container;
	var _this = this;
		_this.active = 0;
	var anim = _this.anim = new MoveAnimation({ pos: 0 });

	var items = [];
	var $items = $('article', container ).each(function(i){
		var _item = {};
			// _item.$canvas = $('<canvas width="196" height="196" />').appendTo(this);
			// _item.ctx = _item.$canvas[0].getContext('2d');
			_item.$circle = $('<div class="stats-circle" />').appendTo( this );
			_item.$number = $('.number',this);
			_item.num = parseInt( _item.$number.text(), 10 );
			_item.filled = false;
		items.push( _item );
		// Initial stats
		_item.$number.text('0');
	});
	var itemWidth = $items[0].offsetWidth, // must be 260?
		containerWidth, rowLength, fullWidth, maxIndex, available;
	function setUpInitial() {
		containerWidth = container.offsetWidth;
		rowLength = Math.ceil(containerWidth/itemWidth); // ceiling isn't necessery tho
		fullWidth = itemWidth*(rowLength-1);
		maxIndex = $items.length-rowLength;
		available = maxIndex*itemWidth;
		if (items.length < rowLength+1) _this.static = true;

		setElementsPosition( 0 );
		anim.node.pos = 0;
	}
	setUpInitial();

	var saved = 0;
	$(window).on('resizeWide',function(e){
		setElementsPosition( saved );
	});

	_this.items = items;
	_this.$items = $items;
	_this.fillInitial = fillInitial;
	_this.fillCertain = fillCertain;
	_this.animateElements = animateElements;
	_this.animateToClosest = animateToClosest;
	_this.setUpInitial = setUpInitial;

	function slow( pos ){
		return slowIteration( pos, 15, 0.95 );
	}
	function setElementsPosition( pos ){
		var outer = (w.width-containerWidth)/2+itemWidth/2;
		if (pos > 0) {
			pos = slow( pos );
		} else if (-pos > available) {
			pos = -available-slow( -pos-available );
		}			
		saved = pos;
		$items.each(function( i ){
			var relative = pos+i*itemWidth;
			var itemPos = pos;
			if (i < rowLength && pos > 0) relative = 0;
			if (i >= maxIndex && -pos > available) relative = 0;
			if (relative < 0) {
				itemPos += -ease(-relative/itemWidth, 'ease-in')*outer;
			} else if ( Math.floor(relative) > fullWidth) {
				// | I need 'Math.floor' here because 'relative' never
				// | takes integer value. Basically, it's 723.0352 or smth
				itemPos += ease( (relative-fullWidth)/itemWidth, 'ease-in')*outer;
			} else if (items[i].filled == false) {
				fillCertain( i );
			}
			$(this).css('transform','translateX('+itemPos+'px)');
		});
	}
	function animateElements( pos, duration, easing ){
		if ($.browser.mobile) duration = 0;
		if (duration === 0) {
			anim.node.pos = -pos;
			setElementsPosition( -pos );
			return pos;
		}
		anim.animate( pos, duration || 700+Math.abs(anim.node.pos-pos)/5, {
			easing: easing,
			step: function(pos){
				setElementsPosition( pos );
			}
		});
		return pos;
	}
	function animateToClosest( pos ){
		var duration = 600;
		if (pos > 0) {
			_this.active = 0;
		} else if (-pos > available) {
			_this.active = maxIndex;
		} else {
			duration = 800;
			_this.active = Math.round( -pos/itemWidth );
		}
		return animateElements( _this.active*itemWidth, duration );
	}

	function fillInitial(){
		if (_this.ready) return;
			_this.ready = true;
		var max = Math.min(4,items.length);
		for (var i = 0; i < max; i++) items[i].filled = true;
		singleAnimation({
			duration: 1200,
			step: function(pos){
				for (var i = 0; i < max; i++) {
					items[i].$number.text( Math.round(-pos*items[i].num) );
				}
			}
		});
	}
	function fillCertain( index ){	
		if (!_this.ready) return;
		var one = items[index];
			one.filled = true;
		singleAnimation({
			duration: 1000,
			step: function(pos){
				one.$number.text( Math.round( -pos*one.num ) );
			}
		});
	}
}
StatsBlock.prototype = {
	itemWidth: 241,
	containerWidth: 1040
}
$('.stats-block').each(function(){
	var container = this;
	var stats = new StatsBlock( this );
	var visibility = new ElementVisibility( container );
		visibility.onshow( stats.fillInitial );

	// Hover bubbles
	var $section = $(this).closest('section');
	var height = $section.height();
	var $bubbles = $('<canvas class="hover-bubbles" />')
		.attr({ width: w.width, height: height }).appendTo($section);
	$(window).on('resizeWidth',function(e){
		$bubbles[0].width = w.width;
	});
	var ctx = $bubbles[0].getContext('2d');
	var waves = [];
	var canvasEmpty = true;

	var timerWave0 = null,
		timerWave1 = null;
	$('.stats-circle',container).on('mouseover',function(e){
		var centerX = $(this).width()/2+$(this).offset().left;
		var centerY = $(this).height()/2+(this.offsetParent.offsetTop+this.offsetTop);
		createWave( this, 50 );
		timerWave0 = setTimeout( createWave, 125, this, 30 );
		timerWave1 = setTimeout( createWave, 400, this, 15 );
	}).on('mouseleave',function(e){
		clearTimeout( timerWave0 );
		clearTimeout( timerWave1 );
	});

	if (stats.static) return;

	var $outerParallax = $(container).closest('.parallax-block').addClass('grab-cursor');
	if ($outerParallax.length == 0) $outerParallax = $(container).addClass('grab-cursor');
	var sectionTop = getOffsetTop( $outerParallax[0] );
	var bubbles = new TouchBubbles( $outerParallax[0] );
	var touch = new TouchMove({
		elem: $outerParallax,
		namespace: 'stats',
		ondown: function( pos, event ){
			if (!stats.ready) return;
			if ($.browser.mobile) {
				stats.$items.css('transition','');
			} else {
				sectionTop = getOffsetTop( $outerParallax[0] );
				bubbles.show( event.pageX, event.clientY-sectionTop+Scroll.position );
			}
		},
		onmove: function( pos, diff, event ){
			if (!stats.ready) return;
			stats.animateElements( pos, 200 );
			if (!$.browser.mobile) bubbles.position( event.pageX, event.clientY-sectionTop+Scroll.position  );
		},
		onup: function( pos, diff, event ){
			if (!stats.ready) return 0;
			if ($.browser.mobile) {
				stats.$items.css('transition','.7s');
			} else {
				bubbles.hide();
			}
			return stats.animateToClosest( pos );
		}
	});
	$(window).on('resizeResponsive resizeFix',function(){
		stats.setUpInitial();
		touch.pos = 0;
	});

	function createWave( elem, radius ){
		var X = elem.offsetWidth/2+$(elem).offset().left;
		var Y = elem.offsetHeight/2+(elem.offsetParent.offsetTop+elem.offsetTop);
		waves.push({
			start: getTime(),
			x: X, y: Y,
			radius: radius
		});
		if (canvasEmpty) renderWaves();
	}
	function renderWaves(){
		ctx.clearCanvas();
		canvasEmpty = true;
		waves.forEach(function( wave, i ){
			canvasEmpty = false;
			var t = (getTime()-wave.start) / 2200; // 2.2s is duration
				t = Math.min( 1, Math.max( 0, t ));
			var rel = -t*(t-2);
				rel = Math.min( 1, Math.max( 0, rel ));
			ctx.lineWidth = 1+rel*(wave.radius/6);
			var opacity = Math.max( 0, Math.min( 1, (1-rel)*0.15 ));
				var R = 95+wave.radius*rel*0.6;
				var lh = ctx.lineWidth/2;
				var grd = ctx.createRadialGradient(wave.x, wave.y, R-lh, wave.x, wave.y, R+lh);
					grd.addColorStop( 0, 'rgba(255,255,255,0)');
					grd.addColorStop( 0.5, 'rgba(255,255,255,'+opacity+')');
					grd.addColorStop( 1, 'rgba(255,255,255,'+opacity/2+')');
				ctx.strokeStyle = grd;
			ctx.beginPath();
			ctx.arc( wave.x, wave.y, 95+wave.radius*rel*0.6, 0, Math.PI*2 );
			ctx.stroke();
			if (t >= 1) delete waves[i];
		});
		if (canvasEmpty == false) requestAnimationFrame( renderWaves );
	}
});



// ===============
//  Block: Skills
// ===============

function SkillsBlock( container ){
	if (container.querySelector('.skills-track')) return;

	this.container = container;
	var _this = this;

	var $items = $('article', container );

	$items.each(function(){
		var percent = parseInt( $(this).data('percent'), 10 );
		var $title = $(this).children('p');
		var $track = $('<div class="skills-track" />').appendTo( this );
		var $fill = $('<div class="skills-fill" />').css('width', percent+'%').appendTo( $track );
		var $indicator = $('<div class="skills-percent">'+percent+'%</div>').appendTo( $fill );
	});
}
$('.skills-block').each(function(){
	var skills = new SkillsBlock( this );
});



// =====================
//  Block: Contact Form
// =====================

function ContactForm( container ){
	this.container = container;
	var _this = this;
	var $fields = $('input, textarea', container ),
		$cancel = $('a.cancel', container ),
		$submit = $('a.submit', container );

	// Prepare DOM
	$fields.add( $submit ).each(function(){
		var top = this.offsetTop+3;
		var text = $(this).data('hint');
		if (!text) {
			$(this).data('hint_element', $() );
			return;
		}
		var $hint = $('<div class="hint" style="top:'+top+'px;"><p class="text">'+text+'</span><div class="character"><i>!</i></div></div>');
		$(this).data('hint_element', $hint.prependTo( container ) );
	});
	$fields = $('<input type="hidden" value="'+$(container).data('subject')+'" name="subject">').appendTo( container ).add( $fields );

	// Button click and fields focus/blur behaviour
	$submit.on('click',function(e){
		var submitAllowed = true;
		$fields.each(function(){
			var $field = $(this);
			if (this.hasAttribute('required') && $field.val().trim() === '') {
				$field.data('hint_element').addClass('pulse-hint');
				$field.addClass('pulse').focus().one('blur',function(){
					$field.removeClass('pulse');
					$field.data('hint_element').removeClass('pulse-hint');
				});
				submitAllowed = false;
				return false;
			}
		});
		if (submitAllowed) {
			$.ajax({
				url: 'contact.php',
				method: 'POST',
				data: $fields.serialize(),
				complete: function( obj ){
					var $hint = $submit.data('hint_element').css({ opacity: 1, marginLeft: 30 });
						$hint.children('.text').text( obj.responseText );
					$(window).one('touchstart mousedown',function(e){
						$hint.css({ opacity: 0, marginLeft: 50 });
					});
				}
			});
		}
	});
	$cancel.on('click',function(e){
		$fields.empty().trigger('blur').val('');
	});
	$fields.on('focus blur',function(e){
		var focus = e.type == 'focus';
		if (!focus) $(this).toggleClass('has-text', !$(this).is(':empty') );
		$(this).data('hint_element').css({
			opacity: focus ? 1 : 0,
			marginLeft: focus ? 30 : 50
		});
	});
}
$('.contacts-form').each(function(){
	var container = this;
	var form = new ContactForm( container );

	// Textarea resizable
	var $section = $(this).closest('section');
	$('textarea',this).each(function(){
		var textarea = this;
		var min = textarea.clientHeight-12,
			max = 500;
		var $thumb = $('<div class="resize-thumb"><hr></div>').insertAfter( textarea );
		$thumb.on('mousedown',function(e){
			var initY = e.pageY;
			var initScroll = Scroll.position;
			var initHeight = textarea.clientHeight;
			$(window).on('mousemove.textarea',function(e){
				var diff = e.pageY-initY+(Scroll.position-initScroll);
				var height = Math.max( min, Math.min( max, initHeight+1+diff ));
				textarea.style.height = height+'px';
				$section.trigger('changedHeight');
				e.preventDefault();
			}).one('mouseup',function(e){
				Scroll.resize();
				$(window).off('mousemove.textarea');
			});
			e.preventDefault();
		});
	});
});
$('.contacts-block .contacts-form').each(function(){
	var $form = $(this),
		$block = $form.closest('.contacts-block'),
		$opener = $('<div class="contacts-form-opener"><i class="fa fa-paper-plane"></i></div>').appendTo( $block ),
		$closer = $('<div class="contacts-form-close"><i class="icon-cross"></i></div>').appendTo( $block );
	$opener.add( $closer ).on('click',function(){
		$form.css('transition','.8s').toggleClass('hidden');
		$block.toggleClass('opened', !$form.hasClass('hidden') );
	});
	drawIcons();
});
$('.custom-form').each(function(i){
	$('<input type="hidden" value="'+$(this).data('subject')+'" name="subject">').appendTo( this );
	var $fields = $('input, textarea', this );

	$('.clear', this ).on('click',function(e){
		$(this).closest('form').find('input, textarea').val('');
	});
	$('.send', this ).on('click',function(e){
		var submitAllowed = true;
		var $form = $(this).closest('form');
		var $status = $form.find('.custom-form-status');
		$form.find('input, textarea').each(function(i){
			if (!this.required) return;
			if ($.trim(this.value) != '') return;

			var message = $(this).data('hint') || 'Please, fill the required field';
			if ($status.css('opacity') > 0.2) {
				$status.removeClass('visible');
				setTimeout(function(){
					$status.text( message ).addClass('visible');
				}, 600 );
			} else {
				$status.text( message ).addClass('visible');
			}
			$(this).addClass('pulse').focus().one('blur',function(e){
				$(this).removeClass('pulse');
				$status.removeClass('visible');
			});
			submitAllowed = false;
			return false;
		});
		if (submitAllowed) {
			$.ajax({
				url: 'contact.php',
				method: 'POST',
				data: $fields.serialize(),
				complete: function( obj ){
					var message = obj.responseText;
					if ($status.css('opacity') > 0.2) {
						$status.removeClass('visible');
						setTimeout(function(){
							$status.text( message ).addClass('visible');
						}, 600 );
					} else {
						$status.text( message ).addClass('visible');
					}
				}
			});
		}
	});
});



// ======================
//  Element: Google Maps
// ======================

function GoogleMaps( container ){
	this.container = container;
	var _this = this;
	var API = google.maps;
	var styles = $(container).data('style');

	var maxZoom = 21; // Map.getMaxZoomAtLatLng( Center );
	var coords = $(container).data('coords').split(',');
	var Center = new API.LatLng( +coords[0], +coords[1] );

	var mapOptions = $.extend({ center: Center }, _this.mapOptions );
		mapOptions.styles = styles ? mapsScheme[styles] : mapOptions.styles;
	var Map = _this.Map = new API.Map( container, mapOptions );

	var markerOptions = $.extend({ map: Map, position: Center }, _this.markerOptions );
	if ($(container).hasClass('no-marker') == false) var Marker = _this.Marker = new API.Marker( markerOptions );

	// Detect meter correct meter system
	(function(){
		var dirService = new API.DirectionsService();
			dirService.route({
				origin: Center,
				destination: Center,
				travelMode: API.TravelMode.DRIVING
			}, function( result, status ){
				_this.miles = !!result.routes[0].legs[0].distance.text.match(/ft/g);
			});
	})();

	var Scale = this.scale = {
		pos: 0,
		add: function( html ){
			return $(html).appendTo( this.$container );
		},
		init: function(){
			if ($.browser.mobile) return;

			Scale.$container = $('<div class="scale-container"></div>');
			var visibility = new ElementVisibility( container );
			visibility.onshow(function(){
				Scale.$container.css('transform','none');
			}, true );

			this.$container.appendTo( container.parentNode );
			this.$track = this.add('<canvas width="21" height="184" class="scale-track"></canvas>');
			this.$track[0].setDimensions( 21, 184, false, true );
			this.$thumb = this.add('<div class="scale-thumb"><span></span><div></div></div>');

			var $slider = this.$thumb.children('hr'),
				$text = this.$thumb.children('span');

			var anim = this.anim = new MoveAnimation( this.$thumb[0] );
			var touch = this.touch = new TouchMove({
				elem: this.$thumb,
				namespace: 'map',
				vertical: true,
				ondown: function( pos, event ){
					$slider.addClass('downed');
					$text.css('opacity', 1 ).text( Scale.getScaleText(-pos/184) );
					track.using = true;
					track.timestamp = getTime();
					track.saved = track.progress;
					track.render();
				},
				onmove: function( pos, diff, event ){
					var bounded = Math.min( 0, Math.max( -184, pos ));
					anim.animate( bounded, 150, {
						step: function( pos ){
							Scale.pos = pos;
							var textPos = bounded < -183 ? 184 : bounded > -1 ? 0 : -bounded;
							$text.text( Scale.getScaleText(textPos/184) );
						}
					});
					return bounded;
				},
				onup: function( pos, diff, event ){
					$slider.removeClass('downed');
					$text.css('opacity', 0 );
					track.using = false;
					track.timestamp = getTime();
					track.saved = track.progress;
					Map.setZoom( Math.round( maxZoom*(1-pos/184) ) );
				}
			});

			this.$track.on('click', this.changeZoom );

			// Initial position
			var zoomLevel = _this.mapOptions.zoom;
			this.changeZoom( 184*(1-zoomLevel/maxZoom) );

			// Track init
			var track = this.track;
			for (var i = 0; i < 62; i++) {
				track.stripes[i] = {
					pos: i*3,
					width: 7,
					potential: 0,
					actual: 0
				}
			}
			track.render();
		},
		track: {
			stripes: [],
			using: false,
			progress: 0,
			saved: 0,
			timestamp: null,
			request: null,
			render: function render(){
				var x = Scale.$track[0].getContext('2d');
					x.clearCanvas();

				var rel = Math.min( 1, (getTime()-this.timestamp)/500 );
				if (this.using) {
					this.progress = this.saved+(1-this.saved)*rel;
				} else {
					this.progress = this.saved*(1-rel);
				}
				
				this.stripes.forEach(function( unit ){
					var rel = Math.abs( unit.pos - Scale.pos );
						rel = rel > 1 ? rel-1 : 0;
						rel = Math.max( 0, Math.min( 1, 1-rel*0.05 ));
						rel = Math.pow( rel, 5 ); // easing
					unit.potential = rel*7;
					if (unit.actual != unit.potential) {
						var range = unit.potential-unit.actual;
						if (Math.abs(range) < 1) {
							unit.actual = unit.potential;
						} else {
							unit.actual += range > 0 ? 1 : -1;
						}
					}
					var width = unit.width+this.progress*unit.actual;
					x.fillRect( 7, unit.pos, width, 1 );
				}.bind(this));

				cancelAnimationFrame( this.request || null );
				if (this.progress == 0 && this.using == false) return;
				this.request = requestAnimationFrame( render.bind(this), Scale.$track[0] );
			}
		},
		changeZoom: function(e){
			var pos = typeof e == 'number' ? e : e.offsetY;
			Scale.pos = pos;
			Scale.touch.pos = -pos;
			Scale.anim.animate( -pos, 500 );
			Map.setZoom( Math.round( maxZoom*(1-pos/184) ) );
		},
		getScaleText: function( position ){
			var steps = [10,20,50,100,200,500,1000,2000,5000,10000,20000,50000,75000,100000,200000,500000,750000,1000000,2000000,5000000,10000000];
			var stepStart = steps.shift(), // first pos at step
				stepEnd = steps.shift(), // second pos at step
				stepAmount = steps.length,
				level = 0; // current 'steps' index
			while (position*stepAmount >= ++level) {
				stepStart = stepEnd;
				stepEnd = steps[level-1];
			}
			var subPos = position - ((level-1)/(stepAmount+1));
			var value = stepStart + subPos*stepAmount*(stepEnd-stepStart);
			if (_this.miles) {
				value /= 0.3048; // convert to feet
				if (value > 1e4) {
					value *= 0.000189394; // convert to miles
					value = value < 100 ? value.toFixed(1) : value >> 0;
					if (value > 6050) value = 6050; // looks better
					return value+' mi';
				}
				return (value >> 0)+' ft';
			} else {
				if (value > 1e4) {
					value *= 0.001;
					value = value < 100 ? value.toFixed(1) : value >> 0;
					return value+' km';
				}
				return (value >> 0)+' m';
			}
		}
	}

	API.event.addListenerOnce( Map, 'idle', function(){
		// Shift center
		var x = 122;
		// if (w.width < 1170) x = x*(w.width/1170);
		if (w.width <= 612) x = 0;
		(function( x, y ){
			var scale = Math.pow( 2, Map.getZoom() );
			var coords = Map.getProjection().fromLatLngToPoint( Center );
			var offset = new API.Point((x/scale) || 0, (y/scale) || 0);
			var newCenter = new API.Point( coords.x-offset.x, coords.y+offset.y );
				newCenter = Map.getProjection().fromPointToLatLng( newCenter );
			Map.setCenter( newCenter );
		})( x, 50 );

		Scale.init();
	});
	API.event.addListenerOnce( Map, 'tilesloaded', function(){
		// Pointer animation
		var timer, visibility = new ElementVisibility( container, 0 );
		visibility.onshow(function(){
			clearTimeout( timer );
			showPointer();
		});
		function showPointer(){
			if (visibility.visible == false) return;
				var pointer = container.querySelector('.gmnoprint[title]');
				var $pointer = $(pointer);
			timer = setTimeout( showPointer, 2350 );
			$pointer.removeClass('pointer-pulsate');
			setTimeout(function(){
				$pointer.addClass('pointer-pulsate');
			},10);
		}
	});
}
$(document).ready(function(){
	GoogleMaps.prototype = {
		miles: false,
		mapOptions: {
			// draggable: !$.browser.mobile,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			zoom: 16,
			zoomControl: false,
			panControl: false,
			scaleControl: false,
			streetViewControl: false,
			overviewMapControl: false,
			scrollwheel: false,
			styles: mapsScheme.light
		},
		markerOptions: {
			icon: (function(){
				return new google.maps.MarkerImage(
					// 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAJFBMVEUAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAW+S7RAAAAC3RSTlMAAApFVlmXq83V8VgB9p0AAABWSURBVBjTbdDhCsAgCEbRLzU1ff/3XbExNvH+PFCowI5EPcJVCBjjCFs+Gd80V76teYg/so0HyPKXESRLAq2k8EqOqBQdNQ+b75shmlGbhbq1u+PUE15Q9ArzuYpk5gAAAABJRU5ErkJggg==',
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAMAAAC67D+PAAAAFVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAASAQCkAAAABnRSTlMAAVyAq+Y3sqfUAAAAMElEQVQI102NMRIAMBABcfj/k9Mkk1NtYQEoJxYBTtu2Q6g3gh8aeZiNq7C0NfYvDmT6AdURXIZGAAAAAElFTkSuQmCC',
					null, null,
					// new google.maps.Point( 9, 9 ),
					new google.maps.Point( 5, 5 ),
					// new google.maps.Size( 18, 18 )
					new google.maps.Size( 10, 10 )
				);
			})(),
			flat: true,
			optimized: false,
			title: '',
			visible: true
		}
	}
	$('.google-maps').each(function(){
		var API = google.maps;
		var container = this;

		var inContent = $(this).closest('.content-block').length;
		if (inContent) $(this).wrap('<div class="content-maps" />');

		var preload = new LoaderItem('google maps');
		$(window).one('loadHeavy',function(e){
			var maps = new GoogleMaps( container );
			$(container).closest('section').on('changedHeight',function(){
				API.event.trigger( maps.Map, 'resize');
			});
			API.event.addListenerOnce( maps.Map, 'tilesloaded', function(){
				preload.done();
			});
		});
	});
});



// =====================
//  Element: Fold Lists
// =====================

$('.fold-list').each(function(){
	function Item( elem ){
		var _item = this;
		var $elem = $(elem);
		var $text = $(elem).find('.text');

		this.active = false;
		this.toggleItem = function(e){
			_item.active = !$elem.hasClass('active');

			$elem.css('height', $elem.height() );
			if (_item.active) $text.show();
			runApart(function(){
				var textHeight = $text.outerHeight(true);
				var elemHeight = _item.active ? textHeight+$elem.children('h5').outerHeight() : $elem.height()-textHeight;
				// $elem.css('height', elemHeight ).toggleClass('active', _item.active ); // bad performance
				$elem.toggleClass('active', _item.active ).stop().animate({ height: elemHeight },{
					easing: 'bez_0p25,0p1,0p25,1',
					duration: 413,

					complete: function(){
						$elem.css('height','');
						if (_item.active == false) {
							$text.css('display','none');
						}
					}
				});
				$text.css({
					display: 'block',
					opacity: _item.active ? 1 : '',
					transform: _item.active ? $.browser.webkit ? 'translateZ(0)' : 'none' : ''
				}).transitEnd(function(){
					// ended
				});

				if (e === undefined) return;
				items.forEach(function( obj ){
					if (obj.active && _item != obj) obj.toggleItem();
				});
			});
		}
		$elem.on('click', this.toggleItem ).data('item', this );

		if ($elem.hasClass('active')) {
			$elem.removeClass('active');
			this.toggleItem();
		}
	}
	var $container = $(this),
		items = [],
		$items = $container.children().each(function(){
			var item = new Item( this );
			items.push( item );
		});
});



// ========================
//  Element: Widget Photos
// ========================

$('.photo-enlarge').each(function(i){
	var $img = $('img',this).centerImages();
	var $darker = $('<div class="darker" />').appendTo( this );
});
$('.photo-link').each(function(i){
	var link = this;
	var width = this.offsetWidth,
		height = this.offsetHeight;
	var canvas = createCanvas( width, height, true );
	var x = canvas.context;

	var img = this.querySelector('img');
	var anim = new MoveAnimation({ pos: 0 });
	var blur;
	$(img).onImageReady(function(){
		blur = createCanvas( img.width/2, img.height/2 );
		try {
			blur.context.drawImage( img, 0, 0, img.width/2, img.height/2 );
			stackBlurCanvasRGB( blur, 0, 0, blur.width, blur.height, 2 );
		} catch (e) {}

		link.appendChild( canvas );
		link.removeChild( img );
		renderFrame();
	});

	$(this).on('mouseenter mouseleave',function(e){
		var shown = e.type == 'mouseenter' || e.type == 'mouseover';
		var offset = shown ? 12.8 : 0;
		animateCircle( offset, 500 );
	});
	function animateCircle( offset, dur, easing, complete ){
		anim.animate( offset, dur || 700, {
			easing: easing,
			complete: complete,
			step: function( pos ){
				renderFrame();
			}
		});
	}
	function renderFrame(){
		var radius = -anim.node.pos;
		x.drawFilledImage( img, 0, 0, width, height );
		x.save();
			x.begin().arc( width/2+0.5, height/2+0.5, radius, 0, Math.PI*2, true);
			x.clip();
			x.drawFilledImage( blur, 0, 0, width, height );
			x.style('rgba(255,255,255,0.1)').fill();
		x.restore();
		var opacity = (radius/12.8)*0.35;
		x.style('rgba(0,0,0,'+opacity+')').fR(0,0,width,height);
	}
});



// =====================
//  Onscroll Animations
// =====================

function ScrollAnimation( elem ){
	var coef = $(elem).hasClass('post') ? 0.35 : undefined;
	var visibility = new ElementVisibility( elem, coef );

	var DELAY = $(elem).data('animation-delay') || 100;
	var DURATION = $(elem).data('animation-duration') || 1000;

	var effect = elem.className.match(/animation-[\w-]*/);
	if (effect == null) return;
		effect = effect[0];

	var customEffect = effect.match(/animation-icons|animation-list|animation-skills|animation-contacts/);
	if (customEffect === null) {
		var savedTransition = elem.style.transition;
		$(elem)
			// .css('transition', DURATION+'ms '+DELAY+'ms')
			.css('transition', DURATION+'ms '+DELAY+'ms')
			.css('will-change','transform, opacity'); // xxx I previously removed it for some reason
		visibility.onshow(function(){
			$(elem).removeClass( effect ).transitEnd(function(){
				elem.style.transition = savedTransition;
				elem.style.willChange = '';
				$(elem).trigger('animationCompleted');
			});
		}, true );

		return;
	} else {
		customEffect = customEffect[0];
	}

	if (effect == 'animation-contacts') {
		$(elem).addClass('hidden');
		visibility.onshow(function(){
			if (w.width <= 612) {
				return;
			} else {
				$(elem).closest('.contacts-block').addClass('opened');
			}

			var $children = $(elem).children().css({
				transform: 'translateY(20px)',
				opacity: 0
			});
			$(elem).css('transition', DURATION+'ms '+DELAY+'ms').transitEnd(function(){
				var CHILDREN_DURATION = DURATION;
				$children.css({
					transition: CHILDREN_DURATION+'ms',
					transform: '',
					opacity: ''
				});
				setTimeout(function(){
					$children.css('transition','');
				}, CHILDREN_DURATION+20 );
			}).removeClass('hidden');
		}, true );
	} else if (effect == 'animation-skills') {
		var $fills = $('.skills-fill', elem ).addClass('unfilled');
		var $percent = $('.skills-percent', elem ).addClass('hidden');
		visibility.onshow(function(){
			$fills.each(function(i){
				var delay = DELAY+i*160-100;
				$(this).css('transition', DURATION+'ms '+DELAY+'ms').removeClass('unfilled');
				$percent.eq( i ).css('transition', DURATION/2+'ms '+(delay+DURATION)+'ms').removeClass('hidden');
			});
		}, true );
	} else if (customEffect == 'animation-list') {
		var $dots = $('.devices-dot', elem ).addClass('hidden')//.addClass('hidden-pointer');
		var $icons = $('article', elem ).css('opacity', 0 );
		var effectClass = effect == 'animation-list-fadedown' ? 'animation-fadedown' : 'animation-fadeup';
			// in case of OutOfScreen it just doesn't use anywhere
		visibility.onshow(function(){
			$icons.each(function(i){
				this.savedTransition = this.style.transition;
				if (effect == 'animation-list-outofscreen') {
					var rect = this.getBoundingClientRect();
					var pos = rect.left > h.width ? 200 : -200;
					$(this).css('transform','translateX('+pos+'px)');
					$(this).css('opacity',0); // xxx
				} else {
					$(this).addClass( effectClass );
					$(this).css('opacity','');
				}
				$(this).addClass('hide-lines');
			});
			runApart(function(){
				$icons.each(function(i){
					var delay = DELAY+($icons.length-i-1)*250;
					$(this).css({
						transition: DURATION+'ms '+delay+'ms',
						transform: '',
						opacity: ''
					}).removeClass( effectClass )
				}).first().transitEnd(function(){
					$icons.each(function(){
						this.style.transition = this.savedTransition;
					});
					runApart(function(){
						$icons.addClass('animate-lines').removeClass('hide-lines');
					});
					setTimeout(function(){
						$dots.addClass('animate-lines').removeClass('hidden');
					}, 615 );
				});
			});
		}, true );
	} else if (effect == 'animation-icons-outofscreen') {
		var $icons = $(elem).children('article').css('opacity',0);
		visibility.onshow(function(){
			$icons.each(function(i){
				var rect = this.getBoundingClientRect();
				var pos = rect.left > h.width ? w.width-rect.left : -rect.right;
					pos += rect.left > h.width ? rect.left-h.width : rect.right-h.width;
				this.savedTransition = this.style.transition;
				$(this).css({
					transform: 'translateX('+pos+'px)',
					opacity: 1
				});
			});
			runApart(function(){
				$icons.each(function(i){
					i = i % 4;
					var delay = i == 0 || i == 3 ? 150 : 0;
						delay += DELAY;
					$(this).css({
						transition: DURATION+'ms '+delay+'ms',
						transform: ''
					});
				}).last().transitEnd(function(){
					$icons.each(function(){
						this.style.transition = this.savedTransition;
					});
				});
			});
		}, true );
	} else  if (customEffect == 'animation-icons') {
		var effectClass = effect == 'animation-icons-fadedown' ? 'animation-fadedown' : 'animation-fadeup';
		var $icons = $(elem).children('article');
			$icons.each(function(i){
				this.savedTransition = this.style.transition;
				var delay = i*(DURATION/4)+DELAY;
				$(this).addClass( effectClass ).css('transition', DURATION+'ms '+delay+'ms');
			});
		visibility.onshow(function(){
			$icons.removeClass( effectClass ).last().transitEnd(function(){
				$icons.each(function(){
					this.style.transition = this.savedTransition;
				});
			});
		}, true );
	}
}
$('[class*="animation-"]').each(function(){
	var anim = new ScrollAnimation( this );
});



// =======================
//  The end of core chain
// =======================

$(window).trigger('handled');