<?php
namespace src\App;

class Route {
	private static $GET = [];
	private static $POST = [];

	public static function GET($url, $action, $middle = "") {
		self::$GET[] = [$url, $action, $middle];
	}

	public static function POST($url, $action, $middle = "") {
		self::$POST[] = [$url, $action, $middle];
	}

	public static function init() {
		$datas =  self::${$_SERVER["REQUEST_METHOD"]};

		$url = "/";
		if(isset($_GET['url'])) $url .= trim($_GET['url'], "/");

		foreach($datas as $data) {
			$preg = preg_replace("/\//", "\/", $data[0]);
			$preg = preg_replace("/{[^\{\}]+}/", "([^\/]+)", $preg);
			$result = preg_match("/^$preg$/", $url, $match);

			if(!$result) {
				continue;
			}

			unset($match[0]);

			if($data[2]) {
				$middleWare = new \src\App\MiddleWare();
				$middleWare->{$data[2]}(...$match);
			}

			$action = explode("@", $data[1]);
			$controllerName = "\\src\\Controller\\" . $action[0];
			$controller = new $controllerName();
			$controller->{$action[1]}(...$match);

			return;
		}
		move("/notfound");
	}
}
?>