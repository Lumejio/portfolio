// ===========
//  Video API
// ===========

function VideoPlayer( options ){
	var _this = this;
	this.onload = options.onload;
	var type = this.type = options.type,
		container = options.container,
		video, player;

	if (type == 'local') {
		video = player = this.html5video = document.createElement('video');
		video.preload = 'metadata';
		video.src = video.savedSrc = getMediaSource( options.source );
		$(video).on('play', trigger.bind( null, 'playing') );
		$(video).on('pause', trigger.bind( null, 'paused') );
		$(video).on('ended', trigger.bind( null, 'ended') );
		$(video).one('loadeddata',function(){
			_this.aspectRatio = player.videoWidth/player.videoHeight;
			player.savedDuration = player.duration;
			readyHandler();
		});
		video.load();
		$(container).on('progressCheck',function(){
			var seconds = player.currentTime;
			var duration = player.duration;
			trigger('progress',[{
				seconds: seconds,
				duration: duration,
				percent: seconds/duration
			}]);
		});
	} else if (type == 'youtube') {
		var src = options.source.youtube;
		var div = document.createElement('div');
			div.id = getRandomSymbols(2)+src;
		container.append( div );
		onYoutubeReady(function(){
			player = new YT.Player( div.id, {
				videoId: src,
				playerVars: YOUTUBE_VARS,
				loop: !!options.loop,
				// width: w.width,
				// height: w.height,
				// suggestedQuality: 'hd1080',
				events: {
					onReady: function(e){
						video = player.getIframe();
						player.savedDuration = player.getDuration();
						// getYoutubeAscpectRatio( src, function( widescreen ){});

						readyHandler();
					},
					onStateChange: function(e){
						if (e.data == YT.PlayerState.BUFFERING) trigger('buffering');
						if (e.data == YT.PlayerState.PLAYING) trigger('playing');
						if (e.data == YT.PlayerState.ENDED) trigger('ended');
						if (e.data == YT.PlayerState.PAUSED) trigger('paused');
					}
				}
			});
		});
		$(container).on('progressCheck',function(){
			var seconds = player.getCurrentTime();
			var duration = player.savedDuration;
			trigger('progress',[{
				seconds: seconds,
				duration: duration,
				percent: seconds/duration
			}]);
		});
	} else if (type == 'vimeo') {
		var src = options.source.vimeo;
		video = document.createElement('iframe');
		video.id = src;
		video.src = 'http://player.vimeo.com/video/'+src+'?portrait=0&color=000000&title=0&byline=0&api=1&player_id='+src;
		(function createPlayer(){
			if ($f === undefined) return setTimeout( createPlayer, 16 ); // in case of long Frogaloop loading
			player = $f(video);
			player.addEvent('ready', function(){
				player.addEvent('play', trigger.bind( null, 'playing') );
				player.addEvent('pause', trigger.bind( null, 'paused') );
				player.addEvent('finish', trigger.bind( null, 'ended') );
				player.addEvent('playProgress', function(data) {
					trigger('progress', [data] );
				});
				player.api('getDuration',function( seconds ){
					player.savedDuration = seconds;
					readyHandler();
				});
			});
		})();
	}

	this.play = function(){
		if (!player) {
			return $(container).off('ready.play').one('ready.play', this.play.bind(this) );
		}
		if (type == 'vimeo') return player.api('play');
		if (player.getAttribute && player.getAttribute('src') === '') player.src = player.savedSrc;
		player[ type == 'local' ? 'play' : 'playVideo' ]();
			if (type == 'youtube' && $.browser.mobile) setTimeout(function(){ player.playVideo() }, 30 ); // xxx YOUTUBE PLEASE
		trigger('playing');
	}
	this.pause = function(){
		if (type == 'vimeo') return player.api('pause');
		player[ type == 'local' ? 'pause' : 'pauseVideo' ]();
	}
	this.pauseAtStart = function(){
		this.seekTo( 0 );
		this.pause();
	}
	this.stop = function(){
		clearTimeout( progressTimer );
		this.state = 'idle';
		$(container).removeClass('started').removeClass('playing');
		if (type == 'local') {
			player.src = '';
			player.load()
		} else if (type == 'youtube') {
			player.stopVideo();
			player.seekTo(0);
		} else if (type == 'vimeo') {
			player.api('unload');
		}
	}
	this.volume = function( value ){
		if (type == 'local') player.volume = value;
		if (type == 'youtube') player.setVolume( value*100 );
		if (type == 'vimeo') player.api('setVolume', value );
	}
	this.setLoop = function( flag ){
		if (!player) {
			return $(container).off('ready.setLoop').one('ready.setLoop', this.setLoop.bind(this) );
		}
		if (type == 'local') player.loop = flag ? 1 : 0;
		if (type == 'youtube') player.setLoop( flag );
		if (type == 'vimeo') player.api('setLoop', flag );	
	}
	this.seekTo = function( seconds ){
		if (type == 'local') player.currentTime = seconds;
		if (type == 'youtube') player.seekTo( seconds );
		if (type == 'vimeo') player.api('seekTo', seconds );
	}
	this.seekToRelative = function( rel ){
		_this.seekTo( _this.getDuration()*rel );
	}
	this.getDuration = function(){
		if (player.savedDuration) return player.savedDuration;
		if (type == 'local') return player.duration;
		if (type == 'youtube') return player.getDuration();
		return 0;
	}
	this.getOverlayPicture = function( callback ){
		var imageSrc;
		if (type == 'youtube') {
			var check = new Image();
				check.src = imageSrc = 'http://i1.ytimg.com/vi/'+src+'/maxresdefault.jpg';
				check.onload = function(){
					if (this.width == 120 && this.height == 90) imageSrc = 'http://i.ytimg.com/vi/'+src+'/0.jpg';
					callback( imageSrc );
				}
		} else if (type == 'vimeo') {
			getVimeoThumb( src, callback );
		} else if (type == 'local') {
			callback( container.data('overlay') || '' );
		}
	}

	container.append( video );

	var $spread = $();
	this.spreaded = !!options.spreaded;
	this.toggleSpread = function(){
		_this.spreaded = !_this.spreaded;
		updateSpread();
	}
	$(window).on('resizeEvent', updateSizes );
	$(container).one('ready', updateSizes ).on('spread', updateSizes );
	function updateSizes(){
		if (_this.spreaded) updateSpread();
		var flag = container.width() < 600;
		container.toggleClass('small-container', flag );

		var rate = container.width()/container.height();
		$spread.css('visibility', handleNum(rate) === handleNum(_this.aspectRatio) ? 'hidden' : '' );
		function handleNum( num ){
			return Math.round( num*100 );
		}
	}
	function updateSpread(){
		var scale = 1;
		if (_this.spreaded) {
			var rate = container.width()/container.height();
			scale = rate < _this.aspectRatio ? _this.aspectRatio/rate : (1/_this.aspectRatio)/(1/rate);
		}
		var transform = 'scale('+scale+')';
		if (type == 'vimeo') transform += ' translateY(-25%)';
		if (type == 'vimeo') return; // xxx
		$(video).css('transform', transform );
	}

	this.state = 'idle';
	$(container).on('playing',function(e){
		_this.state = 'started';
		$(this).addClass('started').addClass('playing');
	}).on('paused ended',function(e){
		$(this).removeClass('playing')
	}).on('ended',function(){
		$(this).removeClass('started'); // xxx
	});

	if (type == 'local' || type == 'youtube') {
		var progressTimer;
		$(container).on('playing',function(){
			(function tick(){
				$(container).trigger('progressCheck');
				clearTimeout( progressTimer );
				progressTimer = setTimeout( tick, 100 );
			})();
		}).on('paused ended',function(){
			clearTimeout( progressTimer );
		});
	}

	if (options.overlay) {
		var $videoOverlay = $('<div class="video-overlay" />').appendTo( container );
		this.overlay = new Image();
		this.getOverlayPicture(function( src ){
			_this.overlay.src = src;
			$videoOverlay.css('backgroundImage','url('+src+')');
		});
	} else {
		$(container).addClass('no-overlay');
	}
	if (options.controls) {
		var tts = VideoPlayer.timeToString;

		var $controls = $('<div class="video-controls" />').appendTo( container );
		var $bar = $('<div class="video-bar" />').appendTo( $controls );

		var $play = $('<div class="video-play" />').appendTo( $controls );
		var $pause = $('<div class="video-pause" />').appendTo( $controls );
		$play.on('click', this.play ).exclusiveClick();
		$pause.on('click', this.pause ).exclusiveClick();
		
		var $progress = $('<div class="video-progress"><div class="strip"></div></div>').appendTo( $bar );
		var $time = $('<div class="video-time">0:00 | 0:00</div>').appendTo( $bar );
		$(container).on('ready',function(){
			$time.text( '0:00 | ' + tts(player.savedDuration) );
		}).on('progress',function(e,data){
			$time.text( tts(data.seconds) + ' | ' + tts(data.duration) );

			if (dragPointer) return;
			var pos = data.percent*100-100;
			$progress.children('.strip').css('transform','translateX('+pos+'%)');
				pos = data.percent*$progress.width();
			$pointer.css('transform','translateX('+pos+'px)');
		});
		
		var $pointer = $('<div class="video-pointer grab-cursor"><div class="flesh"></div></div>').appendTo( $bar );
		var $pointerTime = $('<div class="video-pointer-time">00:00</div>').appendTo( $pointer );
		var dragPointer = false;
		$pointer.on('mousedown touchstart',function(e){
			if (e.type == 'mousedown' && e.which != 1) return;
			var touch = e.type == 'touchstart';
			e.stopPropagation();
	
			dragPointer = true;
			$(container).addClass('drag-pointer');
			if ($overlay) $overlay.show();

			var barLeft = $progress.offset().left-7,
				barWidth = $progress.width();
			var pos, rel, prev = null;

			var pX = touch ? e.originalEvent.touches[0].pageX : e.pageX;
			pos = Math.min( barWidth, Math.max( 0, pX-barLeft ));
			rel = pos/barWidth;
			$pointerTime.text( tts( _this.getDuration()*rel ) );

			e.preventDefault();

			$(window).on('mousemove.pointer touchmove.pointer',function(e){
				var pX = touch ? e.originalEvent.touches[0].pageX : e.pageX;
				pos = Math.min( barWidth, Math.max( 0, pX-barLeft ));
				rel = pos/barWidth;
				$pointer.css('transform','translateX('+pos+'px)');
				$progress.children('.strip').css('transform','translateX('+(rel*100-100)+'%)');

				$pointer.toggleClass('reversed', prev !== null && pos > prev );
				prev = pos;

				$pointerTime.text( tts( _this.getDuration()*rel ) );

				e.preventDefault();
			}).one('mouseup.pointer touchend.pointer',function(e){
				_this.seekToRelative( rel );

				setTimeout(function(){
					dragPointer = false;
					// prevents pointer blink
				}, 20 );
				$(container).removeClass('drag-pointer');
				if ($overlay) $overlay.hide();
				$(window).off('mousemove.pointer').off('touchmove.pointer');
				$pointer.removeClass('reversed');
			});

			clearTimeout( hiddenTimer ); // xxx
		});

		var $volume = $('<div class="video-volume" />').appendTo( $bar );
		var $volumeMinus = $('<span class="volume-minus">-</span>').appendTo( $volume );
		var $volumeCanvas = $('<canvas width="0" height="0" />').appendTo( $volume );
		var $volumePlus = $('<span class="volume-plus">+</span>').appendTo( $volume );
		;(function(){
			var volume = 1;
			$(container).on('ready',function(e){
				_this.volume( volume );
			});

			var canvas = $volumeCanvas[0];
			var ctx = canvas.getContext('2d');
			var styles = getComputedStyle( canvas );
			ctx.font = styles.font;
			var width, height;
			setTimeout(function(){
				width = ctx.measureText('VOLUME').width;
				height = $volume.height();
				canvas.setDimensions( width, height, false, true );
				// xxx
				ctx.fillStyle = styles.color;
				ctx.textBaseline = 'middle';
				ctx.textAlign = 'center';
				ctx.fillText('VOLUME', width/2, height/2 );
			}, 100 );

			function update( drawWidth ){
				volume = drawWidth/$volumeCanvas.width();
				volume = Math.max( 0, Math.min( 1, volume ));
				_this.volume( volume );

				drawWidth = Math.round( drawWidth );
				ctx.clearRect( 0, 0, width, height );

				ctx.save();
				ctx.beginPath();
				ctx.rect(0,0,drawWidth,height);
				ctx.clip();
				ctx.fillText('VOLUME', width/2, height/2 );
				ctx.restore();

				ctx.save();
				ctx.beginPath();
				ctx.rect(drawWidth,0,width-drawWidth,height);
				ctx.clip();
				ctx.fillStyle = 'red';
				ctx.fillText('VOLUME', width/2, height/2 );
				ctx.restore();
			}

			$volumeCanvas.on('mousedown touchstart',function(e){
				if (e.type == 'mousedown' && e.which != 1) return;
				var touch = e.type == 'touchstart';
				e.stopPropagation();
				$anim.stop();

				var left = $volumeCanvas.offset().left,
					width = $volumeCanvas.width();
				var pX = touch ? e.originalEvent.touches[0].pageX : e.pageX;
				var pos = Math.min( width, Math.max( 0, pX-left ));
				var rel = pos/width;

				update( pos );

				e.preventDefault();

				$(window).on('mousemove.pointer touchmove.pointer',function(e){
					var pX = touch ? e.originalEvent.touches[0].pageX : e.pageX;
					pos = Math.min( width, Math.max( 0, pX-left ));
					rel = pos/width;

					update( pos );

					e.preventDefault();
				}).one('mouseup.pointer touchend.pointer',function(e){
					$(window).off('mousemove.pointer').off('touchmove.pointer')
						.off('mouseup.pointer').off('touchend.pointer');
				});
			});

			var $anim = $('<div />');
			var timer = null;
			$volumeMinus.add( $volumePlus ).on('mousedown touchstart',function(e){
				if (e.type == 'mousedown' && e.which != 1) return;
				e.stopPropagation();
				e.preventDefault();
				$anim.stop();
				
				var dir = $(this).is( $volumeMinus ) ? -0.02 : 0.02;

				var time = getTime();
				;(function tick(){
					update( (volume+dir)*$volumeCanvas.width() );
					timer = setTimeout( tick, 40 );
				})();

				$(window).one('mouseup touchend',function(e){
					clearTimeout( timer );
					if (getTime() - time > 180) return;
					var w = $volumeCanvas.width();
					$anim.stop().css('left', volume*w ).animate({ left: (volume+dir*6)*w },{
						duration: 200,
						step: function(now,fx){
							update( now );
						}
					});
				});
			});
		})();

			$spread = $('<div class="video-spread" />').appendTo( $controls );
			$spread.on('click', _this.toggleSpread ).exclusiveClick();
		if (type == 'vimeo') $spread.hide(); // xxx

		var $fullscreen = $('<div class="video-fullscreen" />').appendTo( $controls );
		if ($.browser.donkey) $fullscreen.hide();
			$fullscreen.on('click',function(e){
				if (Fullscreen.check()) {
					Fullscreen.cancel();
				} else {
					$(container).find('iframe, video, .video-overlay').css({
						transition: 'none',
						opacity: 0
					});
					
					Fullscreen.request( container[0] );

					setTimeout(function(){
						$(container).find('iframe, video, .video-overlay').css({
							transition: '',
							opacity: ''
						});	
					}, 100 );
				}

				e.preventDefault();
				e.stopPropagation();
			}).exclusiveClick();

		var hiddenTimer = null;
		$(container).on('mousemove touchstart touchend playing',function(e){
			clearTimeout( hiddenTimer );
			$(this).removeClass('hidden-elements');
			if ($(this).hasClass('playing') == false && e.type != 'playing') return;

			hiddenTimer = setTimeout(function(){
				$(container).addClass('hidden-elements');
			}, 3000 );
		});
	}

	function readyHandler(){
		if (_this.onload) _this.onload();
		$(container).trigger('ready').data('videoplayer', _this );
	}
	function trigger( eventName, args ){
		container.trigger( eventName, args );
	}
}
VideoPlayer.prototype = {
	aspectRatio: 16/9
}
VideoPlayer.timeToString = function( input ){
	var min = Math.floor( input / 60 );
		min = min < 10 ? '0'+min : min;
	var sec = Math.floor( input - min * 60 );
		sec = sec < 10 ? '0'+sec : sec;
	var output = min + ':' + sec;
	return output;
}



// ===================
//  Detect video type
// ===================

var canPlayMPEG, canPlayOGG, canPlayWebM;
(function(){
	var video = document.createElement('video');
	canPlayMPEG = video.canPlayType('video/mpeg') != '';
	canPlayWebM = video.canPlayType('video/webm') != '';
	canPlayOGG = video.canPlayType('video/ogg') != '';
})();
function getMediaTypeByClass( container ) {
	return container.className.match(/youtube|local|vimeo/)[0];
}
function getMediaSource( video ) { // or just an object
	var src, sources;
	if (typeof video == 'object') {
		sources = video;
	} else {
		sources = {
			webm: video.getAttribute('data-webm'),
			mp4: video.getAttribute('data-mp4'),
			ogv: video.getAttribute('data-ogv')
		}
	}

	// Chosing by priority and existence
	// Priority: WebM -> OGV -> mp4
	if (canPlayOGG) { src = sources.ogv || sources.mp4; } else { src = sources.mp4; }
	if (canPlayWebM) src = sources.webm || src;
	return src+'?nocache='+getRandomSymbols(5);
	return src;
}



// ================
//  Vimeo features
// ================

function getVimeoThumb( id, callback, arg ) {
	$.ajax({
		type: 'GET',
		url: 'http://vimeo.com/api/v2/video/' + id + '.json',
		jsonp: 'callback',
		dataType: 'jsonp',
		success: function(data) {
			var thumbnail_src = data[0].thumbnail_large;
			callback( thumbnail_src, arg );
		}
	});
}



// ==================
//  YouTube features
// ==================

var YOUTUBE_VARS = {
	controls: 0,
	showinfo: 0,
	modestbranding: 1,
	wmode: 'opaque',
	html5: 1,
	rel: 0,
	iv_load_policy: 3,
	// suggestedQuality: 'hd1080',
	origin: location.origin
}

var YoutubeAPILoaded = false;
appendScript('//www.youtube.com/iframe_api');

function appendScript( source ){
	var tag = document.createElement('script');
		tag.src = source;
	var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
function onYouTubeIframeAPIReady() {
	YoutubeAPILoaded = true;
	$(window).trigger('YoutubeAPILoaded');
}
function onYoutubeReady( func ) {
	if (YoutubeAPILoaded) return func();
	$(window).one('YoutubeAPILoaded',function(){
		func();
	});
}
function getYoutubeAscpectRatio( videoId, callback ){
	return callback( true );
	// No longer available :(
	window['getYoutubeData'+videoId] = function( obj ) {
		callback( obj.data.aspectRatio == 'widescreen' );
	}
	appendScript('http://gdata.youtube.com/feeds/api/videos/'+videoId+'?v=2&alt=jsonc&callback=getYoutubeData'+videoId);
}

$('.video').each(function(i){
	var dataAttr = $(this).data();
	if (dataAttr.width) $(this).css('width',dataAttr.width);
	if (dataAttr.height) $(this).css('height',dataAttr.height);
});