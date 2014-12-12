<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.min.js"></script>
	<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
	<script type="text/javascript" src="script.js"></script>
	<link rel="stylesheet" href="style.css">
	<title>Expressions Query History</title>
</head>
<body>
<div class="wrapper" id="wrapper">
	<div class="header" id="header">
		<table cellspacing="5">
			<tr>
				<th>Menu: <a href="/">Rational Expressions</a></th>
				<th><a href="/history_list.php"> Query History List </a></th>
				<th><a href="/square.html"> Square Diff Formula </a></th>
			</tr>
		</table>
	</div>
	<div class="body" id="body">
		<p>Query History List Paging</p>
		<table id="history_table" border="1" cellspacing="5">
		<tr>
		    <th>Expression</th>
		    <th>Result Status</th>
		    <th colspan="2">Result</th>
		</tr>
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
			$p = (int)$p;
			$offset = ($p-1)*$limit;
			$q = "SELECT * FROM `history` ORDER BY `id` DESC LIMIT ".$offset.",".$limit.";";
			$rows = $mysqli->query($q);
			while( $row = mysqli_fetch_assoc($rows) ){
				$id = $row['id'];
				$type = $row['type'];
				$expr = $row['expr'];
				$result_type = $row['result_type'];
				$result = $row['result'];
		        switch ($type) {
		        	case 'graph':
		        		if ($result_type == "success"){
		        			echo "<tr><td>$expr</td><td>Success</td><td><a href=\"/tex/".$id.".tex\">Tex File</a></td><td><a href=\"/tex/".$id.".pdf\">PDF File</a></td></tr>";
		        		} else {
		        			echo "<tr><td>$expr</td><td>Success</td><td colspan=\"2\">Error: $result</td></tr>";
		        		}
		        		break;
		        	
		        	case 'square':
		        		# code...
		        		break;
		        	

		        	default:
		        		# code...
		        		break;
		        }
		    } 
		?>
		</table>
		<?php
		echo "<a href=\"/history_list.php?p=".(string)($p+1)."\">Next Page</a>";
		?>
	</div>
	<div class="footer" id="footer">

	</div>
</div>
</body>
</html>