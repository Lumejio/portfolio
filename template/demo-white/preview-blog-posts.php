<?php

$indexFile = 'blog-posts.html';
$color_defined = '';

$font_main = "'Helvetica Neue', Roboto, Helvetica";
$font_headers = "'Helvetica Neue', Roboto, Helvetica";
$color = 'rgb(148, 91, 138)';
$colored_logo = 0;

if (isset($_COOKIE['preview_color'])) {
	$color_defined = $_COOKIE['preview_color'];
	setcookie('preview_color','',time()-1);
}
if ($_POST['preview']) {
	if ($_POST['preview_color']) {
		setcookie('preview_color',$_POST['preview_color'],time()+10000);
	}
	header("Location: " . $_SERVER['REQUEST_URI']);
	exit();
}

include '../preview_main.php';
?>