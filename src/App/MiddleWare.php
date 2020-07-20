<?php
namespace src\App;

class MiddleWare {
	public function login() {
		if(!user()) move("/login", "로그인 후 사용가능 합니다.");
	}

	public function logout() {
		if(user()) move("/", "로그아웃 후 사용가능 합니다.");
	}
}

?>