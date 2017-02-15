;(function(){
	// Main animations
	setTimeout(function(){
		$('.main .house').css('stroke-dasharray','0');
	});
})();

;(function(){
	var $background = $('.background-hover');
	var $drop = $('.drop');
	$(document).on('mouseover mouseout','.that-hover',function(e){
		var isOver = e.type == 'mouseover' || e.type == 'mouseenter';

		// $background.css('backgroundColor', isOver ? '#' );
		$background.css('opacity', isOver ? 1 : 0 );

		$(this).add($drop).toggleClass('white-important', isOver );
	});
})();

;(function(){
	// Drop movements

	var $container = $('.perspective-container'),
		$drop = $container.children('.drop'),
		$points = $('.drop-anchor, .drop-move'),
		$colorPoints = $('[data-drop]'),

		currIndex = -1,
		nextColor = null,

		pointIndex = -1,

		anim = new SingleAnimation;

	$(window).on('scrollEvent',function(e){
		var pos = Scroll.realPos + w.height*0.35;
		var scrollPos = pos;
		var index = -1;
		$colorPoints.each(function(i){
			var offsetTop = getOffsetTop( this );
			if (pos > offsetTop) index = i;
		});

		var nextColor = (function(){
			if (index == -1) return '#9ef3df';

			var $color = $colorPoints.eq(index);
			return $color.data('drop');
		})();

		if (index != currIndex) {
			currIndex = index;

			$drop.css('fill', nextColor );
		} else {
			//
		}

		// Drop position animation

			index = -1;
		$points.each(function(i){
			var offset = parseInt( $(this).data('drop-offset') ) || 0;
			var offsetTop = $(this).getOffsetTop()-offset;
			if (pos > offsetTop) index = i;
		});

		var nextPos = (function(){
			if (index == -1) return 0;

			var $elem = $points.eq(index);
			var offset = parseInt( $elem.data('drop-offset') ) || 0;
			var got = $elem.getOffsetTop();
			var pos = got - offset - 295;
			var minPos = pos;

			if ($elem.hasClass('drop-move')) {
				var diff = (w.height-565)/2;
				var botOffset = parseInt( $elem.data('drop-over') ) || 0;
				pos = scrollPos - offset - 295 - diff;
				pos = Math.min( Math.max( minPos, pos ), got + $elem.height() - w.height + botOffset );
			}

			return pos;
		})();

		if (index != pointIndex) {
			pointIndex = index;
			TweenMax.to( $container, 0.6, { y: nextPos });
		} else {
			TweenMax.to( $container, 0.3, { y: nextPos });
		}
	});
})();

;(function(){
	// Background color changing

	var $colorElements = $('[data-color]'),
		$backgroundElement = $('.background-element'),

		currIndex = -1,
		currColor = '#ffffff',
		nextColor = '#ffffff',

		anim = new SingleAnimation;

	$(window).on('scrollEvent',function(e){
		var pos = Scroll.realPos + w.height*0.35;
		var index = -1;
		$colorElements.each(function(i){
			if (pos > getOffsetTop(this) ) index = i;
		});

		nextColor = (function(){
			if (index == -1) return '#ffffff';

			var $color = $colorElements.eq(index);
			var data = $color.data('color').split(',');
			if (data.length == 0) {
				return data[0];
			} else {
				var rel = (pos-$color.getOffsetTop())/$color[0].offsetHeight;
				return $.Color( data[0] ).transition( data[1], rel ).toHexString();
			}
		})();

		if (index != currIndex) {
			currIndex = index;

			var startColor = currColor;
			anim.animate( 0.5, function( rel ){
				currColor = $.Color( startColor ).transition( nextColor, rel ).toHexString();
				$backgroundElement.css('backgroundColor', currColor );
			});
		} else {
			if (!anim.animating) $backgroundElement.css('backgroundColor', currColor = nextColor );
		}
		
	});
})();






$('select').chosen({
	// width: '205px',
	width: '185px',
	no_results_text: 'Не найдено города'
});




function initMaps(){
	$('.google-maps').each(function(i){
		var map = new google.maps.Map( this, {
	        center: {lat: -34.397, lng: 150.644},
	        zoom: 8,
	        streetViewControl: false,
	        scrollwheel: false
        });
	});
}





function wtf(){
	var layer = document.querySelector('.layer-0')
	var blur = document.querySelector('#blur > *')
	$(layer).animate({ borderSpacing: 1 },{
		duration: 1900,
		easing: 'easeOutQuint',
		step: function(now,fx){
			var pos = 1000+fx.pos*-1000;
			layer.style.transform = 'translateX('+-pos+'px)';

			var finalPos = Math.max(fx.pos-0.8,0)/0.2;
			var value = 35-finalPos*35;
			if (value < 0.01) value = 0;
			blur.setAttribute('stdDeviation', value+', 0' );
		}
	});
}
window.onclick = function(){
	// wtf();
}