<html>
<head>

<script>
<?php
if(isset($_GET['desafio']))
{
	echo "var desafio={$_GET['desafio']};";
}
else
{
	echo "var desafio=false;";
}
?>
var idusuario=null;
var id_nome=[];
var scorelocal=[];

  window.fbAsyncInit = function() {
    FB.init({
      appId            : '244955016367327',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v3.1'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/pt_BR/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
   
   function logou(resp){
		console.log(resp);
		
		if(resp.authResponse)
		{
			idusuario=resp.authResponse.userID;
			id_nome[idusuario]='EU';
			//alert('Bem Vindo');
			
			start();
			pegarRanking();
		}else{
			alert('erro');
			}
   }
   function logar()
   {
		FB.login(logou, {scope:'user_friends,user_photos,user_location'});
   }
   
   function logar2()
    {
		FB.login(function (resp){
			alert('funciona!!');
		});
	
	}

	function getMousePos(canvas, event) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
	}

	function respostaNome(dados)
	{
		var msgs = document.getElementById('msgs');
		console.log(dados);
		msgs.innerHTML = dados.first_name;
		var foto = new Image();
		foto.src = dados.picture.data.url;
		msgs.append(foto);
	}
	
	function mostrarNome()
	{
		FB.api('/me','get',{fields:'first_name,last_name,picture'},respostaNome);
	}
	
	function respComp(dados)
	{
		if(dados.error_message)
		{
			alert('Erro: ' + dados.error_message);
			
		}
		else
		{
			alert('postou');
		}
	}
	
	function compartilhar()
	{
		//gerarDesafio()
		FB.ui({method:'feed', link:'https://www.google.com.br'}, respComp);
	}
	
	function mostrarAmigos()
	{
		FB.api('me/friends','get',{fields:'name,picture'},function (dados){
		var msgs = document.getElementById('msgs');
		msgs.innerHTML='';
		canvas = document.getElementById('canvas1');
		ctx = canvas.getContext('2d');
		ctx.fillStyle = 'pink';
		ctx.font = '15px Arial';
		//var foto = new Image();
			for(i = 0; i < dados.data.length; i++)
			{
				var foto = new Image();
				var img = new Image();
				msgs.innerHTML += dados.data[i].name + "<br/>";
				ctx.fillText(dados.data[i].name, 50, 40 + (i * 50));
				foto.src += dados.data[i].picture.data.url;
				img.i=i;
				img.onload = function(){
					console.log(this.i);
					ctx.drawImage(this, 0, 0 + (this.i * 50));
				};
				img.src = dados.data[i].picture.data.url;
				msgs.append(foto);
				msgs.innerHTML += "<br/>";
			}
		});
	}
	
	function posMorte()
	{
		canvas = document.getElementById('canvas1');
		ctx = canvas.getContext('2d');
		ctx.fillStyle = 'pink';
		ctx.fillRect(0, 0, 600, 600);
		ctx.fillStyle = 'rgb(51, 153, 255)';
		ctx.fillRect(75, 265, 75, 50);
		ctx.fillStyle = 'black';
		ctx.font = '24px Arial'
		ctx.fillText('Restart', 150, 300);
		canvas.addEventListener('click', function(evt) {
			var mousePos = getMousePos(canvas, evt);
			var rect =	{
			x:75,
			y:265,
			width:75,
			height:50
			};

			if (isInside(mousePos,rect)) {
				start();
				//alert('clicked inside rect');
			}else{
				//alert('clicked outside rect');
			}   
		}, false);
		ctx.fillStyle = 'rgb(51, 153, 255)';
		ctx.fillRect(425, 265, 75, 50);
		ctx.fillStyle = 'black';
		ctx.font = '24px Arial'
		ctx.fillText('Scores', 500, 300);
		canvas.addEventListener('click', function(evt) {
			var mousePos = getMousePos(canvas, evt);
			var rect =	{
			x:425,
			y:265,
			width:75,
			height:50
			};

			if (isInside(mousePos,rect)) {
				//pegarRanking();
				mostrarRanking();
				//alert('clicked inside scores');
			}else{
				//alert('clicked outside rect');
			}   
		}, false);
	}

	function mostrarRanking()
	{
		//pegarRanking();
		//canvas = document.getElementById('canvas1');
		//ctx = canvas.getContext('2d');
		//tela branca
		ctx.fillStyle = 'White';
		ctx.fillRect(25, 25, 550, 550);
		//scores
		ctx.fillStyle = 'Black';
		ctx.font = '36px Arial'
		ctx.fillText('Scores', 300, 75);
		ctx.font = '24px Arial'
		ctx.fillText('Sua pontuação: ', 215, 150);
		ctx.fillText(score, 275, 150);
		ctx.font = '36px Arial'
		ctx.fillText('High Scores', 350, 250);
		ctx.font = '24px Arial'
		for(var i = 0; i < 4; i++)
		{
			ctx.fillText(scorelocal[i], 250, (300 + i * 50));
		}
		//botao de voltar
		ctx.fillStyle = 'rgb(51, 153, 255)';
		ctx.fillRect(250, 500, 75, 50);
		ctx.fillStyle = 'black';
		ctx.font = '24px Arial'
		ctx.fillText('Restart', 325, 530);
		canvas.addEventListener('click', function(evt) {
			var mousePos = getMousePos(canvas, evt);
			var rect =	{
			x:250,
			y:500,
			width:75,
			height:50
			};

			if (isInside(mousePos,rect)) {
				start();
				//alert('clicked inside scores');
			}else{
				//alert('clicked outside rect');
			}   
		}, false);
	}
	
	function salvarScore(idUsu,score)
	{
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if(this.readyState==4 && this.status==200)
			{
				alert(this.responseText);
			}
		}
	
	
		var dados = "idusuario="+idUsu;
		dados+="&score="+score;
		xmlhttp.open("GET","insereScore.php?"+dados,true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send();
	}
	
	function salvar(score)
	{
		//var score=document.getElementById('score').value;
		salvarScore(idusuario,score);
	}
	
	function ranking(ids)
	{
		var xmlhttp=new XMLHttpRequest();
		xmlhttp.onreadystatechange=function()
		{
			if(this.readyState==4 && this.status==200)
			{
				var dados=eval(this.responseText);
				for(var i=0; i < dados.length; i++)
				{
					nome=id_nome[dados[i].idusuario];
					//alert('idusuario: '+dados[i].idusuario+' score: '+dados[i].score);
					scorelocal[i]=dados[i].score;
				}
			}
		}
		xmlhttp.open("POST","carregarRank.php",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send("ids="+ids);
	}
	
	function pegarRanking()
	{
		FB.api('me/friends', 'get',{fields:'id,name'},
			function(dados){
				var ids=idusuario;
			
				for(var i=0; i < dados.data.length; i++)
				{
					ids+=','+dados.data[i].id;
					id_nome[dados.data[i].id]=dados.data[i].name;
					
				}
				ranking(ids);
				console.log(ids);
			});
	}
	
	function gerarDesafio()
	{
		var pontos=document.getElementById('score').value;
		url='https://localhost/facebook2018s2/facebook.php?desafio='+pontos;
		
		FB.ui({method:'feed',link:url},respComp);
		var msgs=document.getElementById('msgs');
		msgs.innerHTML="desafio".link(url);
	}
	
</script>
</head>

<body>
<canvas id='canvas1' width="600" height="600"></canvas>
<script src="jogo.js"></script>
<div id='msgs'></div>
<button onclick='mostrarNome()'>Nome</button>
<button onclick='logar()'>Logar</button>
<button onclick='mostrarAmigos()'>Amigos</button>
<button onclick='compartilhar()'>Compartilhar</button>
<br/>
<input type='text' id='score'/><button onclick='salvar()'>Salvar Score</button>
<button onclick='pegarRanking()'>Ranking</button>
<button onclick='gerarDesafio()'>Desafio</button>
</body>
</html>