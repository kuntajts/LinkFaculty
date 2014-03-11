<?php
    $conx = mysql_connect("localhost:/tmp/mysql.sock", "cs205user", "ithaca");
    if (!$conx) {echo "yo"; die('Could not connect: ' . mysql_error());}
    mysql_select_db("schoolDB_Linc");

	$query = "SELECT * FROM Names";
	$result = mysql_query($query);


	$arr = array();
	while($row = mysql_fetch_array($result)) {
		//echo $row['ID']." ".$row['name'];
		//echo "<br>";
		$newarr = array('id'=>$row['ID'], 'name' => $row['name']);
		array_push($arr, $newarr);
	}

	/*$row = mysql_fetch_array($result);*/
	echo json_encode($arr);
?>


