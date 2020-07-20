<?php
	session_start();

	error_reporting(E_ALL);
	ini_set("display_errors", 1);

	function myLoader($c) {
		require "../" . str_replace("\\", "/", $c) . ".php";
	}
	spl_autoload_register("myLoader");

	require "../functions.php";
	require "../link.php";
?>