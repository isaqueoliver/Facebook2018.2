<?php
$user='root';
$pass='';
$host='localhost';

$banco='facebook2018s2';

$conexao = new mysqli($host, $user, $pass, $banco);

$idusuario = $_GET['idusuario'];
$score = $_GET['score'];

$sql = "INSERT INTO scores values(null, ".$idusuario.", ".$score.", now())";

$resp=$conexao->query($sql);
if($resp)
{
	echo "Salvo";
}
else
{
	echo "Erro";
}
?>