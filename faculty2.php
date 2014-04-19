<?php
    
	
	/*if (isset($_POST['displayConnections'])){
		queryInfo();	
	}*/

	queryInfo();

	function queryInfo(){

		$nodes = array("nodes" => array(array("id" => "Ithaca College", "label" => "Ithaca College", "x" => 1, "y" => 3, "size" => 3)));
		$edges = array("edges" => array());

		$finalArray = schoolQuery($nodes, $edges);

		/*$my_file = 'file.json';
		$handle = fopen($my_file, 'w') or die('Cannot open file:  '.$my_file); //implicitly creates file

		fwrite($handle, json_encode($finalArray));
		fclose($handle);*/
		echo json_encode($finalArray);
		
	}

	//School Query
	function schoolQuery($nodes, $edges) {
		$conx = mysql_connect("localhost:/tmp/mysql.sock", "cs205user", "ithaca");
	    if (!$conx) {echo "yo"; die('Could not connect: ' . mysql_error());}
	    mysql_select_db("schoolDB_Linc");

		$query = "SELECT * FROM Schools";
		$result = mysql_query($query);
		$i = 5;

		while($row = mysql_fetch_array($result)) {
			$name = $row['Schools'];
			$name = $name;

			$newNode = array("id" => "Schools".$row['ID'], "label" => $name, "x" => $i, "y" => ($i+2), "size" => 3);
			array_push($nodes["nodes"], $newNode);

			$newEdge = array("id" => "Edge".$row['ID'], "source" => "Ithaca College", "target" => "Schools".$row['ID']);
			array_push($edges["edges"], $newEdge);
			$i++;
		}

		$finalArray = array_merge($nodes, $edges);

		return $finalArray;
	}

	

	function shortenName($originalName) {
		$newName = $originalName;
		if (strlen($originalName) > 30) {
			$newName = preg_replace('/[a-z]/', '', $originalName);
		}

		return $newName;
	}
	
?>