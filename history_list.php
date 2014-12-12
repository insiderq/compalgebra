<?php
	error_reporting (E_ALL);
	$mysqli = new mysqli("localhost", "root", "pass", "compalgebra");
	if ($mysqli->connect_errno) {
    	echo json_encode(array("status" => "error", "reason" => "Unable to Connect to Database"));
    	die;
	}
	$p = 1;
	$limit = 100;
	if (isset($_GET['p'])) {
		$p = $_GET['p'];
	}
	if (isset($_POST['p'])) {
		$p = $_POST['p'];
	}
	$p = int(p);
	$offset = ($p-1)*$limit;
	$rows = $mysqli->query("SELECT * FROM `history` ORDER BY `id` DESC LIMIT '".$limit."' OFFSET '".$offset."';");
	var_dump($rows);
?>