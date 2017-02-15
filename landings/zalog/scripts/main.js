/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery" ], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    var caretTimeoutId, ua = navigator.userAgent, iPhone = /iphone/i.test(ua), chrome = /chrome/i.test(ua), android = /android/i.test(ua);
    $.mask = {
        definitions: {
            "9": "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, $.fn.extend({
        caret: function(begin, end) {
            var range;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin, 
            this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(begin, end) : this.createTextRange && (range = this.createTextRange(), 
                range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin), 
                range.select());
            })) : (this[0].setSelectionRange ? (begin = this[0].selectionStart, end = this[0].selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(), 
            begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length), 
            {
                begin: begin,
                end: end
            });
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input, defs, tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
            if (!mask && this.length > 0) {
                input = $(this[0]);
                var fn = input.data($.mask.dataName);
                return fn ? fn() : void 0;
            }
            return settings = $.extend({
                autoclear: $.mask.autoclear,
                placeholder: $.mask.placeholder,
                completed: null
            }, settings), defs = $.mask.definitions, tests = [], partialPosition = len = mask.length, 
            firstNonMaskPos = null, $.each(mask.split(""), function(i, c) {
                "?" == c ? (len--, partialPosition = i) : defs[c] ? (tests.push(new RegExp(defs[c])), 
                null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
            }), this.trigger("unmask").each(function() {
                function tryFireCompleted() {
                    if (settings.completed) {
                        for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++) if (tests[i] && buffer[i] === getPlaceholder(i)) return;
                        settings.completed.call(input);
                    }
                }
                function getPlaceholder(i) {
                    return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
                }
                function seekNext(pos) {
                    for (;++pos < len && !tests[pos]; ) ;
                    return pos;
                }
                function seekPrev(pos) {
                    for (;--pos >= 0 && !tests[pos]; ) ;
                    return pos;
                }
                function shiftL(begin, end) {
                    var i, j;
                    if (!(0 > begin)) {
                        for (i = begin, j = seekNext(end); len > i; i++) if (tests[i]) {
                            if (!(len > j && tests[i].test(buffer[j]))) break;
                            buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                        }
                        writeBuffer(), input.caret(Math.max(firstNonMaskPos, begin));
                    }
                }
                function shiftR(pos) {
                    var i, c, j, t;
                    for (i = pos, c = getPlaceholder(pos); len > i; i++) if (tests[i]) {
                        if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                        c = t;
                    }
                }
                function androidInputEvent() {
                    var curVal = input.val(), pos = input.caret();
                    if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                        for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1]; ) pos.begin--;
                        if (0 === pos.begin) for (;pos.begin < firstNonMaskPos && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    } else {
                        for (checkVal(!0); pos.begin < len && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    }
                    tryFireCompleted();
                }
                function blurEvent() {
                    checkVal(), input.val() != focusText && input.change();
                }
                function keydownEvent(e) {
                    if (!input.prop("readonly")) {
                        var pos, begin, end, k = e.which || e.keyCode;
                        oldVal = input.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = input.caret(), 
                        begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1), 
                        end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1), 
                        e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && (input.val(focusText), 
                        input.caret(0, checkVal()), e.preventDefault());
                    }
                }
                function keypressEvent(e) {
                    if (!input.prop("readonly")) {
                        var p, c, next, k = e.which || e.keyCode, pos = input.caret();
                        if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                            if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)), 
                            p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                                if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                                    var proxy = function() {
                                        $.proxy($.fn.caret, input, next)();
                                    };
                                    setTimeout(proxy, 0);
                                } else input.caret(next);
                                pos.begin <= lastRequiredNonMaskPos && tryFireCompleted();
                            }
                            e.preventDefault();
                        }
                    }
                }
                function clearBuffer(start, end) {
                    var i;
                    for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
                }
                function writeBuffer() {
                    input.val(buffer.join(""));
                }
                function checkVal(allow) {
                    var i, c, pos, test = input.val(), lastMatch = -1;
                    for (i = 0, pos = 0; len > i; i++) if (tests[i]) {
                        for (buffer[i] = getPlaceholder(i); pos++ < test.length; ) if (c = test.charAt(pos - 1), 
                        tests[i].test(c)) {
                            buffer[i] = c, lastMatch = i;
                            break;
                        }
                        if (pos > test.length) {
                            clearBuffer(i + 1, len);
                            break;
                        }
                    } else buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
                    return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? (input.val() && input.val(""), 
                    clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), input.val(input.val().substring(0, lastMatch + 1))), 
                    partialPosition ? i : firstNonMaskPos;
                }
                var input = $(this), buffer = $.map(mask.split(""), function(c, i) {
                    return "?" != c ? defs[c] ? getPlaceholder(i) : c : void 0;
                }), defaultBuffer = buffer.join(""), focusText = input.val();
                input.data($.mask.dataName, function() {
                    return $.map(buffer, function(c, i) {
                        return tests[i] && c != getPlaceholder(i) ? c : null;
                    }).join("");
                }), input.one("unmask", function() {
                    input.off(".mask").removeData($.mask.dataName);
                }).on("focus.mask", function() {
                    if (!input.prop("readonly")) {
                        clearTimeout(caretTimeoutId);
                        var pos;
                        focusText = input.val(), pos = checkVal(), caretTimeoutId = setTimeout(function() {
                            input.get(0) === document.activeElement && (writeBuffer(), pos == mask.replace("?", "").length ? input.caret(0, pos) : input.caret(pos));
                        }, 10);
                    }
                }).on("blur.mask", blurEvent).on("keydown.mask", keydownEvent).on("keypress.mask", keypressEvent).on("input.mask paste.mask", function() {
                    input.prop("readonly") || setTimeout(function() {
                        var pos = checkVal(!0);
                        input.caret(pos), tryFireCompleted();
                    }, 0);
                }), chrome && android && input.off("input.mask").on("input.mask", androidInputEvent), 
                checkVal();
            });
        }
    });
});

// SCRIPT BODY

    $('ulQ.sf-menu').superfish({
        delay: 500,
        speed: '250',
        speedOut: '400'
    });

    $('.main-navigation nav > ul > li').on('mouseenter mouseleave',function(e){
        var hasChild = $(this).children('ul').length > 0;
        if (e.type == 'mouseleave' || e.type == 'mouseout') hasChild = false;
        $('.sf-background').toggle( hasChild );
    });

    $('.mobile-menu').on('click',function(i){
        $('.mobile-navigation').toggleClass('showed');
    });

    var mobLevel = 0;
    $('.mobile-navigation').on('click','a',function(e){
        var $submenu = $(this).siblings('ul');
        if ($submenu.length) {
            mobLevel++;
            var $level = $(this).closest('nav').children('ul');
                $level.css('transform','translateX(-'+mobLevel*100+'%)');
            $submenu.show();

            if (mobLevel > 0) $('.back-button').css('left',mobLevel*100+50+'%');

            e.preventDefault();
        }
    });
    $('.back-button').on('click',function(){
        mobLevel--;
        var selector = '.mobile-navigation nav ul ul';
        for (var i = 0; i < mobLevel; i++) {
            selector += ' ul';
        }
        $( selector ).hide();
        $('.mobile-navigation nav > ul').css('transform','translateX(-'+mobLevel*100+'%)');
        if (mobLevel > 0) $('.back-button').css('left',mobLevel*100+50+'%');
    });

$('input[name="phone"]').mask("9 (999) 999-99-9?9");

$('.block-conditions input').on('focus blur',function(e){
	var $background = $(this).closest('section').find('.cond-background');
		$background.css('transform', e.type == 'focus' ? 'translateX(0px)' : '');
});

$(document).on('click','.send',function(e){
	e.preventDefault();
	var $form = $(this).closest('form');
	if ($form.find('input[name="phone"]').val() == '') return;
	openPopup( $('.popup-thank-you') );
	$('.popup-form .popup-close').click();

	setTimeout(function(){
		$('.popup-thank-you .popup-close').click();
	}, 3500 );
});
$(document).on('click','.open-popup',function(e){
	e.preventDefault();
	openPopup( $('.popup-form') );
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

	$container.find('.popup-background, .popup-close').one('click',function(){
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

var clouds = [
	{
		elem: $('.layer--cloud0'),
		duration: 40000*2,
		width: 761
	},
	{
		elem: $('.layer--cloud1'),
		duration: 65000*2,
		width: 857
	},
	{
		elem: $('.layer--cloud2'),
		duration: 105000*2,
		width: 704
	},
	{
		elem: $('.layer--cloud3'),
		duration: 83000*2,
		width: 882
	}
];
function updateBackground(){
	var DURATION = 450000;
	var FRAMERATE = 45;
	var NOW = +new Date;

	var rel = (NOW % DURATION) / DURATION;
	var moscowPos = (4475)*rel;
	// $('.layer--moscow').css('transform','translate3d('+-moscowPos+'px,0,0)');
	$('.layer--moscow').css('transform','translateX('+-moscowPos+'px)');
	// $('.layer--moscow').css('background-position', -moscowPos+'px 0' );

	for (var i = 0; i < clouds.length; i++) {
		var now = NOW + i*14000;
		var rel = (now % clouds[i].duration) / clouds[i].duration;
            rel = (1-rel);
		var pos = (innerWidth+clouds[i].width*2)*rel-clouds[i].width;
		clouds[i].elem.css('transform','translateX('+pos+'px)');
	}

	setTimeout( updateBackground, 1000/FRAMERATE );
}
if ($('.layer--moscow').length) updateBackground();

var $navigation = $('.main-navigation');
var $activeSq = $navigation.find('.active-elem');
var $navLinks = $navigation.find('ul:first > li');
function updateSquarePos( elem ){
	var $active = $navLinks.filter('.active');
	if (elem) var $active = $(elem);
	if ($active.length == 0) $active = $navLinks.first();
	var pos = $active.position().left + $active.width()/2;
	$activeSq.css('transform','translateX('+pos+'px)');
}
setTimeout(function(){
	updateSquarePos();
}, 150 );
setTimeout(function(){
	$activeSq.addClass('animated');
}, 250 );
$(window).load(function(){
    updateSquarePos();
});
$navLinks.on('mouseenter',function(){
	updateSquarePos( this );
}).on('mouseleave',function(){
	updateSquarePos();
});

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

throw new Error();

;(function(){
	$(document).on('click','.open-popup',function(e){
		e.preventDefault();
		var $form = $('.popup-form');
			$form.find('input').val('');
		openPopup( $form );

		$('input[name="trigger"]').val( $(this).data('trigger') || $(this).text() );
	});

	var busy = false;
	$('form').on('submit',function(e){
		e.preventDefault();
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
		// openPopup( $('.thank-wrapper') );
		setTimeout(function(){
			$('.popup-form .popup-background').click();
		}, 750 );

		$.ajax({
			url: 'php/form-handler.php',
			type: 'POST',
			data: collectedData,
			complete: function(){
				busy = false;
				var n = noty({
					type: 'success',
					layout: 'topCenter',
					timeout: 2000,
					text: 'Ваша заявка отправлена. Наш менеджер свяжется с вами в ближайшее время'
				});
			}
		});
	});

	

})();