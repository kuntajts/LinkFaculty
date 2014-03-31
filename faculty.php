<?php
    
	
	/*if (isset($_POST['displayConnections'])){
		queryInfo();	
	}*/

	queryInfo();

	function queryInfo(){


		$nodes = array();
		$schoolEdges = array();
		$finalArray = schoolQuery($nodes,$schoolEdges);


		echo json_encode($finalArray, JSON_FORCE_OBJECT);
		
	}

	//School Query
	function schoolQuery($nodes,$schoolEdges) {
		$conx = mysql_connect("localhost:/tmp/mysql.sock", "cs205user", "ithaca");
	    if (!$conx) {echo "yo"; die('Could not connect: ' . mysql_error());}
	    mysql_select_db("schoolDB_Linc");

		$query = "SELECT * FROM Schools";
		$result = mysql_query($query);

		$numOfRows = mysql_num_rows($result);
		$edges = array();
		while($row = mysql_fetch_array($result)) {
			$name = $row['Schools'];
			$name = $name;

			$newNode = array("Schools".$row['ID'] => array('name' => $name, 'alone' => True));
			$nodes = array_merge($nodes, $newNode);

			$newEdge = array("Schools".$row['ID'] => array('bold' => True));
			$schoolEdges = array_merge($schoolEdges, $newEdge);
		}

		$departmentIDs = array();

		for ( $i = 0; $i < $numOfRows; $i++) {
			$query = "SELECT * FROM Departments WHERE SchoolID =".$i;
			$result = mysql_query($query);

			$departmentEdges = array();
			while($row = mysql_fetch_array($result)) {
				$name = $row['Department'];
				$name = shortenName($name);

				$newNode = array("Dpts".$row['ID'] => array('name' => $name));
				$nodes = array_merge($nodes, $newNode);

				$newEdge = array("Dpts".$row['ID'] => array());
				$departmentEdges = array_merge($departmentEdges, $newEdge);
				array_push($departmentIDs, $row['ID']);
			}

			$edges = array_merge($edges, array("Schools".$i => $departmentEdges));

		}

		/*for ( $i = 0; $i < count($departmentIDs); $i++) {
			$query = "SELECT * FROM Association WHERE DepartmentID =".$departmentIDs[$i];
			$result = mysql_query($query);
			while ($row = mysql_fetch_array($result)) {
				$query2 = "SELECT * FROM Names WHERE ID = ".$row['FacultyID']." LIMIT 1";
				$result2 = mysql_query($query2);
				$row2 = mysql_fetch_row($result2);

				$name = $row2[1];
				$newNode = array("Names".$row2[0] => array('name' => $name);
				$nodes = array_merge($nodes, $newNode);
			}
		}*/

		$allEdges = array("Ithaca College" => $schoolEdges);
		$allEdges = array_merge($allEdges, $edges);
		$finalArray = array("nodes" => $nodes, "edges" => $allEdges);

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
