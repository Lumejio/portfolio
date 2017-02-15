$('.wrapper').addClass('will-change');
$(window).load(function() {
    $('.preloader').fadeOut(500);
    $('.wrapper').css('opacity', 1).removeClass('will-change');
    $(window).trigger('siteready');
});

$('input[name="phone"]').mask("+7 (999) 99-99-99?9");

// Common functions

function getRandomString(){
	return (+new Date).toString(36).substr(2);
}

function getFullOffsetTop( node, value ){
	value = value || 0;
	if (node == document.body || !node || !node.offsetParent) return value;
	return getFullOffsetTop( node.offsetParent, value+node.offsetTop );
}
$.fn.getOffsetTop = function(){
	return getFullOffsetTop( this[0] );
}

// Button DOM handling

$('.button').each(function(i){
	var $button = $(this);
	var text = $button.text();
	var altText = $button.data('text') || text;

	$button.html('<span class="button-text">'+text+'</span>\
		<div class="button-inner"><span class="text-inner">'+altText+'</span></div>');
});

// Yandex.Maps

$('.yandex-maps').each(function(i){
	var COORDS = [55.850093, 37.636356];
	var mapId = 'map'+getRandomString;
	var $elem = $(this).attr('id', mapId );

	ymaps.ready(function(){
		var map = new ymaps.Map( mapId, {
			center: COORDS, 
			zoom: 15,
			controls: ['geolocationControl','routeEditor','typeSelector','zoomControl']
		});

		var marker = new ymaps.Placemark( COORDS, {}, {
			iconLayout: 'default#image',
			iconImageHref: '/images/map-marker.png',
			iconImageSize: [103, 120],
			iconImageOffset: [-51, -120]
		});

		map.geoObjects.add( marker );
		map.behaviors.disable('scrollZoom'); 
	});
});

// Navigation Menu

var Menu = {
	BREAKPOINT: 800,

	$elem: $('header'),
	$anchors: $('.anchor-point'),

	shown: false
}
$('nav a').on('click',function(e){
	var index = $(this).index();
	var pos = Menu.$anchors.eq( index ).getOffsetTop()-80;
	$('html, body').stop().animate({ scrollTop: pos }, 800 );
});
$(window).on('scroll',function(e){
	var scrollTop = $(window).scrollTop();
	if (scrollTop > Menu.BREAKPOINT && false == Menu.shown) {
		Menu.shown = true;
		Menu.$elem.addClass('shown');
	} else if (scrollTop < Menu.BREAKPOINT && true == Menu.shown) {
		Menu.shown = false;
		Menu.$elem.removeClass('shown');
	}
})

// Form Popup

;(function(){
	$('.open-popup').on('click',function(e){
		var $form = $('.form-wrapper');
			$form.find('input').val('');
		openPopup( $form );

		$('input[name="trigger"]').val( $(this).data('trigger') || $(this).text() );
	});

	var busy = false;
	$('.send').on('click',function(e){
		if (busy) return;
			busy = true;

		var $this = $(this),
			$container = $this.closest('form, section'),
			$inputs = $container.find('input');

		var collectedData = { form: $container.data('form') };
		$inputs.each(function(){
			if (this.name) collectedData[this.name] = this.value;
		});

		if (console && console.log) console.log( collectedData );

		// Validation
		if (!collectedData.phone && !collectedData.mail) {
			busy = false;
			return false;
			// return showMessage('Заполните<br>необходимые поля<small>Укажите свой телефон.</small>', 1800 );
		}

		// Thankful message
		openPopup( $('.thank-wrapper') );
		setTimeout(function(){
			$('.form-wrapper .form-close').click();
		}, 750 );

		$.ajax({
			url: 'php/form-handler.php',
			type: 'POST',
			data: collectedData,
			complete: function(){
				busy = false;
			}
		});
	});

	function openPopup( $container ){
		$container.css({
			transition: 'opacity .0s',
			opacity: 0
		}).show();
		var $content = $container.find('.popup-content').css({
			transition: '.0s',
			transform: 'translateY(40px)'
		});

		setTimeout(function(){
			$container.css({
				transition: 'opacity 1s .0s',
				opacity: 1
			});
			$content.css({
				transition: '1s',
				transform: ''
			});
		}, 10 );

		$(window).on('mousewheel',function(e){
			e.preventDefault();
		});

		$container.find('.popup-background, .form-close').one('click',function(){
			$(window).off('mousewheel');
			$container.css({
				transition: 'opacity .5s',
				opacity: 0
			});
			setTimeout(function(){
				$container.hide();
			}, 530 );
		});
	}

})();


// Block: Boxes

(function(){
	var $section = $('.boxes-section');
	var $backgrounds = $section.find('.background img');
	var $switch = $section.find('.tabs-switch a');
	var $contents = $section.find('.tabs-content > li');

	$switch.on('click',function(e){
		var index = $(this).index();
		$switch.removeClass('active').eq( index ).addClass('active');

		$contents.hide().eq( index ).show();

		$backgrounds.addClass('hidden').eq( index ).removeClass('hidden');
	});
})();

// Block: Boxes

(function(){
	var $section = $('.prices-section');
	var $switch = $section.find('.tabs-switch a');
	var $contents = $section.find('.tabs-content > li');

	$switch.on('click',function(e){
		var index = $(this).index();
		$switch.removeClass('active').eq( index ).addClass('active');

		$contents.hide().eq( index ).show();
	});
})();

// Block: Boxes

(function(){
	var $section = $('.testimonials-section');
	var $arrows = $('.arrows-left, .arrows-right', $section );
	var $carousel = $('.testimonials-carousel');
	var $items = $carousel.children();

	var index = 0,
		max = $items.length-1;

	var blocked = false;

	$arrows.on('click',function(e){
		if (blocked) return;
			blocked = true;

		var prev = index;

		var left = $(this).hasClass('arrows-left');
			left = !left;

		index += left ? -1 : +1;
		if (index > max) index = 0;
		if (index < 0) index = max;

		// var dir = prev > index;

		var $prev = $items.eq(prev).children();
		if (left) $prev = $prev.get().reverse();
		TweenMax.staggerFromTo( $prev, 0.75, {
			x: 0, opacity: 1
		}, {
			x: left ? 60 : -60, opacity: 0
		}, 0.1, function(){
			$items.eq(prev).hide();
		});

		var $curr = $items.eq(index).show().children().css('opacity',0);
		if (left) $curr = $curr.get().reverse();
		TweenMax.staggerFromTo( $curr, 0.75, {
			x: left ? -60 : 60, opacity: 0
		}, {
			delay: 0.53,
			x: 0, opacity: 1
		}, 0.1, function(){
			blocked = false;
		});
	});
})();

// Block: Clients

(function(){
	var $section = $('.clients-section');
	var $arrows = $('.arrows-left, .arrows-right', $section );
	var $carousel = $('.clients-carousel');
	var $items = $carousel.children();

	var index = 0,
		max = $items.length-1;

	var blocked = false;

	$arrows.on('click',function(e){
		if (blocked) return;
			blocked = true;

		var prev = index;

		var left = $(this).hasClass('.arrows-left');
			left = !left;

		index += left ? -1 : +1;
		if (index > max) index = 0;
		if (index < 0) index = max;

		// var dir = prev > index;

		TweenMax.staggerFromTo( $items.eq(prev).children(), 0.5, {
			x: 0, opacity: 1
		}, {
			x: left ? 60 : -60, opacity: 0
		}, 0.1, function(){
			// $items.eq(prev).hide();
		});

		var $curr = $items.eq(index).show().children().css('opacity',0);
		TweenMax.staggerFromTo( $curr, 0.5, {
			x: left ? -60 : 60, opacity: 0
		}, {
			delay: 0.43,
			x: 0, opacity: 1
		}, 0.1, function(){
			blocked = false;
		});
	});
})();

// Block: Photo

(function(){
	var $section = $('.photo-section');
	var $arrows = $('.arrows-left, .arrows-right', $section );
	var $carousel = $('.photo-carousel');
	var $items = $carousel.children();

	var positions = [-50,345,741,1457,1859];

	$items.eq(2).addClass('big');

	var index = 0,
		// max = $items.length-1;
		max = 4;

	var blocked = false;

	$arrows.on('click',function(e){
		// if (blocked) return;
			blocked = true;

		var prev = index;

		var left = $(this).hasClass('arrows-left');
			// left = !left;

		var overp = 0;
		index += left ? -1 : +1;
		if (index > max) index = max, overp = 1;
		if (index < -2) index = -2, overp = -1;

		if (overp == 0) {
			$items.removeClass('big').each(function(i){
				var posIndex = i-index;
				if (posIndex == 2) $(this).addClass('big');
				var pos = positions[posIndex] ? positions[posIndex] : posIndex < 0 ? -400 : 2000;
				TweenMax.to( this, 1.2, {
					x: pos,
					ease: Power2.easeOut,
					onComplete: function(){
						blocked = false;
					}
				});
			});
		} else {
			/*$items.each(function(i){
				var posIndex = i-index;
				var pos = positions[posIndex] ? positions[posIndex] : posIndex < 0 ? -400 : 2000;
				TweenMax.to( this, 0.8, { ease: SlowMo.ease.config(0.1, 2, true), x: pos });
			});*/
		}
	});

})();

// Photoboxes

$('.photo-photobox').photobox('a',{ time:0 });
$('.photo-carousel').on('click','img',function(e){
	var index = $(this).parent().index();
	$('.photo-photobox').find('a').eq( index ).click();
});

$('.review-photobox').photobox('a',{ time:0 });
$('.testimonials-carousel').on('click','.item',function(e){
	var index = $('.testimonials-carousel .item').index( this );
	$('.review-photobox').find('a').eq( index ).click();
});