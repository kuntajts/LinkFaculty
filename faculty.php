<?php
    $conx = mysql_connect("localhost:/tmp/mysql.sock", "cs205user", "ithaca");
    if (!$conx) {echo "yo"; die('Could not connect: ' . mysql_error());}
    mysql_select_db("schoolDB_Linc");

	$query = "SELECT * FROM Schools";
	$result = mysql_query($query);

	//unique id is 
	$nodes = array();
	$edges = array();
	while($row = mysql_fetch_array($result)) {
		$newarr = array("Schools".$row['ID'] => array('name' => $row['Schools']));
		$nodes = array_merge($nodes, $newarr);
		$newarr = array("Schools".$row['ID'] => array());
		$edges = array_merge($edges, $newarr);
	}

	$arr2 = array("nodes" => $nodes, "edges" => array("Ithaca College" => $edges));

	
	echo json_encode($arr2, JSON_FORCE_OBJECT);
?>
