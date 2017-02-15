<?php
include "svg.php";
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Транснефть</title>

	<meta name="HandheldFriendly" content="True">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

	<link rel="icon" type="image/png" href="images/fav/favicon.png">
	<link rel="apple-touch-icon" href="images/fav/favicon-60.png">
	<link rel="apple-touch-icon" href="images/fav/favicon-76.png" sizes="76x76">
	<link rel="apple-touch-icon" href="images/fav/favicon-120.png" sizes="120x120">
	<link rel="apple-touch-icon" href="images/fav/favicon-152.png" sizes="152x152">
	<link rel="apple-touch-icon" href="images/fav/favicon-180.png" sizes="180x180">

	<link rel="stylesheet" href="styles/production.css">
</head>
<body>
	<svg width="0" height="0" style="position: absolute;">
		<defs>
			<linearGradient id="cloud-grad" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%"   stop-color="#9cf3e2" />
				<stop offset="100%" stop-color="#b1f3c0" />
			</linearGradient>

			<filter id="blur">
				<feGaussianBlur in="SourceGraphic" stdDeviation="0,0" />
			</filter>

			<filter id="goo">
				<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
				<!-- <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" /> -->
				<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -3" result="goo" />
				<feComposite in="SourceGraphic" in2="goo" operator="atop"/>
			</filter>
		</defs>
	</svg>

	<div class="scrollbar-thumb"></div>

	<div class="background-element">
		<hr class="background-hover">
	</div>

	<header>
		<div class="social-media">
			<a href=""><i class="fa fa-facebook"></i></a>
			<a href=""><i class="fa fa-google-plus"></i></a>
			<a href=""><i class="fa fa-pinterest-p"></i></a>
			<a href=""><i class="fa fa-twitter"></i></a>
			<a href=""><i class="fa fa-vk"></i></a>
			<a href=""><i class="fa fa-odnoklassniki"></i></a>
		</div>
		<a class="phone-number" href="tel:+7-495-000-00-00">+7 (495) 000-00-00</a>
	</header>
	<div class="content-wrapper">
		<div class="perspective-container">
			<?= $svg['drop']; ?>
		</div>

		<section class="main">
			<div class="main-above">
				<div class="background">
					<div class="floor layer-3">
						<?= $svg['sobor']; ?>
						<?= $svg['ostankino']; ?>
					</div>
					<div class="floor layer-2">
						<?= $svg['kremlin']; ?>
						<?= $svg['mgu']; ?>
					</div>
					<div class="floor layer-1">
						<?= $svg['tree']; ?>
						<?= $svg['mercury']; ?>
						<?= $svg['tree']; ?>
					</div>
					<div class="floor layer-0">
						<?= $svg['car1']; ?>
						<?= $svg['car2']; ?>
					</div>
					<div class="sky">
						<?= $svg['cloud3']; ?>
						<?= $svg['cloud3']; ?>
						<?= $svg['cloud3']; ?>
						<?= $svg['cloud2']; ?>
						<?= $svg['cloud2']; ?>
						<?= $svg['cloud1']; ?>
						<?= $svg['cloud1']; ?>
						<?= $svg['cloud1']; ?>
						<?= $svg['baloon']; ?>
						<?= $svg['plane']; ?>
					</div>
				</div>

				<h1>
					Транснефть
					<img src="images/transneft.png" width="444" height="41" alt="Транснефть">
				</h1>

				<h2>ГСМ и жидкости<br>повышенной опасности<br>доставим абсолютно<br>безопасно</h2>

				<p class="lead">по территории Москвы • Московской области • регионам центральной России</p>

				<a class="button mt-45 that-hover">Звоните, мы<br>транспортируем<br>надежно</a>
			</div>
			<div class="main-below">
				<div class="background">
					<hr class="stripe abcefg" style="margin-left: -660px; margin-top: 23px; width: 410px;">
					<hr class="stripe green1" style="margin-left: 420px; margin-top: 12px; width: 213px;">

					<hr class="stripe green1" style="margin-left: -319px; margin-top: 44px; width: 213px;">
					<hr class="stripe green2" style="margin-left: 287px; margin-top: 41px; width: 66px;">
					<hr class="stripe green1" style="margin-left: 630px; margin-top: 47px; width: 37px;">

					<hr class="stripe green2" style="margin-left: -220px; margin-top: 64px; width: 66px;">
					<hr class="stripe abcefg" style="margin-left: 83px; margin-top: 71px; width: 410px;">
					
					<hr class="stripe abcefg" style="margin-left: -133px; margin-top: 150px; width: 11px;">
					<hr class="stripe green1" style="margin-left: 15px; margin-top: 149px; width: 29px;">
					<hr class="stripe green1" style="margin-left: 55px; margin-top: 149px; width: 110px;">

					<hr class="stripe green2" style="margin-left: -18px; margin-top: 182px; width: 66px;">

					<hr class="stripe abcefg" style="margin-left: -303px; margin-top: 221px; width: 202px;">
				</div>

				<div class="main-float-text">
					<mark>Мы гарантируем сохранность Ваших грузов!</mark>
				</div>
			</div>
		</section>

		<section class="quick-and-safe drop-move" data-color="#b1f3c0,#9cf3e2" data-drop="#ffffff">
			<h2>Мы - за быстроту<br>и безопасность!</h2>

			<p class="lead pt-10">Транспортная компания «ТРАНСНЕФТЬ»<br>оперативно доставит по нужному адресу</p>

			<ul class="fuel-list">
				<?php
					$fuel_list = array("Дизельное топливо","Бензин","Керосин","БГС","Различные масла","Печное топливо (СМТ)","Толуол","Нефрас","Любые присадки");
					foreach ($fuel_list as $key => $fuel) {
						echo "<li><i class=\"fa fa-tint\"></i><p>$fuel</p></li>";
					}
				?>
			</ul>

			<div class="splash">
				<div class="splash-water">
					<?= $svg['water']; ?>
				</div>

				<div class="dribbles-float-text">
					<mark>Нам по плечу масштабные объемы!</mark>
				</div>
			</div>
		</section>

		<section class="autopark-header" data-color="#f1f1f1" data-drop="#9ef3df">
			<h2>Надежный транспорт -<br>залог успеха</h2>

			<p class="lead">Автопарк у компании собственный!</p>

			<ul class="autopark-features grid">
				<li>
					<div class="image">
						<img src="images/autopark/header-image0.png" alt="бензовоз">
					</div>
					<p style="left: 7px;">бензовозы</p>
				</li>
				<li>
					<div class="image">
						<img src="images/autopark/header-image1.png" alt="топливозаправщик">
					</div>
					<p style="left: 20px;">топливозаправщики</p>
				</li>
				<li>
					<div class="image">
						<img src="images/autopark/header-image2.png" alt="номер 777" class="vertical-middle">
					</div>
					<p style="left: 10px;">с номерами 777</p>
				</li>
			</ul>

			<p class="lead">европейского производства</p>
		</section>

		<section class="autopark-item">
			<h2>VOLVO</h2>

			<div class="top-images-container">
				<div class="auto-image">
					<img src="images/autopark/volvo0.jpg" alt="Volvo">
				</div>

				<div class="cover-image">
					<img src="images/autopark/volvo1.jpg" alt="литромер">
				</div>
			</div>

			<div class="auto-card">
				<div class="car-volume">Общий объем - <strong>46200 литров</strong></div>

				<div class="car-scheme volvo-scheme">
					<div class="car-scheme-litre">
						<p>12700 л.</p>
						<p>14400 л.</p>
						<p>14900 л.</p>
					</div>
				</div>

				<p class="car-subscript">* алюминиевая цистерна под ГСМ и химию<br>* помпа под дизтопливо</p>

				<div class="car-dimensions">
					<span>Габариты:</span>
					<img src="images/arrows/dimensions-h.png" alt="высота">
					<span>3,2 м</span>
					<img src="images/arrows/dimensions-l.png" alt="длина">
					<span>7,4 м</span>
					<img src="images/arrows/dimensions-w.png" alt="ширина">
					<span>2,6 м</span>
				</div>
			</div>

			<div class="driver-image">
				<img src="images/autopark/driver0.jpg" alt="водитель">
				<mark>Квалифицированный персонал</mark>
			</div>

			<div class="number-image">
				<img src="images/autopark/gosnomer0.jpg" alt="номер а777ек90">
				<mark>Госномер</mark>
			</div>

			<div class="autopark-order drop-anchor" data-drop-offset="350">
				<a class="button that-hover">Заказать</a>
			</div>
		</section>

		<section class="autopark-item">
			<h2>HYUNDAI</h2>

			<div class="top-images-container">
				<div class="auto-image">
					<img src="images/autopark/hyundai0.jpg" alt="Hyundai">
				</div>

				<div class="cover-image">
					<img src="images/autopark/hyundai1.jpg" alt="">
				</div>
			</div>

			<div class="auto-card">
				<div class="car-volume">Общий объем - <strong>4850 литров</strong></div>

				<div class="car-scheme hyundai-scheme">
				</div>

				<div class="car-dimensions">
					<span>Габариты:</span>
					<img src="images/arrows/dimensions-h.png" alt="высота">
					<span>3,2 м</span>
					<img src="images/arrows/dimensions-l.png" alt="длина">
					<span>7,4 м</span>
					<img src="images/arrows/dimensions-w.png" alt="ширина">
					<span>2,6 м</span>
				</div>
			</div>

			<div class="driver-image">
				<img src="images/autopark/driver1.jpg" alt="водитель">
				<mark>Квалифицированный персонал</mark>
			</div>

			<div class="number-image">
				<img src="images/autopark/gosnomer1.jpg" alt="номер а777ек90">
				<mark>Госномер</mark>
			</div>

			<div class="autopark-order drop-anchor" data-drop-offset="350">
				<a class="button that-hover">Заказать</a>
			</div>
		</section>

		<div class="autopark-show-more">
			<a class="button button-medium">показать больше автомобилей...</a>
		</div>

		<section class="any-time" data-color="#ffffff">
			<h2>Груз срочный?<br>Доставим транспорт<br>в любое время суток!</h2>

			<div class="background">
				<?= $svg['orbit1']; ?>
				<?= $svg['orbit2']; ?>
				<img class="image earth" src="images/orbit/earth.png" alt="земля">
				<img class="image glonass" src="images/orbit/glonass.png" alt="ГЛОНАСС">
				<img class="image letter" src="images/orbit/letter.png" alt="свидетельство">
				<img class="image meter" src="images/orbit/meter.png" alt="литрометр">
				<img class="image satelite" src="images/orbit/satelite.png" alt="спутник">
				<img class="image tube" src="images/orbit/tube.png" alt="шланг">
			</div>

			<div class="features-list grid text-left">
				<article>
					<h4>Он оборудован всем, что Вам нужно</h4>
					<ul>
						<li>насосами</li>
						<li>шлангами</li>
						<li>счетчиками</li>
						<li>и так далее</li>
					</ul>
				</article>
				<article>
					<h4>Действуют системы</h4>
					<ul>
						<li>ГЛОНАСС</li>
						<li>СТРУНА +</li>
					</ul>
				</article>
				<article>
					<h4>Спецтехника имеет</h4>
					<ul>
						<li>разрешительные документы</li>
						<li>свидетельства о поверке цистерн</li>
					</ul>
				</article>
			</div>

			<div class="prices-float-text">
				<mark>Наши цены по карману всем!</mark>
			</div>
		</section>
		
		<section class="calculator" data-color="#ededed">
			<h2 pb-8>Рассчитайте<br>примерную стоимость<br>транспортировки</h2>

			<mark>Калькулятор ООО ТК «ТРАНСНЕФТЬ»</mark>

			<div class="grid container">
				<dl class="calc-body text-left">
					<dt>
						<p>Какой продукт
						необходимо 
						перевезти?</p>
					</dt>
					<dd>
						<ul class="calc-select">
							<?php
								$fuel_list = array("Дизельное топливо","Бензин","Керосин","Различные масла","БГС","Печное топливо (СМТ)","Толуол","Нефрас","Любые присадки");
								foreach ($fuel_list as $key => $fuel) {
									echo "<li><i class=\"fa fa-tint\"></i> $fuel</li>";
								}
							?>
						</ul>
					</dd>

					<hr class="separator">

					<dt>
						<p>плотность нефте - 
						или химического 
						продукта</p>
					</dt>
					<dd>
						<ul class="calc-select">
							<li>0,75</li>
							<li>0,84</li>
						</ul>
					</dd>

					<hr class="separator">

					<dt>
						<p>Выберите машину, 
						способную перевезти 
						необходимый Вам 
						литраж</p>
					</dt>
					<dd>
						<ul class="calc-select">
							<?php
								$auto_list = array(
									array( "MERCEDES-BENZ", "39000 литров" ),
									array( "MERCEDES-BENZ", "39600 литров" ),
									array( "MAN TGS", "39600 литров" ),
									array( "MAN TGX", "36200 литров" ),
									array( "VOLVO", "46200 литров" ),
									array( "VOLVO", "42000 литров" ),
									array( "VOLVO", "12500 литров" ),
									array( "HYUNDAY", "4850 литров" )
								);
								foreach ($auto_list as $key => $auto) {
									echo '<li><a class="calc-watch-auto"><i class="fa fa-eye"></i></a>'.$auto[0].'<br>'.$auto[1].'</li>';
								}
							?>
						</ul>
					</dd>

					<hr class="separator">

					<dt>
						<p>Выберите город 
						отправки гсм</p>
					</dt>
					<dd>
						<select>
							<option value="">Москва</option>
							<option value="">Москва</option>
							<option value="">Москва</option>
						</select>
					</dd>

					<dt class="null"></dt>
					<dd class="null">
						<img src="images/arrows/step-down.png" alt="">
					</dd>

					<dt>
						<p>Выберите город 
						доставки гсм</p>
					</dt>
					<dd>
						<select>
							<option value="">Не выбрано</option>
							<option value="">Москва</option>
							<option value="">Москва</option>
						</select>
					</dd>
				</dl>

				<div class="calc-result">
					<p class="lead">стоимость транспортировки</p>

					<p class="result-title">Продукт</p>
					<output><i class="fa fa-tint"></i> Дизельное топливо</output>

					<hr class="separator">

					<p class="result-title">Плотность</p>
					<output>0,75</output>

					<hr class="separator">

					<p class="result-title">Автоцистерна</p>
					<output>MERCEDES-BENZ<br>39000 литров</output>

					<hr class="separator">

					<div class="inline-block mid-width">
						<p class="result-title">Отправка из:</p>
						<output>Москва</output>
					</div>
					<div class="inline-block mid-width">
						<img src="images/arrows/step-right.png" alt="" style="margin-top: 14px;">
					</div>
					<div class="inline-block mid-width">
						<p class="result-title">Доставка в:</p>
						<output>Тамбов</output>
					</div>

					<hr class="separator">

					<div class="inline-block long-width">
						<p class="result-title">Объем:</p>
						<output class="final">16300 л.</output>
					</div>
					<div class="inline-block long-width">
						<p class="result-title">Дистанция:</p>
						<output class="final">170 км.</output>
					</div>
					<div class="inline-block long-width">
						<p class="result-title">Цена:</p>
						<output class="green final">150 000 Р.</output>
					</div>

					<a class="button button-big">сделать заказ</a>

					<div class="calc-float-text text-left">
						<mark>Заказы принимаются в режиме 24/7</mark>
						<br>
						<mark>Круглосуточно, в выходные и праздники</mark>
					</div>
				</div>
			</div>
			<div class="map">
				<div class="google-maps"></div>
			</div>
		</section>

		<section class="price-description">
			<h2>Цена – от 35 копеек за литр<br>- не исключает экономии</h2>

			<div class="thread grid text-left">
				<article class="inline-block">
					<p class="lead">Вы успели понять:<br>стоимость заказа<br>зависит</p>
				</article>

				<article class="inline-block"><img src="images/arrows/step-right.png"></article>

				<article class="inline-block">
					<p>от расстояния</p>
				</article>

				<article class="inline-block"><img src="images/arrows/step-right.png"></article>

				<article class="inline-block">
					<p>вида жидкостей</p>
				</article>

				<article class="inline-block"><img src="images/arrows/step-right.png"></article>

				<article class="inline-block">
					<p>сроков загрузки и выгрузки</p>
				</article>
			</div>

			<div class="desc-float-text">
				<mark>Скидки зависят от объема!</mark>
			</div>
		</section>

		<section class="special-offer" data-color="#9cf3e2,#b1f3c0" data-drop="#ffffff">
			<h2>Специальное предложение<br>от компании «ТРАНСНЕФТЬ»</h2>

			<canvas id="special-dribbles" class="special-dribbles"></canvas>

			<div class="block drop-anchor" data-drop-offset="330">
				<p class="number">>100м³</p>
				<p class="lead">Закажите перевозку свыше 100 кубометров грузов за 1 раз</p>
				<p class="mid-text">и сразу сэкономьте</p>
				<p class="percent">5%!</p>
			</div>

			<div class="block drop-anchor" data-drop-offset="330">
				<p class="number">>200м³</p>
				<p class="lead">Закажите перевозку свыше 200 кубометров грузов за 1 раз</p>
				<p class="mid-text">и заплатите на</p>
				<p class="percent">10%</p>
				<p class="mid-text">дешевле!</p>
			</div>

			<div class="special-float-text">
				<mark>Проконсультировать Вас по возникшим вопросам</mark>
				<br>
				<mark>мы можем бесплатно и прямо сейчас</mark>
			</div>

			<a class="button that-hover drop-anchor" data-color="#ffffff" data-drop="#9ef3df" data-drop-offset="330">Позвоните<br>менеджеру</a>
		</section>

		<section class="obligation">
			<h2>Обязательства мы выполняем<br>стопроцентно!</h2>

			<div class="ogligation-items grid text-left">
				<article>
					<div class="icon-block">
						<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="570px" height="590px" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
						viewBox="0 0 1168 1209"
						 xmlns:xlink="http://www.w3.org/1999/xlink">
						 <defs>
						  <style type="text/css">
						   <![CDATA[
						    .str0 {stroke:#2B2A29;stroke-width:12.1061;stroke-linecap:round;stroke-linejoin:round}
						    .fil0 {fill:none}
						    .fil1 {fill:#2B2A29;fill-rule:nonzero}
						   ]]>
						  </style>
						 </defs>
						 <g id="Слой_x0020_1">
						  <metadata id="CorelCorpID_0Corel-Layer"/>
						  <path class="fil0 str0" d="M686 34c271,48 476,285 476,569 0,282 -202,517 -469,568m-226 -2c-263,-54 -461,-287 -461,-566 0,-278 196,-510 457,-565"/>
						  <polyline class="fil0 str0" points="410,6 464,38 430,94 "/>
						  <polyline class="fil0 str0" points="747,1203 693,1171 727,1115 "/>
						  <path class="fil1" d="M462 260c27,0 48,8 64,24 16,16 23,37 23,62 0,24 -4,45 -13,65 -9,20 -24,41 -43,65 -20,24 -53,61 -100,112l166 0 -3 17 -184 0 0 -17c48,-52 82,-90 103,-115 20,-26 35,-47 44,-66 8,-18 12,-38 12,-59 0,-22 -6,-40 -18,-53 -13,-13 -30,-19 -52,-19 -32,0 -58,13 -79,39l-14 -9c14,-16 28,-27 43,-35 15,-7 32,-11 51,-11zm318 252l0 93 -17 0 0 -93 -151 0 0 -14 105 -238 14 6 -100 230 132 0 2 -105 15 0 0 105 47 0 0 16 -47 0z"/>
						  <path class="fil1" d="M387 897l-14 0 0 -74c-6,6 -13,11 -21,15 -9,4 -18,6 -29,6 -13,0 -24,-4 -32,-11 -8,-7 -13,-17 -13,-31l0 -60 14 0 0 58c0,22 12,32 34,32 10,0 19,-2 27,-6 8,-4 15,-10 20,-16l0 -68 14 0 0 155zm159 -34c0,9 1,15 3,19 2,4 5,7 10,8l-3 10c-7,-2 -12,-5 -16,-9 -3,-4 -5,-10 -6,-18 -11,18 -28,27 -49,27 -15,0 -26,-4 -35,-12 -8,-9 -13,-20 -13,-34 0,-16 6,-28 17,-37 11,-9 27,-13 46,-13l32 0 0 -16c0,-13 -3,-22 -9,-28 -5,-6 -15,-9 -28,-9 -13,0 -27,3 -42,9l-4 -11c17,-7 33,-10 47,-10 17,0 30,4 38,12 8,8 12,20 12,36l0 76zm-59 26c20,0 35,-10 45,-30l0 -44 -30 0c-16,0 -28,3 -37,10 -9,6 -13,16 -13,29 0,11 3,19 9,25 6,7 15,10 26,10zm176 -150c8,0 16,1 23,3 7,3 13,7 19,12l-7 9c-5,-4 -10,-7 -16,-9 -5,-2 -11,-3 -19,-3 -15,0 -27,6 -37,18 -9,11 -13,29 -13,51 0,22 4,39 13,51 9,11 22,17 37,17 7,0 14,-1 20,-4 6,-2 11,-5 16,-10l8 10c-13,11 -27,16 -44,16 -13,0 -24,-3 -34,-9 -10,-7 -18,-16 -23,-28 -5,-12 -8,-26 -8,-43 0,-16 3,-31 8,-43 5,-12 13,-22 23,-28 9,-7 21,-10 34,-10zm180 124c0,9 1,15 3,19 2,4 6,7 10,8l-3 10c-7,-2 -12,-5 -15,-9 -4,-4 -6,-10 -7,-18 -11,18 -27,27 -49,27 -15,0 -26,-4 -35,-12 -8,-9 -12,-20 -12,-34 0,-16 5,-28 16,-37 12,-9 27,-13 47,-13l31 0 0 -16c0,-13 -2,-22 -8,-28 -6,-6 -16,-9 -29,-9 -12,0 -26,3 -42,9l-4 -11c17,-7 33,-10 47,-10 17,0 30,4 38,12 8,8 12,20 12,36l0 76zm-59 26c20,0 35,-10 45,-30l0 -44 -29 0c-17,0 -29,3 -38,10 -9,6 -13,16 -13,29 0,11 3,19 9,25 6,7 15,10 26,10z"/>
						 </g>
						</svg>
					</div>
					<h4>Работаем оперативно</h4>
					<p class="text">подаем транспорт<br>круглосуточно</p>
				</article>
				<article>
					<div class="icon-block">
						<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="840px" height="544px" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
						viewBox="0 0 3029 1962"
						 xmlns:xlink="http://www.w3.org/1999/xlink">
						 <defs>
						  <style type="text/css">
						   <![CDATA[
						    .str0 {stroke:#2B2A29;stroke-width:21.2847;stroke-linecap:round;stroke-linejoin:round}
						    .fil0 {fill:none}
						   ]]>
						  </style>
						 </defs>
						 <g id="Слой_x0020_1">
						  <metadata id="CorelCorpID_0Corel-Layer"/>
						  <path class="fil0 str0" d="M2025 755c20,-57 31,-119 31,-183 0,-310 -251,-561 -561,-561 -310,0 -561,251 -561,561 0,72 13,140 38,203l0 0c43,147 218,376 351,578 134,202 123,323 175,323 53,0 29,-101 166,-325 137,-223 309,-428 361,-596 0,0 0,0 0,0z"/>
						  <circle class="fil0 str0" cx="363" cy="1483" r="106"/>
						  <path class="fil0 str0" d="M11 1586c0,0 87,-52 244,-91m210 -35c219,-21 508,1 847,141 30,12 59,25 88,37m199 78c411,153 702,199 981,152m207 -51c75,-25 152,-56 231,-92"/>
						  <path class="fil0 str0" d="M1583 1612c13,18 21,40 21,64 0,58 -47,105 -106,105 -58,0 -105,-47 -105,-105 0,-26 9,-49 23,-67"/>
						  <circle class="fil0 str0" cx="2684" cy="1846" r="106"/>
						  <circle class="fil0 str0" cx="1502" cy="570" r="257"/>
						 </g>
						</svg>
					</div>
					<h4>Предлагаем оптимальный маршрут</h4>
					<p class="text">экономя Ваши средства</p>
				</article>
				<article>
					<div class="icon-block">
						<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="552px" height="521px" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
						viewBox="0 0 1187 1120"
						 xmlns:xlink="http://www.w3.org/1999/xlink">
						 <defs>
						  <style type="text/css">
						   <![CDATA[
						    .str0 {stroke:#2B2A29;stroke-width:12.6949;stroke-linecap:round;stroke-linejoin:round}
						    .fil0 {fill:none}
						   ]]>
						  </style>
						 </defs>
						 <g id="Слой_x0020_1">
						  <metadata id="CorelCorpID_0Corel-Layer"/>
						  <g id="_842400560">
						   <path class="fil0 str0" d="M384 1114l-158 0 0 0 -147 0 0 0 4 0c39,0 70,-31 70,-70l0 -46 0 0 0 -922c0,-38 31,-70 69,-70l19 0m633 118l0 386"/>
						   <path class="fil0 str0" d="M1029 124l-718 0 0 -48c0,-38 -31,-70 -70,-70l718 0c39,0 70,32 70,70l0 48z"/>
						   <path class="fil0 str0" d="M6 998l147 0 0 46c0,39 -31,70 -70,70l-7 0c-38,0 -70,-31 -70,-70l0 -46z"/>
						   <circle class="fil0 str0" cx="536" cy="882" r="77"/>
						   <path class="fil0 str0" d="M614 882l0 204 -76 -49 -79 49 0 -204c0,43 35,78 77,78 43,0 78,-35 78,-78z"/>
						   <line class="fil0 str0" x1="683" y1="1112" x2="727" y2= "1112" />
						   <rect class="fil0 str0" x="800" y="582" width="380" height="529"/>
						   <line class="fil0 str0" x1="291" y1="560" x2="549" y2= "302" />
						   <circle class="fil0 str0" cx="328" cy="334" r="56"/>
						   <circle class="fil0 str0" cx="518" cy="522" r="56"/>
						   <line class="fil0 str0" x1="256" y1="656" x2="744" y2= "656" />
						   <line class="fil0 str0" x1="256" y1="730" x2="744" y2= "730" />
						   <line class="fil0 str0" x1="634" y1="275" x2="764" y2= "275" />
						   <line class="fil0 str0" x1="634" y1="351" x2="764" y2= "351" />
						   <line class="fil0 str0" x1="634" y1="428" x2="764" y2= "428" />
						   <line class="fil0 str0" x1="634" y1="503" x2="764" y2= "503" />
						   <line class="fil0 str0" x1="634" y1="581" x2="747" y2= "581" />
						   <circle class="fil0 str0" cx="1048" cy="374" r="99"/>
						   <line class="fil0 str0" x1="1048" y1="349" x2="1048" y2= "399" />
						   <rect class="fil0 str0" x="878" y="657" width="230.879" height="75.9363"/>
						   <g>
						    <rect class="fil0 str0" x="872" y="801" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="948" y="801" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="1024" y="801" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="1100" y="801" width="14.9573" height="14.9573"/>
						   </g>
						   <g>
						    <rect class="fil0 str0" x="872" y="876" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="948" y="876" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="1024" y="876" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="1100" y="876" width="14.9573" height="14.9573"/>
						   </g>
						   <g>
						    <rect class="fil0 str0" x="872" y="950" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="948" y="950" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="1024" y="950" width="14.9573" height="14.9573"/>
						   </g>
						   <rect class="fil0 str0" x="1100" y="950" width="14.9573" height="92.4277"/>
						   <g>
						    <rect class="fil0 str0" x="872" y="1028" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="948" y="1028" width="14.9573" height="14.9573"/>
						    <rect class="fil0 str0" x="1024" y="1028" width="14.9573" height="14.9573"/>
						   </g>
						  </g>
						 </g>
						</svg>
					</div>
					<h4>Соблюдаем букву закона</h4>
					<p class="text">успешно взаимодействуем с контролирующими органами<br><br>предоставляем разрешение на перевозку (ДОЛОГ) и полный комплект сопроводительных документов</p>
				</article>
			</div>
		</section>

		<section class="guarantee drop-move" data-drop-offset="50" data-drop-over="100">
			<h2>Груз будет там, где надо,<br>точно в срок!</h2>

			<div class="grid text-left">
				<div class="thread">
					<article class="inline-block">
						<p class="lead">Гарантии тверже,<br>чем сталь:</p>
					</article>

					<article class="inline-block"><img src="images/arrows/step-right.png"></article>

					<article class="inline-block">
						<p>Собственный<br>автопарк<br>спецтехники</p>
					</article>

					<article class="inline-block"><img src="images/arrows/step-right.png"></article>

					<article class="inline-block">
						<p>Высокие<br>корпоративные<br>стандарты</p>
					</article>
					
					<article class="inline-block"><img src="images/arrows/step-right.png"></article>

					<article class="inline-block">
						<p>Многоуровневая<br>система<br>контроля<br>качества услуг</p>
					</article>
				</div>

				<div class="questions-text">
					<p class="mid-text">Есть вопросы?<br>Мы позвоним и разъясним все подробности!</p>
				</div>

				<div class="input-line input-line-inline">
					<input type="text" placeholder="Напишите Ваше имя">
					<input type="text" placeholder="Ваш телефон">
					<a class="button form-button">Отправить</a>

					<hr class="input-line-active">
				</div>
			</div>

			<div class="guarantee-float-text">
				<mark>Мы перезвоним через несколько минут!</mark>
			</div>
		</section>

		<section class="steps" data-color="#ffffff,#bbc3c6">
			<h2>Мы работаем четко и точно!</h2>

			<ul class="steps-list">
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step0.png" alt="менеджер">
					</div>
					<div class="steps-wrapper">
						<a class="button that-hover">Вы звоните<br>нашему<br>менеджеру</a>
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step1.png" alt="заявка">
					</div>
					<div class="steps-wrapper">
						<h4>Направляете заявку<br>на транспортировку</h4>
						форма откроется <a class="button button-small that-hover">здесь</a>
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step2.png" alt="авто">
					</div>
					<div class="steps-wrapper">
						<h4>Подбираете автоцистерну</h4>
						вместимостью от 5 до 46 кубометров
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step3.png" alt="маршрут">
					</div>
					<div class="steps-wrapper">
						<h4>Мы определяемся<br>с маршрутом</h4>
						наиболее кратким и безопасным
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285" data-drop="#ffffff">
					<div class="icon-block">
						<img src="images/steps/step4.png" alt="договор">
					</div>
					<div class="steps-wrapper">
						<h4>Подписываем договор</h4>
						форма договора - <a class="button button-small">ознакомьтесь</a>
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step5.png" alt="документы">
					</div>
					<div class="steps-wrapper">
						<h4>Готовим полный<br>комплект документов</h4>
						оформленных в соответствии ДОЛОГ
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step6.png" alt="24 часа">
					</div>
					<div class="steps-wrapper">
						<h4>Подаем автоцистерну</h4>
						в любое время дня и ночи
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step7.png" alt="а-б">
					</div>
					<div class="steps-wrapper">
						<h4>Контролируем<br>перемещение груза</h4>
						на всем расстоянии<br>от пункта А в пункт Б
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step8.png" alt="безопасность">
					</div>
					<div class="steps-wrapper">
						<h4>Обеспечиваем<br>безопасность перевозки</h4>
						отчитываясь перед Вами на<br>каждом этапе пути
					</div>
				</li>
				<li class="drop-anchor" data-drop-offset="285">
					<div class="icon-block">
						<img src="images/steps/step9.png" alt="гарантия сохранности">
					</div>
					<div class="steps-wrapper">
						<h4>Гарантируем<br>сохранность груза</h4>
						то есть объема и качества
					</div>
				</li>
			</ul>
		</section>

		<section class="testimonials drop-move" data-color="#b9c1c5,#e6e9eb" data-drop-over="640">
			<h2>Нам доверяют клиенты</h2>

			<div class="background">
				<div class="clouds-layer">
					<?= $svg['cloud3']; ?>
					<?= $svg['cloud1']; ?>
					<?= $svg['cloud3']; ?>
					<?= $svg['cloud2']; ?>
					<?= $svg['cloud2']; ?>
					<?= $svg['cloud1']; ?>
					<?= $svg['cloud1']; ?>
					<?= $svg['cloud3']; ?>
					<?= $svg['cloud2']; ?>
				</div>
				<div class="elements-layer">
					<img class="image path" src="images/testimonials/path.png" alt="маршрут">
					<img class="image xo" src="images/testimonials/xo.png" alt="">
					<img class="image car" src="images/testimonials/car.png" alt="авто">
					<img class="image docs" src="images/testimonials/docs.png" alt="документы">
					<img class="image barrel" src="images/testimonials/barrel.png" alt="бочка">
					<img class="image hands" src="images/testimonials/hands.png" alt="рукопожатие">
				</div>
			</div>

			<div class="review review-0">
				<p class="name"><mark>Евгений Каргаев</mark></p>
				<p class="text text-left">Моя компания заказывала «ТРАНСНЕФТЬ» перевозку бензина в Киров. Убедился – сервис здесь на высоте. Транспорт подали тотчас же, сообщали о передвижении груза с каждого из участков пути, доставили все в пункт назначения в целости и сохранности. Будем работать и дальше</p>
			</div>

			<div class="review review-1">
				<p class="name"><mark>Леонид Марченко</mark></p>
				<p class="text text-left">Я – постоянный клиент «ТРАНСНЕФТЬ», потому что меня устраивает качество услуг и их стоимость. Не могу припомнить ни одного сбоя, произошедшего по их вине. Опасный груз – будь то ацетон, толуол или другая химия доставляются точно в срок,  документы всегда в полном порядке. Рекомендую!</p>
			</div>

			<div class="review review-2" data-color="#ffffff">
				<p class="name"><mark>Александр Норкин</mark></p>
				<p class="text text-left">Перевозка опасных грузов дело непростое, поэтому ее я заказываю транспортной компании «ТРАНСНЕФТЬ». Ей я могу доверять на все 100 процентов. Устраивает все – от профессионализма менеджеров и операторов до квалификации водителей и диапазона доставляемых химических и нефтепродуктов. Да и техника у них самая надежная – топливозаправщики и бензовозы европейского производства.
			</div>
		</section>

		<section class="contacts">
			<h2>Наши контакты</h2>

			<div class="contacts-content grid text-left">
				<div class="block inline-block">
					Юридический адрес: 
					<p class="solid">Москва<br>ул. Сущевская, 27<br>строен.2, пом.Ш, ком.3</p>
				</div>

				<div class="block inline-block">
					Фактический адрес:
					<p class="solid">Раменский район<br>с.Заворово<br>Промышленный проезд, 7</p>
				</div>

				<div class="block inline-block">
					Телефон / Факс: <strong>+7(495)745-08-47</strong>
					<br>Мобильный телефон: <strong>+7(929)9999-77-1</strong>
					<br>E-mail: <a class="button button-small">mail@trneft.ru</a>
					<br>E-mail: <a class="button button-small">logistic@perevozka-toplivo.ru</a>
				</div>
			</div>

			<div class="contacts-float-text">
				<mark>«ТРАНСНЕФТЬ» - надежная компания!</mark>
			</div>

			<div class="contacts-map">
				<div class="gradient-overlay"></div>
				<div class="google-maps"></div>
			</div>
		</section>

		<footer>
			<p class="copyright"><span class="symbol">©</span> 2016 ООО «Транснефть»</p>
			<a class="developers" target="_blank">
				<img src="images/tutmee.png" alt="TutMee">
				<span>Создание дизайна<br>и разработка сайтов<br>LTD Tutmee.ru</span>
			</a>
		</footer>
	</div>

	<div class="popup-form" style="display: none;">
		<div class="background"></div>
		<div class="input-line">
			<input type="text" placeholder="Напишите Ваше имя">
			<input type="text" placeholder="Ваш телефон">
			<a class="button form-button">Отправить</a>

			<hr class="input-line-active">
		</div>
	</div>

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?callback=initMaps" async defer></script>
	<script src="scripts/production.js"></script>
</body>
</html>