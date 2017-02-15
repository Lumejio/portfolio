		<section class="inner-header grid">
			<p class="site-title">
				<span class="mobile-menu"></span>
				Деньги под залог</p>

			<div class="inner-header-right">
				<a class="button open-popup">
					<i class="fa fa-phone"></i>
					<span>Перезвоните мне</span>
				</a>
				<p class="phone">8-495-000-00-00</p>
				<p class="mail"><a href="mailto:info@mail.ru">info@mail.ru</a></p>
			</div>
		</section>

		<?php
			function render_menu_items(){
			?>
				<li class="active">
					<a href="/">Деньги под залог</a>
					<ul>
						<li>
							<a href="/services.php">Под залог недвижимости</a>
							<ul>
								<li><a href="/services.php">Под залог квартиры</a></li>
								<li><a href="/services.php">Под залог комнаты</a></li>
								<li><a href="/services.php">Под залог доли в квартире</a></li>
								<li><a href="/services.php">Под залог коттеджа</a></li>
								<li><a href="/services.php">Под залог доли в квартире</a></li>
								<li><a href="/services.php">Под залог коттеджа</a></li>
							</ul>
						</li>
						<li><a href="/services.php">Под залог ценных бумаг</a></li>
						<li><a href="/services.php">Под залог автомобиля</a></li>
						<li><a href="/services.php">Под залог спецтехники</a></li>
						<li><a href="/services.php">Под залог ценных бумаг</a></li>
						<li><a href="/services.php">Под залог автомобиля</a></li>
						<li><a href="/services.php">Под залог спецтехники</a></li>
						<li><a href="/services.php">Под залог ценных бумаг</a></li>
						<li><a href="/services.php">Под залог автомобиля</a></li>
					</ul>
				</li>
				<li class="">
					<a href="/xxx.php">Срочный выкуп</a>
					<ul>
						<li>
							<a href="/services.php">Срочный выкуп недвижимости</a>
							<ul>
								<li><a href="/services.php">Срочный выкуп квартиры</a></li>
								<li><a href="/services.php">Срочный выкуп комнаты</a></li>
								<li><a href="/services.php">Срочный выкуп доли в квартире</a></li>
								<li><a href="/services.php">Срочный выкуп коттеджа</a></li>
								<li><a href="/services.php">Срочный выкуп доли в квартире</a></li>
								<li><a href="/services.php">Срочный выкуп коттеджа</a></li>
							</ul>
						</li>
						<li><a href="/services.php">Срочный выкуп ценных бумаг</a></li>
						<li><a href="/services.php">Срочный выкуп автомобиля</a></li>
						<li><a href="/services.php">Срочный выкуп спецтехники</a></li>
						<li><a href="/services.php">Срочный выкуп ценных бумаг</a></li>
						<li><a href="/services.php">Срочный выкуп автомобиля</a></li>
						<li><a href="/services.php">Срочный выкуп спецтехники</a></li>
						<li><a href="/services.php">Срочный выкуп ценных бумаг</a></li>
						<li><a href="/services.php">Срочный выкуп автомобиля</a></li>
					</ul>
				</li>
				<li class="">
					<a href="/xxx.php">Документы</a>
				</li>
				<li class="">
					<a href="/xxx.php">Сертификаты</a>
				</li>
				<li class="">
					<a href="/blog.php">Блог</a>
				</li>
				<li class="">
					<a href="/xxx.php">Контакты</a>
				</li>
			<?php
			}
		?>
		<div class="mobile-navigation">
			<nav>
				<ul class="mob-menu">
					<div class="back-button">
						<span class="button"><i class="fa fa-chevron-left"></i> Назад</span>
					</div>
					<?php render_menu_items(); ?>
				</ul>
			</nav>
		</div>

		<section class="main-navigation">
			<div class="sf-background">
				<img src="images/sf-bg.jpg">
			</div>
			<div class="grid">
				<nav>
					<div class="active-elem"></div>
					<ul class="sf-menu">
						<?php render_menu_items(); ?>
					</ul>
				</nav>
			</div>
		</section>