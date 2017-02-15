	</div>
	<footer>
		<div class="grid">
			<a href="http://tutmee.ru/" target="_blank" class="developers">
			<img src="images/tutmee.png"><span>Создание дизайна
			<br>и разработка сайтов
			<br>LTD Tutmee.ru</span></a>

			<p class="footer-text">ResursinTech – обеспечим и комфорт, и безопасность!</p>

			<div class="copyright">© 2016 «Resurs Intech»</div>
		</div>
	</footer>
	
	<div class="popup-form popup" style="display: none; opacity: 0;">
		<div class="popup-background"></div>
		<div class="popup-content grid">
			<div class="popup-close">
				<img src="images/close.png">
			</div>

			<form class="">
				<h1 id="form-title">оставьте свои контактные данные</h1>
				<h5>Мы Вам перезвоним в течении часа</h5>
				
				<input type="text" name="name" placeholder="Напишите Ваше имя*">
				<input type="tel" name="phone" placeholder="Ваш телефон*">

				<a class="button send">
					<span>Отправить</span>
				</a>

				<p class="privacy-text">*Политика компании ResursinTech – абсолютная конфиденциальность в отношении настоящих или будущих клиентов.</p>
			</form>
		</div>
	</div>

	<div class="popup-thank-you popup" style="display: none; opacity: 0;">
		<div class="popup-background"></div>
		<div class="popup-content grid">
			<div class="popup-close" style="visibility: hidden;">
				<img src="images/close.png">
			</div>

			<h1>Ваша заявка<br>принята</h1>
			<!-- <p class="thank-message">Спасибо, что выбрали нас!</p> -->
		</div>
	</div>

	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="display: none;">
		<defs>
			<filter id="fancy-goo">
				<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
				<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8.5" result="goo" />
				<feComposite in="SourceGraphic" in2="goo" operator="atop"/>
			</filter>
		</defs>
	</svg>

	<noscript id="deferred-styles">
      <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css"/>
      <link rel="stylesheet" href="//cdn.jsdelivr.net/jquery.slick/1.6.0/slick.css"/>
      <link rel="stylesheet" href="styles/magnific.css"/>
    </noscript>

	<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
    <script>
      var loadDeferredStyles = function() {
        var addStylesNode = document.getElementById("deferred-styles");
        var replacement = document.createElement("div");
	        replacement.innerHTML = addStylesNode.textContent;
        $(document.head).prepend(replacement);
        addStylesNode.parentElement.removeChild(addStylesNode);
      };
      var raf = requestAnimationFrame || mozRequestAnimationFrame ||
          webkitRequestAnimationFrame || msRequestAnimationFrame;
      if (raf) raf(function() { window.setTimeout(loadDeferredStyles, 0); });
      else window.addEventListener('load', loadDeferredStyles);
    </script>
    
	<script src="//cdn.jsdelivr.net/jquery.slick/1.6.0/slick.min.js"></script>
	<script src="scripts/main.min.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?callback=initMaps" async defer></script>
</body>
</html>