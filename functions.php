<?php
use src\App\DB;

function view($url, $data = []) {
	extract($data);

	require "../src/View/master/header.php";
	require "../src/View/$url.php";
	require "../src/View/master/footer.php";
}

function move($url, $msg = "") {
	if($msg) echo "<script>alert('$msg');</script>";
	echo "<script>location.href='$url';</script>";
	exit;
}

function back($msg = "") {
	if($msg) echo "<script>alert('$msg');</script>";
	echo "<script>history.back();</script>";
	exit;
}

user();
function user() {
	if(isset($_SESSION['user'])) {
		$user = DB::fetch("SELECT * FROM users WHERE idx = ?", [$_SESSION['user']->idx]);
		if($user) {
			return $user;
		}

		unset($_SESSION['user']);
		move("/", "로그아웃 되었습니다.");
	}

	return false;
}

function text($text, $break = false) {
	$text = htmlspecialchars($text);
	$text = str_replace(" ", "&nbsp;", $text);
	if($break) $text = str_replace("\n", "<br>", $text);

	return $text;
}

function isEmpty($arr) {
	$arr = array_map("trim", $arr);
	if(in_array("", $arr)) return true;
	else return false;
}

function dev($data) {
	echo "<pre>";
	var_dump($data);
	echo "</pre>";
	exit;
}
?>