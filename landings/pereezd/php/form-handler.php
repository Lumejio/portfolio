<?php
require 'PHPMailerAutoload.php';
// Заголовок письма меняем на тот, который нужен нам
$thm = "Обратная связь с " . $_SERVER['SERVER_NAME'];

if (!empty($_POST['name'])) {
    $fields .= '<tr>
                <td style="text-align: right;width: 30%; padding-top: 5px;padding-bottom: 5px;">
                    <span style="font-size: 14px; color: #999999;padding-right: 20px; display:block;">Имя:</span>
                </td>
                <td style="text-align:left;width: 70% ; padding-top: 5px;padding-bottom: 5px; vertical-align: top;">
                    <span style="font-size: 18px; color: #000000">' . $_POST['name'] . '</span>
                </td>
            </tr>';
}

if (!empty($_POST['phone'])) {
    $fields .= '<tr>
                <td style="text-align: right;width: 30%; padding-top: 5px;padding-bottom: 5px;">
                    <span style="font-size: 14px; color: #999999;padding-right: 20px; display:block;">Телефон:</span>
                </td>
                <td style="text-align:left;width: 70% ; padding-top: 5px;padding-bottom: 5px; vertical-align: top;">
                    <span style="font-size: 18px; color: #000000">' . $_POST['phone'] . '</span>
                </td>
            </tr>';
}

if (!empty($_POST['company'])) {
    $fields .= '<tr>
                <td style="text-align: right;width: 30%; padding-top: 5px;padding-bottom: 5px;">
                    <span style="font-size: 14px; color: #999999;padding-right: 20px; display:block;">Компания:</span>
                </td>
                <td style="text-align:left;width: 70% ; padding-top: 5px;padding-bottom: 5px; vertical-align: top;">
                    <span style="font-size: 18px; color: #000000">' . $_POST['company'] . '</span>
                </td>
            </tr>';
}


//Само письмо (отправляется администратору)
//Вместо самого первого $_SERVER['SERVER_NAME'] должен стоять логотип компании

$msg = '<table style="width: 600px; margin:0 auto;background-image: url(http://tutmee.ru/images/main-bg.jpg);background-repeat:repeat-y ;background-position: top center; border-spacing: 0; " cellspacing="0" cellpadding="0">
            <tr>
                <td style="font-family:tahoma;">
                    <table style="width: 600px; margin: 0 auto" cellspacing="0" cellpadding="0">
                        <tr>
                            <td>
                                <table style=" margin: 0 auto;width: 179px;" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="text-align: center; padding-top: 30px">
                                            <img alt="' . $_SERVER['SERVER_NAME'] . '" src="http://' . $_SERVER['SERVER_NAME'] . '/images/logo.png" />
                                        </td>
                                    </tr>
                                </table>
                            </td> 
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table style="margin: 0 auto; width: 350px; border-bottom: 1px solid #C7C7C7;font-family: Tahoma" cellspacing="0" cellpadding="0">
                        <tr>
                            <td style="text-align: center; font-size: 30px;font-weight: 100; text-transform: uppercase;padding-top: 40px;">
                                <span>Заявка</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center; font-size: 18px;font-weight: 100;padding-bottom: 12px">
                                <span>от</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table style="font-family: Tahoma;border-top: 1px solid #ffffff;margin: 0 auto;width: 350px;" cellspacing="0" cellpadding="0">
                        ' . $fields . '
                    </table>
                </td>
            </tr>
            ' . $comment . '
        </table>
        <table style="width: 600px; margin: 0 auto;background-image: url(http://tutmee.ru/images/t2-bg.jpg);background-repeat:  no-repeat; height: 457px;background-position: bottom center;" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="vertical-align: bottom;">
                    <table style="width: 486px; border-bottom:1px solid #C7C7C7;margin: 0 auto; height: 1px" cellspacing="0" cellpadding="0" ></table>
                </td>
            </tr>
            <tr>
                <td style="vertical-align: top">
                    <table style="width: 486px; border-top:1px solid #ffffff;margin: 0 auto;" cellspacing="0" cellpadding="0">
                        <tr>
                            <td style="vertical-align: top;text-align: center; padding-top: 12px;">
                                <a href="http://tutmee.ru/" style="text-align: left; font-size: 12px; font-family: Arial;color: #AAAAAA;text-decoration: none;display: inline-block;">
                                    <img src="http://tutmee.ru/images/dev-logo.png" alt="TutMee Создание дизайна и разработка сайтов LTD Tutmee.ru"><br/>                        
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        ';

$mail = new PHPMailer();
$mail->isSMTP();
$mail->IsHTML(true);
$mail->CharSet = "utf8";
$mail->Host = "smtp.yandex.ru";
$mail->SMTPSecure = 'ssl';
$mail->Port = 465; 
$mail->SMTPAuth = true;
$mail->Username = "noreply@tutmee.ru";
$mail->Password = "CsKHUvx9sya7mztZMzlO";
$mail->setFrom($mail->Username);
$mail->addAddress('pereezd@list.ru'); // кому - адрес, Имя
$mail->addAddress('mail@tutmee.ru'); // кому - адрес, Имя
// $mail->addAddress('test@idope.ru'); // кому - адрес, Имя

$mail->Subject = $thm;
$mail->Body = $msg;
$nameFile = 'files';
if (isset($_FILES[$nameFile]['name'])) {
    for ($k = 0; $k < count($_FILES[$nameFile]['name']); $k++) {
        if ($_FILES[$nameFile]['name'][$k]['error'] == 0) {
            $mail->AddAttachment($_FILES[$nameFile]['tmp_name'][$k], $_FILES[$nameFile]['name'][$k]);
        } else {
            $msg .= "Ошибка при отправке файла" . $_FILES[$nameFile]['error'][$k];
        }
    }
}
if (!$mail->Send()) die('Mailer Error: ' . $mail->ErrorInfo);