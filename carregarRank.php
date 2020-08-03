<?php
$user='root';
$pass='';
$host='localhost';

$banco='facebook2018s2';

$conexao = new mysqli($host, $user, $pass, $banco);

$ids=$_POST['ids'];

$sql="SELECT idusuario, score FROM scores WHERE idusuario in ($ids) ORDER BY score DESC LIMIT 4";

$r=$conexao->query($sql);

$rank=array();
$i=0;
while($linha=$r->fetch_assoc())
{
	$rank[$i++]=$linha;
}

echo json_encode($rank);

?>