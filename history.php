<?php
	error_reporting (E_ALL);
	$mysqli = new mysqli("localhost", "root", "pass", "compalgebra");
	if ($mysqli->connect_errno) {
    	echo json_encode(array("status" => "error", "reason" => "Unable to Connect to Database"));
    	die;
	}
	$type = null;
	$expr = null;
	$result_type = null;
	$result = null;
	if (isset($_POST["type"])){
		$type = $_POST["type"];
	}
	if (isset($_GET["type"])){
		$type = $_GET["type"];
	}
	if (isset($_POST["expr"])){
		$expr = $_POST["expr"];
	}
	if (isset($_GET["expr"])){
		$expr = $_GET["expr"];
	}
	if (isset($_POST["result_type"])){
		$result_type = $_POST["result_type"];
	}
	if (isset($_GET["result_type"])){
		$result_type = $_GET["result_type"];
	}
	if (isset($_POST["result"])){
		$result = $_POST["result"];
	}
	if (isset($_GET["result"])){
		$result = $_GET["result"];
	}
	if ($type === null or $expr === null or $result_type === null or $result === null){
		echo json_encode(array("status" => "error", "reason" => "Not All Arguments are Passed"));
		die;
	}
	//escaping
	$expr = $mysqli->real_escape_string($expr);
	$result = $mysqli->real_escape_string($result);
	if ($result_type != "success" and $result_type != "error"){
			echo json_encode(array("status" => "error", "reason" => "Incorrect Result Type"));
		}

	switch ($type) {
		case "graph":
			handle_graph($mysqli, $expr, $result_type, $result);
			break;
		
		case "square":
			handle_sqare($mysqli, $expr, $result_type, $result);
			break;
		default:
			echo json_encode(array("status" => "error", "reason" => "Incorrect History Type"));
			die;
	}

	function handle_graph($mysqli, $expr, $result_type, $result)
	{
		$dbresult =$mysqli->query("INSERT INTO history(type, expr, result_type, result) 
			VALUES (graph,"+$expr+","+$result_type+","+$result+")");
		var_dump($dbresult);
		echo json_encode(array("status" => "success"));
	}
	function handle_sqare($mysqli,$expr, $result_type, $result)
	{
		$dbresult =$mysqli->query("INSERT INTO history(type, expr, result_type, result) 
			VALUES (graph,"+$expr+","+$result_type+","+$result+")");
		var_dump($dbresult);
		echo json_encode(array("status" => "success"));
	}
?>