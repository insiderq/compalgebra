<?php
	$mysqli = new mysqli("localhost", "root", "pass", "compalgebra");
	if ($mysqli->connect_errno) {
    	echo "Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
	}
	echo $mysqli->host_info . "\n";
?>