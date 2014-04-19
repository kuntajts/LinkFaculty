<?php
    
	
	if (isset($_POST['displayConnections'])){
		queryInfo();	
	} else if (isset($_POST['displayFaculty'])) {
		queryFac();
	}
	//queryInfo();

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

			$newNode = array("Schools".$row['ID'] => array('name' => $name, 'alone' => "orange"));
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

				$newNode = array("Department".$row['ID'] => array('name' => $name, 'alone' => "darkblue"));
				$nodes = array_merge($nodes, $newNode);

				$newEdge = array("Department".$row['ID'] => array());
				$departmentEdges = array_merge($departmentEdges, $newEdge);
				array_push($departmentIDs, $row['ID']);
			}

			$edges = array_merge($edges, array("Schools".$i => $departmentEdges));

		}

		$allEdges = array("Ithaca College" => $schoolEdges);
		$allEdges = array_merge($allEdges, $edges);
		$finalArray = array("nodes" => $nodes, "edges" => $allEdges);

		return $finalArray;
	}

	

	function shortenName($originalName) {
		$newName = $originalName;
		$newName = preg_replace('/Department of /', '', $originalName);

		return $newName;
	}

	function getTableData() {
		$data = $_POST['displayFaculty'];
		$table = preg_replace('/[0-9]/', '', $data);
		$id = preg_replace('/[a-z]/', '', $data);
		$id = preg_replace('/[A-Z]/', '', $id);

		$result = array($table, $id);

		return $result;
	}

	function queryFac() {
		$tableData = getTableData();
		$conx = mysql_connect("localhost:/tmp/mysql.sock", "cs205user", "ithaca");
	    if (!$conx) {echo "yo"; die('Could not connect: ' . mysql_error());}
	    mysql_select_db("schoolDB_Linc");

	    $query = "SELECT * FROM Association WHERE ".$tableData[0]."ID = ".$tableData[1];
		$result = mysql_query($query);
		$finalArray = array();
		$edges = array();
		$facultyEdges = array();
		$nodes = array();
		$faculty = array();

		$nodes = array_merge($nodes, array($_POST['displayFaculty'] => array('name' => $_POST['sourceName'], 'alone' => $_POST['sourceAlone'])));

		while ($row = mysql_fetch_array($result)) {
			array_push($faculty, ($row['FacultyID']));
		}

		for($i = 0; $i < count($faculty); $i++) {
			$query = "SELECT * FROM Faculty WHERE ID = ".$faculty[$i]." LIMIT 1";
			$result = mysql_query($query);

			while($row = mysql_fetch_array($result)) {
				$name = $row['name'];
				$newNode = array("Faculty".$row['ID'] => array('name' => $name, 'alone' => "green"));
				$nodes = array_merge($nodes, $newNode);

				$newEdge = array("Faculty".$row['ID'] => array());
				$facultyEdges = array_merge($facultyEdges, $newEdge);
			}	
			
		}
		$edges = array($_POST['displayFaculty'] => $facultyEdges);
		$finalArray = array("nodes" => $nodes, "edges" => $edges);
		
		echo json_encode($finalArray, JSON_FORCE_OBJECT);
	}
	
?>
