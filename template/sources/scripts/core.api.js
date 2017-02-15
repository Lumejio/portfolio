// ==============
//  Common stuff
// ==============

function runApart( func ) {
	return setTimeout(func,0);
}

function getTime() {
	if (!window.performance) return Date.now ? Date.now() : new Date().getTime();
	if (window.performance.webkitNow) return window.performance.webkitNow();
	return window.performance.now ? window.performance.now() : new Date().getTime();
}

function getRandomSymbols( length ){
	return Math.random().toString(36).substr(2, length);
}

function isExternal( url ) {
	var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
	if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
	if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
	return false;
}

function slowIteration( num, step, coef ) {
	var result = 0, multiple = 1;
	while (num > 0) {
		num -= step;
		result += Math.min( step+num, step )*multiple;
		multiple *= coef;
	}
	return result;
}

Array.prototype.last = function(){
	return this instanceof Array ? this[this.length - 1] : null;
};
Array.prototype.executeFunctions = function(){
	return this.forEach(function(func){
		if (typeof func == 'function') func();
	});
}

HTMLImageElement.prototype.checkTaint = function(){
	this.tainted = this.tainted === undefined ? true : this.tainted;
	var canvas = createCanvas(1,1);
		canvas.context.drawImage( this, 0, 0 );
	try {
		var a = canvas.context.getImageData(0,0,1,1);
		this.tainted = false;
	} catch(e) {
		return e.code == 18;
	}
}

function FakeImage( src ){
	var image = new Image();
		image.fakeSrc = src;
	return image;
}
HTMLImageElement.prototype.fakeLoad = function(){
	this.src = this.fakeSrc;
}
$.fn.fakeLoad = function(){
	this.each(function(){
		if (this.fakeLoad) this.fakeLoad();
	});
}

$.fn.onImageReady = function( func ){
	var img = this[0];
	if (img.fakeSrc) {
		if (img.fakeSrc === img.src && img.complete) {
			func.call( img );
		} else {
			$(img).on('load', func );
		}
	} else {
		if (img.complete) return func.call( img );
		$(img).on('load', func );
		if ($.browser.donkeyNine) img.src = $(img).attr('src');
	}
}
$.fn.onMultiImagesReady = function( func ){
	var $imgs = this;
	var loaded = 0;
	$imgs.each(function(){
		$(this).onImageReady(function(){
			if (++loaded == $imgs.length) func(); 
		});
	});
}
$.fn.centerImages = function( parentWidth, parentHeight ){
	this.each(function(i){
		var img = this;
		$(img).onImageReady(function(){
			var imageWidth = img.naturalWidth || img.offsetWidth;
			var imageHeight = img.naturalHeight || img.offsetHeight;
			if (!img.offsetParent) return;
				parentWidth = parentWidth || img.offsetParent.offsetWidth;
				parentHeight = parentHeight || img.offsetParent.offsetHeight;

			var horz = imageWidth/imageHeight > parentWidth/parentHeight;
			var ratio = horz ? imageHeight/parentHeight : imageWidth/parentWidth;
			var sy = 0.5, sx = 0.5;
			if (img.crop) {
				sy = (+img.crop[1]+1)/2;
				sx = (+img.crop[0]+1)/2;
			}
			var prop = {
				width: horz ? 'auto' : '100%',
				height: horz ? '100%' : 'auto',
				marginTop: horz ? 0 : (parentHeight-imageHeight/ratio)*sy,
				marginLeft: horz ? (parentWidth-imageWidth/ratio)*sx : 0
			};
			if (imageWidth/imageHeight === parentWidth/parentHeight) {
				prop.marginTop = '';
				prop.marginLeft = '';
			}
			$(img).css( prop );
		});
	});
}

function getOffsetTop( node, value ){
	value = value || 0;
	if (node == document.body || !node || !node.offsetParent) return value;
	return getOffsetTop( node.offsetParent, value+node.offsetTop );
}
$.fn.getOffsetTop = function(){
	return getOffsetTop( this[0] );
}

$.fn.exclusiveClick = function(){
	return $(this).on('mousedown',function(e){
		e.stopPropagation();
	});
}



// =========================
//  Custom stylesheet rules
// =========================

var stylesheet = document.createElement('style');
	stylesheet.saved = 0;
document.head.appendChild( stylesheet );
function addRules( rules, optional ) {
	var index = stylesheet.saved++;
	if (optional) return stylesheet.sheet.insertRule( rules+' {'+optional+'}', index );
	for (var key in rules) stylesheet.sheet.insertRule( key+' {'+rules[key]+'}', index );
}



// ===============
//  Resize events
// ===============

window.ws = { width: 0, height: 0 }
$(window).on('resize',function(){
	window.w = {
		width: $(window).width(),
		height: $(window).height()
	};
	window.h = {
		width: w.width/2,
		height: w.height/2
	};
	if (w.width == ws.width && w.height == ws.height) return; // there wasn't really 'resize'
	if (w.width != ws.width) $(window).trigger('resizeWidth');
	if (w.height != ws.height) $(window).trigger('resizeHeight');
	$(window).trigger('resizeEvent');
	ws = w;
}).trigger('resize').on('resizeEvent',function(e){
	if (ws.width >= 1170 && w.width >= 1170) return $(window).trigger('resizeWide');
	if (ws.width === w.width) return;
	$(window).trigger('resizeResponsive');
});



// =======================================
//  All these prefixes and browser things
// =======================================

$.browser = {
	webkit: /WebKit/i.test(navigator.userAgent),
	mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
	donkey: /Trident/.test(navigator.userAgent),
	donkeyTen: /MSIE 10/.test(navigator.userAgent),
	donkeyNine: /MSIE 9/.test(navigator.userAgent)
}
$.platform = {
	mac: navigator.platform.toLowerCase().indexOf('mac') > -1
}

var pt = document.documentElement.style;
$.extend( $.support, {
	transform3d: !!prefixMethod( pt, 'TransformOriginZ' ),
	transition: prefixMethod( pt, 'Transition' ),
	transform: prefixMethod( pt, 'Transform' ),
	flexBoxNew: !!prefixMethod( pt, 'FlexBasis' ),
	flexBoxOld: !!prefixMethod( pt, 'BoxDirection' ),
	flexBoxStupid: !!prefixMethod( pt, 'FlexAlign' ),
	transitionEnd: 'transitionend webkitTransitionEnd otransitionend'
});

if (!location.origin) location.origin = location.protocol+'//'+location.host;

if ($.browser.mobile) $(document.body).addClass('mobile');
if ($.browser.donkey) $(document.body).addClass('browser-ie');

if (!$.support.transition) $(document.body).addClass('no-transition');

$.support.flexBox = $.support.flexBoxNew || $.support.flexBoxOld || $.support.flexBoxStupid || false;
if (!$.support.flexBox) $(document.body).addClass('no-flexbox');

$.support.pointerEvents = $.browser.donkeyNine || $.browser.donkeyTen ? false
	: ('pointer-events' in document.documentElement.style);
if ($.support.pointerEvents == false) $(document.body).addClass('no-pointer-events');

var Fullscreen = {
	// todo: remake it using `prefixMethod`
	request: function(elem) {
		if (elem.requestFullscreen) {
			return elem.requestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			return elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			return elem.webkitRequestFullscreen();
		}
		return false;
	},
	check: function(){
		return ((document.fullscreenElement && document.fullscreenElement !== null) ||
			document.mozFullScreen || document.webkitIsFullScreen);
	},
	cancel: function(){
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
}

function prefixMethod( obj, method, returnOnly ) {
	var pfx = ['webkit', 'moz', 'ms', 'o', ''];
	var p = -1, m, t;
	while (++p < pfx.length && !obj[m]) {
		m = method;
		if (pfx[p] == '') m = m.substr(0,1).toLowerCase() + m.substr(1);
		m = pfx[p] + m;
		t = typeof obj[m];
		if (t != 'undefined') {
			pfx = [pfx[p]];
			return returnOnly ? obj[m] : t == 'function' ? obj[m]() : m;
		}
	}
}



// ===========
//  Animation
// ===========

window.canRequestAnimationFrame = !!prefixMethod( window, 'RequestAnimationFrame', true );
window.requestAnimationFrame = prefixMethod( window, 'RequestAnimationFrame', true ) || function(func){
	return setTimeout(func,0.01);
}
window.cancelAnimationFrame = prefixMethod( window, 'CancelAnimationFrame', true ) || prefixMethod( window, 'CancelRequestAnimationFrame', true ) || function(id){
	return clearTimeout(id);
};

$.fn.getTranslate = function() {
	var trans = $(this).css('transform');
	if (trans == 'none') return { X: 0, Y: 0 }
	var is3D = trans.substr(6,2) == '3d';
	trans = trans.split(/(\)|\()/)[2].split(',');
	return {
		X: is3D ? +trans[12] : +trans[4],
		Y: is3D ? +trans[13] : +trans[5]
	}
}
$.cssHooks.transform3d = {
	get: function( elem, computed, extra ) {
		return $(elem).css('transform');
	},
	set: function( elem, value ) {
		elem.style[ $.support.transform ] = value + ($.browser.webkit ? ' translateZ(0)' : '');
	}
};

$.fn.cssAnim = function( obj, duration ){
	if ($.support.transition) return this.css( obj );
	this.stop().animate( obj, duration||500 );
}

$.fn.anim = function( opts, duration, step ){ // 'opts' can be 'value'
	if (typeof opts == 'number') opts = {
		value: opts,
		duration: duration,
		step: step
	}
	var animProperty = {}
		animProperty[ opts.property || 'borderSpacing'] = opts.value;
	var animOptions = {
		duration: opts.duration || 500,
		step: opts.step
	}
	$(this).stop().animate( animProperty, animOptions );
}

$.fn.transitOff = function(){
	var node = this;
	var eventName = $.support.transitionEnd;
		eventName.split(' ').forEach(function( prefixedName ){
			node.off(prefixedName);
		});
	return node;
}
$.fn.transitEnd = function( func, namespace, prop, allowChild ){
	if (!$.support.transition) return setTimeout(function(){
		func.call( this );
	}.bind(this), 20 ), this;

	namespace = namespace || 'fn';
	var node = this,
		eventName = $.support.transitionEnd;
	return this.off(eventName).on(eventName,function(e){
		if (!allowChild && e.originalEvent.target != node[0]) return;
		if (prop && e.originalEvent.propertyName != prop) return;
		$(this).off(eventName);
		func.call( this );
	});
}

var MoveAnimation = function( node, isHorizontal ){
	var _anim = this,
		initTime, time, startValue, difference,
		progress = 0, delay = 1000/60, current = {};
	_anim.node = node;
	var notAttached = node.hasOwnProperty('pos');
	_anim.isHorizontal = isHorizontal;
	_anim.clear = function(){
		if (_anim.updateData === null) return;
		window[ canRequestAnimationFrame ? 'cancelAnimationFrame' : 'clearTimeout' ]( _anim.updateData );
		_anim.updateData = null;
	}
	_anim.getCurrentValue = function(){
		if (notAttached) return node.pos;
		if (_anim.usePhysical) {
			// return parseInt( $(node).css( isHorizontal ? 'left' : 'top' ), 10 );
			return node[ isHorizontal ? 'offsetLeft' : 'offsetTop' ]();
		}
		return $(node).getTranslate()[ isHorizontal ? 'X' : 'Y' ];
	}
	_anim.animate = function( value, duration, options ) {
		_anim.clear();
		current.value = value;
		current.duration = duration;
		current.options = options || {};
		progress = 0;
		time = delay;
		initTime = getTime();
		startValue = -_anim.getCurrentValue();
		difference = (value - startValue);// >> 0;
		_anim.updateData = requestAnimationFrame( animationStep );
	}
	function animationStep(){
		progress = getTime() - initTime;
		updateElementPosition();
		if (progress > time) {
			time = progress+delay-(progress-time);
			if (time < progress+1) time = progress+1;
		}
		if (time < current.duration) _anim.updateData = requestAnimationFrame( animationStep );
		if (time > current.duration) {
			time = current.duration;
			_anim.updateData = requestAnimationFrame( updateElementPosition );
		}
	}
	function updateElementPosition(){
		var valueAtPosition = -MoveAnimation.easing[ current.options.easing || 'mcsEaseOut' ]( time, startValue, difference, current.duration );
		if (current.options.modifyValue) valueAtPosition = current.options.modifyValue( valueAtPosition );
		if (current.options.disableSubpixelsOnIdle && time >= current.duration) valueAtPosition = Math.round( valueAtPosition );
		if (notAttached) {
			node.pos = valueAtPosition;
		} else {
			var prop = current.options.useZ ? 'transform3d' : 'transform';
			if (_anim.usePhysical) {
				$(node).css( isHorizontal ? 'left' : 'top', valueAtPosition );
			} else {
				$(node).css( prop,'translate'+(isHorizontal ? 'X' : 'Y')+'('+valueAtPosition+'px)');
			}
		}
		if (current.options.step) current.options.step( valueAtPosition, time / current.duration );
		var checkComplete = current.options.dontRound
			? time >= current.duration
			: current.value == -Math.round(valueAtPosition);
		if (current.options.complete && checkComplete) {
			_anim.clear;
			time = current.duration;
			current.options.complete();
		}
	}
}
MoveAnimation.easing = { // t,b,c,d means time, init, difference, duration
	linear: function(t,b,c,d){
		return c*t/d + b;
	},
	easeOutCirc: function(t,b,c,d){
		t /= d; t--;
		return c * Math.sqrt(1 - t*t) + b;
	},
	easeInOutCirc: function (t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInOutSine: function (t,b,c,d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (t,b,c,d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	mcsEaseOut: function(t,b,c,d){
		var ts=(t/=d)*t,tc=ts*t;
		return b+c*(0.499999999999997*tc*ts + -2.5*ts*ts + 5.5*tc + -6.5*ts + 4*t);	
	},
	draggerRailEase: function(t,b,c,d){
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	},
	elastic: function(t,b,c,d){
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	back: function(t,b,c,d){
		var s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	ease: bezierEasing([0.25,0.1,0.25,1]),
	'ease-in': bezierEasing([0.42,0,1,1]),
	'ease-out': bezierEasing([0,0,0.58,1]),
	backBezier: bezierEasing([0.42,0,0.22,1.2])
}
if (!$.support.transition) $.easing.swing = $.easing['bez_0p25,0p1,0p25,1'];

function singleAnimation( opts ){
	opts = $.extend({
		position: 1,
		duration: 700,
		easing: 'ease',
		step: function(){},
		complete: function(){}
	}, opts );
	var anim = new MoveAnimation({ pos: 0 });
		anim.animate( opts.position, opts.duration, {
			dontRound: true,
			easing: opts.easing,
			step: opts.step,
			complete: opts.complete
		});
	return undefined;
}

function ease( value, easing ){
	value = Math.min( 1, Math.max( value, 0 ) );
	return MoveAnimation.easing[ easing || 'ease' ]( value, 0, 1, 1 );
}



// ========
//  Canvas
// ========

// Aliases
var CanvasProto = HTMLCanvasElement.prototype;
var CanvasContextProto = CanvasRenderingContext2D.prototype;

var dPR = (function(){
	var tempContext = document.createElement('canvas').getContext('2d');
	var backingStore = tempContext.backingStorePixelRatio ||
			tempContext.webkitBackingStorePixelRatio ||
			tempContext.mozBackingStorePixelRatio ||
			tempContext.msBackingStorePixelRatio ||
			tempContext.oBackingStorePixelRatio ||
			tempContext.backingStorePixelRatio || 1;
	return Math.max( (window.devicePixelRatio || 1) / backingStore, 1 );
})();

function handleContext( action, x, y, w, h, a, b ) {
	this[ action ]( x, y, w, h, a, b );
	return this;
}
CanvasContextProto.ratio = 1;
CanvasContextProto.clearCanvas = function(){
	return handleContext.call( this, 'clearRect', 0, 0, this.canvas.width, this.canvas.height );
}
CanvasContextProto.R = function( x, y, w, h ) {
	return handleContext.call( this, 'rect', x, y, w||1, h||1 );
}
CanvasContextProto.fR = function( x, y, w, h ) {
	return handleContext.call( this, 'fillRect', x, y, w||1, h||1 );
}
CanvasContextProto.cR = function( x, y, w, h ) {
	return handleContext.call( this, 'clearRect', x, y, w||1, h||1 );
}
CanvasContextProto.move = function( x, y ) {
	return handleContext.call( this, 'moveTo', x, y );
}
CanvasContextProto.line = function( x, y ) {
	return handleContext.call( this, 'lineTo', x, y );
}
/*CanvasContextProto.sc = function( x, y ) {
	return handleContext.call( this, 'scale', x, y );
}*/
CanvasContextProto.trans = function( x, y ) {
	return handleContext.call( this, 'translate', x, y );
}
CanvasContextProto.bezier = function( x1, y1, x2, y2, x, y ) {
	return handleContext.call( this, 'bezierCurveTo', x1, y1, x2, y2, x, y );
}
CanvasContextProto.begin = function(){
	this.beginPath();
	return this;
}
CanvasContextProto.close = function(){
	this.closePath();
	return this;
}
CanvasContextProto.style = function( color, type ) {
	this[ (type||'fill') + 'Style'] = color || 'black';
	return this;
}
CanvasContextProto.drawArc = function(x, y, r, fill) {
	this.begin().arc(x, y, r, 0, Math.PI*2, true); 
	this.close()[ fill ? 'fill' : 'stroke']();
	return this;
}
CanvasContextProto.text = function( text, x, y ) {
	this.fillText( text, x, y );
	return this;
}
CanvasContextProto.drawFilledImage = function( img, x, y, w, h, clip ){
	var width = img.naturalWidth || img.videoWidth || img.width || img.offsetWidth;
	var height = img.naturalHeight || img.videoHeight || img.height || img.offsetHeight;
	var horz = w/h < width/height;
	if (horz) {
		var sh = height;
		var sw = (height/width)/(h/w)*width;
	} else {
		var sw = width;
		var sh = (width/height)/(w/h)*height;
	}
	var sx = -(sw-width)/2;
	var sy = -(sh-height)/2;
	if (img.crop) {
		sx *= +img.crop[0]+1;
		sy *= +img.crop[1]+1;
	}
	if (clip) {
		sx += clip.x*(sw/w);
		sy += clip.y*(sh/h);
		sw *= clip.w/w;
		sh *= clip.h/h;
		w = clip.w;
		h = clip.h;
	}
	try {
		this.drawImage( img, sx, sy, sw, sh, x, y, w, h );
	} catch(e) {
		// console.log( e );
	}
	return this;
}
CanvasContextProto.disableSmooth = function(){
	this.imageSmoothingEnabled = false;
	this.msImageSmoothingEnabled = false;
	this.mozImageSmoothingEnabled = false;
	this.webkitImageSmoothingEnabled = false;
}
CanvasProto.setDimensions = function( w, h, saveColors, retina ) {
	var ctx, fill, stroke;
	saveColors = saveColors || true;

	ctx = this.getContext('2d');

	if (saveColors) {
		fill = ctx.fillStyle;
		stroke = ctx.strokeStyle;
	}

	ctx.retina = this.retina = !!retina;
	if (w) {
		this.style.width = w+'px';
		if (retina) w *= dPR;
		this.width = w;
	}
	if (h) {
		this.style.height = h+'px';
		if (retina) h *= dPR;
		this.height = h;
	}
	if (retina) ctx.scale(dPR,dPR);
	ctx.scale( ctx.ratio, ctx.ratio );
	
	if (saveColors) {
		ctx = this.getContext('2d');
		ctx.fillStyle = fill;
		ctx.strokeStyle = stroke;
	}
}
CanvasProto.setIconDimensions = function( w, h, saveColors ) {
	var ctx = this.getContext('2d');
	var size = parseInt( getComputedStyle( this ).fontSize );
	var ratio = ctx.ratio = size/h;
	w = Math.ceil(w*ratio);
	h = Math.ceil(h*ratio);
	this.setDimensions( w, h, saveColors, true );
	this.parentNode.style.width = w+'px';
	this.parentNode.style.height = h+'px';
}

function createCanvas( width, height, retina ){
	var canvas = document.createElement('canvas');
		canvas.setDimensions( width || 1, height || 1, false, retina );
		canvas.context = canvas.getContext('2d');
	return canvas;
}



// ====================
//  Google Maps Styles
// ====================

var mapsScheme = {
	dark: [{"featureType":"all","elementType":"all","stylers":[{"saturation":-100},{"gamma":0.2},{"lightness":-60}]},
		{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#666666"}]},
		{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#353535"}]},
		{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#808080"}]}
	],
	light: [
		{ stylers: [ { saturation: -100 }, { lightness: 25 }, { gamma: 0.85 } ] },
		{ featureType: "road", elementType: "labels.text.stroke", stylers: [ { color: "#ffffff" } ]}
	]
}