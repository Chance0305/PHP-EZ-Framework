<?php
use src\App\Route;

Route::GET("/", "MainController@index");
Route::GET("/notfound", "MainController@notfound");

Route::init();