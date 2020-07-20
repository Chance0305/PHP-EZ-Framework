<?php
namespace src\Controller;

use src\App\DB;

class MainController {
	public function index() {
		view("index");
	}

	public function notfound() {
		view("notfound");
	}
}