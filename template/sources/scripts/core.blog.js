// =====================
//  Put header in place
// =====================

var pageIsBlog = $(document.body).hasClass('blog'),
	blogHeaderHeight;
$(window).one('pagePrepare',function(e){
	if (!pageIsBlog) return;
	blogHeaderHeight = $('.blog-header').height() || 0;
	$background.css('transform3d','translateY(-'+blogHeaderHeight+'px)');
});
$(page).on('scrolling',function(pos,arg2){
	if (!pageIsBlog || !useScrollTop) return;
	if (useScrollTop) return;
	if (typeof pos == 'object') pos = arg2;
	var bgPos = -pos-blogHeaderHeight; // parallax option: Math.max( -572, -300+bgPos*0.5 );
	$background.css('transform3d','translateY('+bgPos+'px)');
});



// ==================
//  Responsive stuff
// ==================

;(function(){
	// Sidebar toggle
	var state = false;
	var $sidebar = $('.blog-sidebar');
	$(document).on('click','.blog-sidebar-toggler',function(){
		state = !state;
		// $sidebar.css('height', state ? $sidebar[0].scrollHeight -38 : '' ); // xxx magic number?
		$sidebar.css('height', state ? $sidebar[0].scrollHeight : '' ); // xxx magic number?
	});
	$('.blog-header-bar .content').append('<div class="blog-sidebar-toggler" />');

})();

function blogTagsUpdate(){
	$('.post-tags-list').each(function(){
		$(this).removeClass('drop-down')
			.toggleClass('drop-down', this.scrollHeight > this.offsetHeight );
	});
}
setTimeout( blogTagsUpdate, 0 );
$(window).on('resizeResponsive', blogTagsUpdate );



// ==============
//  Search field
// ==============

$('.search-field input').on('focus blur',function(e){
	$(this).siblings('.search-action')
		.toggleClass( 'focused', e.type == 'focus' || e.type == 'focusin' );
});



// ==============
//  Post preview
// ==============

$('.post-preview').each(function(i){
	var container = this,
		$container = $(container),
		$wrapper = $('<div class="preview-items-container" />').appendTo( container ),
		$elements = $('article', container ).appendTo( $wrapper ),
		$togglersContainer = $('<div class="togglers" />').appendTo( container ),
		$darker = $('<div class="darker" />').css('opacity',0).appendTo( container );

	Scroll.step(function( pos ){
		if ($.browser.mobile) return;

		var top = $container.getOffsetTop();
		var height = container.offsetHeight;
		if (pos > top+height || pos+w.height < top) return

		if (pos > top) {
			var rel = (pos-top)/height;
			$darker.css('opacity', rel );
		} else if (top+height > pos+w.height) {
			var rel = (top+height-pos-w.height)/height;
			$darker.css('opacity', rel );
		}
	});

	var active = 0;
	var max = $elements.length-1;
	var step = $container.width();
	var available = max*step;	
	var anim = new MoveAnimation( $wrapper[0], true );
	var togglers = new Togglers({
		elem: $togglersContainer,
		amount: $elements.length,
		absolute: true,
		handler: function( index ){
			var pos = index*step;
			touch.pos = pos;
			anim.animate( pos, 800, { disableSubpixelsOnIdle: true });
			active = index;
		}
	});

	if (max === 0) $wrapper.addClass('one-element');

	var hold = false;
	var clickTime, clickTarget;
	var touch = new TouchMove({
		elem: $wrapper,
		namespace: 'postpreview',
		ondown: function( pos, event ){
			hold = true;
			clickTime = getTime();
			clickTarget = event.target;
		},
		onmove: function( pos, diff, event ){
			if (pos < 0) pos /= 2;
			if (pos > available) pos = available+(pos-available)/2;
			anim.animate( pos, 200 );
		},
		onup: function( pos, diff, event ){
			hold = false;
			if (getTime() - clickTime < 350 && Math.abs(diff) < 10) {
				return $(clickTarget).click();
			}

			pos = Math.max( 0, Math.min( available, -pos ));
			var level = Math.round( pos/step );
			active = level;
			pos = level*step;
			anim.animate( pos, 800, { disableSubpixelsOnIdle: true });
			togglers.setActive( level );
			return pos;
		}
	});

	function updateResponsive(e){
		step = $container.width();
		available = max*step

		var pos = active*step;
		anim.animate( pos, 1, { disableSubpixelsOnIdle: true });
		touch.pos = pos;

		var $sidebar = $('.blog-sidebar');
		if (w.width > 800) {
			$sidebar.css({ paddingLeft: '', width: '' });
		} else {
			var width = 202; // $sidebar.width();
			var padding = (w.width*0.9-width)/2;
			$sidebar.css({
				paddingLeft: padding,
				width: width+padding
			});
		}
		
		$elements.find('img').centerImages();
	}
	$(window).on('resizeResponsive', updateResponsive );
	updateResponsive();
});



// =======
//  Reply
// =======

;(function(){
	$('.clear').on('click',function(e){
		$(this).closest('form').find('input, textarea').val('');
	});
	$('.send').on('click',function(e){
		var $form = $(this).closest('form');
		var $status = $form.find('.reply-status');
			$form.find('input, textarea').each(function(i){
				if (!this.required) {
					if (!this.hasAttribute('required') || this.getAttribute('required') == 'false') return; // ie9 fix
				}
				if ($.trim($(this).val()) != '') return; // I can't get just 'value' cuz of IE9 placeholders

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
				return false;
			});
	});

	var anim = new MoveAnimation({ pos: 17 });
	var blocked = false;
	// xxx back to normal
	$('.reply-button').on('click',function(e){
		var $form = $('.reply-form');
		var $comment = $(this).closest('.comment');
		var $replies = $comment.find('.comment-replies');
		
		if ($form.closest('.comment').is( $comment )) return;
		if (blocked) return;
		blocked = true;

		var effect = $form[0].className.match(/animation-[\w-]*/);
		$form.removeClass( effect ? effect[0] : '' ).css('transition','').addClass('hidden');
		
		var rect = $form[0].getBoundingClientRect();
		if (rect.top > w.height) {
			setTimeout( appendAnimation, 0 );
		} else {
			$form.transitEnd(function(){
				anim.animate( 393, 601, {
					easing: 'ease',
					step: function( value ){
						$form.css('marginTop', value );
					},
					complete: appendAnimation
				});

				var scPos = Scroll.available-393;
				if (Scroll.position > scPos) Scroll.to( scPos, 601, 'ease');
			});
		}

		function appendAnimation(){
			if ($replies.length) {
				$form.insertBefore( $replies );
			} else {
				$form.appendTo( $comment );
			}

			$form.css('marginTop', -393 );

			setTimeout(function(){
				anim.node.pos = -393;
				anim.animate( -17, 801, {
					easing: 'ease',
					step: function( value ){
						$form.css('marginTop', value );
					},
					complete: function(){
						$form.removeClass('hidden');
						$form.find('input, textarea').first().focus();
						Scroll.resize();
					}
				});
				Scroll.to( $comment.getOffsetTop()-10, 800, 'ease'); // xxx magic number?
			}, 25 );
			blocked = false;
		}
	});
})();



// =========
//  Widgets
// =========

$('.sidebar-skills').each(function(i){
	var $container = $(this);
	var $skills = $container.children('article');
		$skills.each(function(i){
			var percent = parseFloat( $(this).data('percent'), 10 );
			$(this).append('<div class="skill-stripe"><hr style="width:'+percent+'%;"></div>');
		});
});

$('.sidebar-slider').each(function(i){
	var $container = $(this);
	var $elements = $container.children('article');
	var $wrapper = $elements.wrapAll('<div class="movable" />')
			.parent().addClass('grab-cursor').css('height','100%');
	var $togglersContainer = $('<div class="togglers" />').appendTo( this );

	var max = $elements.length-1;
	var step = $elements.outerWidth( true );
	var available = max*step;	
	var anim = new MoveAnimation( $wrapper[0], true );
	var togglers = new Togglers({
		elem: $togglersContainer,
		style: 'small',
		amount: $elements.length,
		handler: function( index ){
			var pos = index*step;
			touch.pos = pos;
			anim.animate( pos, 800, { disableSubpixelsOnIdle: true });
			updateCaptions( index );
		}
	});

	var $captionsContainer = $('<div class="captions-container" />').appendTo( this );
	$elements.each(function(i){
		$('<div class="slide-caption" />')
			.append( $(this).children('p') ).appendTo( $captionsContainer );
	});
	var $captions = $captionsContainer.children();
	$captionsContainer.find('p').each(function(){
		$(this).contents().wrapAll('<span />');
	});
	var prev = 0;
	function updateCaptions( index ){
		if (prev != index) {
			$captions.eq( prev ).find('p').stop().animate({ width: 0 }, 500 );
			setTimeout(function(){
				$captions.eq( index ).find('p').stop().each(function(){
					var width = this.scrollWidth;
					$(this).animate({ width: width }, 500 );
				});
				prev = index;
			}, 500 );
		}
	}

	var touch = new TouchMove({
		elem: $wrapper,
		namespace: 'widgetslider',
		onmove: function( pos, diff, event ){
			if (pos < 0) pos /= 2;
			if (pos > available) pos = available+(pos-available)/2;
			anim.animate( pos, 200 );
		},
		onup: function( pos, diff, event ){
			pos = Math.max( 0, Math.min( available, -pos ));
			var level = Math.round( pos/step );
			pos = level*step;
			anim.animate( pos, 800, { disableSubpixelsOnIdle: true });
			togglers.setActive( level );
			updateCaptions( level );
			return pos;
		}
	});
});

$('.sidebar-gallery').each(function(i){
	var container = this;
		$container = $(container),
		$elements = $container.children('article'),
		$wrapper = $elements.wrapAll('<div class="movable" />').parent().addClass('grab-cursor'),
		$togglersContainer = $('<div class="togglers" />').appendTo( this );

	var max = $elements.length-1;
	var step = $elements.outerWidth( true );
	var available = max*step;	
	var anim = new MoveAnimation( $wrapper[0], true );
	var togglers = new Togglers({
		elem: $togglersContainer,
		style: 'small',
		amount: $elements.length,
		handler: function( index ){
			var pos = index*step;
			touch.pos = pos;
			anim.animate( pos, 800, { disableSubpixelsOnIdle: true });
		}
	});

	var hold = false;
	var clickTime, clickTarget;

	var touch = new TouchMove({
		elem: $wrapper,
		namespace: 'widgetgallery',
		ondown: function( pos, event ){
			hold = true;
			clickTime = getTime();
			clickTarget = event.target;
		},
		onmove: function( pos, diff, event ){
			if (pos < 0) pos /= 2;
			if (pos > available) pos = available+(pos-available)/2;
			anim.animate( pos, 200 );
		},
		onup: function( pos, diff, event ){
			hold = false;
			if (getTime() - clickTime < 350 && Math.abs(diff) < 10) {
				return $(clickTarget).click();
			}

			pos = Math.max( 0, Math.min( available, -pos ));
			var level = Math.round( pos/step );
			pos = level*step;
			anim.animate( pos, 800, { disableSubpixelsOnIdle: true });
			togglers.setActive( level );
			return pos;
		}
	});
});