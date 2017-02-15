<?php

// = = =

$your_mail_adress = 'your@mail.com';

// = = =

$content  = "<p>".htmlspecialchars($_POST['title'])."</p>\n";
$content .= '<table cellspacing="1" cellpadding="2" border="0">'."\n";
foreach ($_POST as $key => $value) {
	if ( ! empty($value) && $value !== 'subject') {
		$key = rewriteName( $key );
		$value = nl2br( htmlspecialchars($value) );
	    $content .= "<tr>\n\t<td valign=\"top\">".$key.":</td>\n\t<td>".$value."</td>\n</tr>";
	}
}
$content .= '</table>';

$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

$subject = $_POST['subject'];
if (empty($subject)) $subject = 'Subject';
$result = mail($your_mail_adress, $subject, $content, $headers);

if ($result) {
	echo 'Thank you for your message!';
} else {
	echo 'Sorry, we\'ve got an error...';
}

function rewriteName( $name ){
	if ($name == 'name') return 'Name';
	if ($name == 'phone') return 'Phone';
	if ($name == 'mail' || $name == 'email') return 'E-mail';
	if ($name == 'subject') return 'Subject';
	if ($name == 'message') return 'Message';
	return $name;
}

?>