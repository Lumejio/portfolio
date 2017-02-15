	</div>
	<footer>
		<div class="grid">
			<div class="copyright">© 2016 «Деньги под залог»</div>
		</div>
	</footer>
	
	<div class="popup-form popup" style="display: none; opacity: 0;">
		<div class="popup-background"></div>
		<div class="popup-content grid">
			<div class="popup-close"><i class="fa fa-close"></i></div>

			<div class="block-form">
				<h2>
					<span>Заказать звонок</span>
				</h2>
				<form class="form-form">
					<input type="tel" name="phone" placeholder="Ваш телефон">
					<a class="button send">
						<i class="fa fa-arrow-right"></i>
						<span>Отправить</span>
					</a>
				</form>
			</div>
		</div>
	</div>

	<div class="popup-thank-you popup" style="display: none; opacity: 0;">
		<div class="popup-background"></div>
		<div class="popup-content grid">
			<div class="popup-close"><i class="fa fa-close"></i></div>
			<h2>Ваша заявка<br>принята</h2>
			<p class="thank-message">Спасибо, что выбрали нас!</p>
		</div>
	</div>

	<noscript id="deferred-styles">
	      <link rel="stylesheet" type="text/css" href="styles/superfish.css"/>
      <link rel="stylesheet" type="text/css" href="styles/main.css"/>
      <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:100&subset=latin,cyrillic"/>
      <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css"/>
    </noscript>
    <script>
      var loadDeferredStyles = function() {
        var addStylesNode = document.getElementById("deferred-styles");
        var replacement = document.createElement("div");
        replacement.innerHTML = addStylesNode.textContent;
        document.body.appendChild(replacement)
        addStylesNode.parentElement.removeChild(addStylesNode);
      };
      var raf = requestAnimationFrame || mozRequestAnimationFrame ||
          webkitRequestAnimationFrame || msRequestAnimationFrame;
      if (raf) raf(function() { window.setTimeout(loadDeferredStyles, 0); });
      else window.addEventListener('load', loadDeferredStyles);
    </script>
	<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
		<script async src="scripts/hoverIntent.js"></script>
		<script async src="scripts/superfish.js"></script>
	<script async src="scripts/main.min.js"></script>
</body>
</html>