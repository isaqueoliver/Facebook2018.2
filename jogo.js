
    //Isaque, Liliane, Bruna, João Pedro Rossi
	
		const FPS = 30; // frames per second
        const SHIP_SIZE = 30; // altura da nave em pixels
        const TURN_SPEED = 360; // velocidade da rotação em segundos
		const METS_NUM = 5; // numero inicial dos meteoros
		const METS_SIZE = 100 // tamanho inicial dos meteoros em pixels
		const METS_SPD = 150; // velocidade maxima inicial dos meteoros
		const METS_VERT = 10; // numero medio de vertices em cada meteoro
		const METS_JAG = 0.4; // a força da irregularidade das formas (0 = nenhuma, 1 = muitas)
		const SHOW_BOUNDING = false; // mostrar ou esconder o raio da colisão
		const SHIP_EXPLODE_DUR = 0.3; // duração da explosão do jogador
		const SHIP_INV_DUR = 3; // duração da invulnerabilidade do jogador
		const SHIP_BLINK_DUR = 0.1; // duração do blink invulnerabilidade do jogador
		const LASER_MAX = 10; // numero maximo de laser na tela
		const LASER_SPD = 500; // velocidade do laser por segundo a cada pixel
		const LASER_DIST = 0.6; // a distancia maxima que o laser pode trafegar pela tela
		const LASER_EXPLODE_DUR = 0.1; // duração da explosão dos lasers
		const TEXT_FADE_TIME = 2.5; // fade time do texto
		const TEXT_SIZE = 40; // o tamanho do texto em pixels
		const GAME_LIVES = 3; // o numero de vidas do jogador
		const MET_PTS_LGE = 20; // ponto relacionado ao meteoro maior
		const MET_PTS_MED = 50; // ponto relacionado ao meteoro medio
		const MET_PTS_SML = 100; // ponto relacionado ao meteoro menor
		

        /** @type {HTMLCanvasElement} */
        //codigo para iniciar o jogo
		var canv=document.getElementById('canvas1');
		var ctx=canv.getContext("2d"); 
        
		
		// Os parametros do jogo
		var level, lives, mets, score, ship, text, textAlpha;
		newGame();

        // configurar os eventos
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);
		
		function createMeteoroBelt()
		{
			mets = [];
			var x, y;
			for (var i = 0; i < METS_NUM + level; i++)
			{
				do{
					x = Math.floor(Math.random() * canv.width);
					y = Math.floor(Math.random() * canv.height);
				}while (distBetweenPoints(ship.x, ship.y, x, y) < METS_SIZE * 2 + ship.r);
				mets.push(newMeteoro(x, y, Math.ceil(METS_SIZE / 2)));
			}
		}
		
		function destroyMeteoro(index)
		{
			var x = mets[index].x;
			var y = mets[index].y;
			var r = mets[index].r;
			
			//dividir o meteoro em 2 quando necessario
			if(r == Math.ceil(METS_SIZE / 2))
			{
				
				mets.push(newMeteoro(x, y, Math.ceil(METS_SIZE / 4)));
				mets.push(newMeteoro(x, y, Math.ceil(METS_SIZE / 4)));
				score += MET_PTS_LGE;
			}
			else if(r == Math.ceil(METS_SIZE / 4))
			{
				mets.push(newMeteoro(x, y, Math.ceil(METS_SIZE / 8)));
				mets.push(newMeteoro(x, y, Math.ceil(METS_SIZE / 8)));
				score += MET_PTS_MED;
			}
			else
			{
				score += MET_PTS_SML;
			}
			
			//destruir o meteoro
			mets.splice(index, 1);
			
			//novo level quando não tiver mais meteoros
			if(mets.length == 0)
			{
				level++;
				newLevel();
			}
		}
		
		function distBetweenPoints(x1, y1, x2, y2)
		{
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		}
		
		function drawShip(x, y, a, colour = "white")
		{
			ctx.strokeStyle = colour;
			ctx.lineWidth = SHIP_SIZE / 20;
			ctx.beginPath();
			ctx.moveTo( // ponta da nave
				x + 4 / 3 * ship.r * Math.cos(a),
				y - 4 / 3 * ship.r * Math.sin(a)
			);
			ctx.lineTo( // lado esquerda
				x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
				y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
			);
			ctx.lineTo( // lado direita
				x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
				y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
			);
			ctx.closePath();
			ctx.stroke();
		}
		
		function explodeShip()
		{
			ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
		}
		
		function stop()
		{
			clearInterval(loop);
		}
		
		function start()
		{
			loop = setInterval(update, 1000 / FPS);
		}
		
		function gameOver()
		{
			ship.dead = true;
			text = "Game Over";
			textAlpha = 1.0;
			salvar(score);
			stop();
			//compartilhar();
			gerarDesafio();
			posMorte();
		}

        // Setar o update


        function keyDown(/** @type {KeyboardEvent} */ ev) {
			
			if(ship.dead)
			{
				return;
			}
			
            switch(ev.keyCode) {				
				case 32: // space bar (atirar laser)
                    shootLaser();
                    break;
                case 37: // left arrow (rotacionar a nave para a esquerda)
                    ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
                    break;
                case 39: // right arrow (rotacionar a nave para a direita)
                    ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
                    break;
            }
        }

        function keyUp(/** @type {KeyboardEvent} */ ev) {
			
			if(ship.dead)
			{
				return;
			}
			
            switch(ev.keyCode) {
				case 32: // space bar (permite atirar de novo)
                    ship.canShoot = true;
                    break;
                case 37: // left arrow (parar a rotação para a esquerda)
                    ship.rot = 0;
                    break;
                case 39: // right arrow (parar rotação para a direita)
                    ship.rot = 0;
                    break;
            }
        }
		
		function newMeteoro(x, y, r)
		{
			var lvlMult = 1 + 0.1 * level;
			var met = {
				x: x,
				y: y,
				xv: Math.random() * METS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
				yv: Math.random() * METS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
				r: r,
				a: Math.random() * Math.PI * 2, // em radianos
				vert: Math.floor(Math.random() * (METS_VERT + 1) + METS_VERT / 2),
				offs: []
			};
			
			//criar o array de vertices
			for(var i = 0; i < met.vert; i++)
			{
				met.offs.push(Math.random() * METS_JAG * 2 + 1 - METS_JAG);
			}
			
			return met;
		}
		function newGame()
		{
			level = 0;
			lives = GAME_LIVES;
			score = 0;
			// criar a nave
			ship = newShip();
			newLevel();
		}
		
		function newLevel()
		{
			text = "Level " + (level + 1);
			textAlpha = 1.0;
			// criar os meteoros
			createMeteoroBelt();
		}
		
		function newShip()
		{
			return{
				x: canv.width / 2,
				y: canv.height / 2,
				r: SHIP_SIZE / 2,
				a: 90 / 180 * Math.PI, // converter pra radianos
				blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
				blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
				canShoot: true,
				dead: false,
				explodeTime: 0,
				lasers: [],
				rot: 0,
				thrusting: false,
				thrust: {
					x: 0,
					y: 0
				}
			}
		}
		
		function shootLaser()
		{
			//criar o laser
			if(ship.canShoot && ship.lasers.length < LASER_MAX)
			{
				ship.lasers.push(// da ponta da nave
					{
						x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
						y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
						xv: LASER_SPD * Math.cos(ship.a) / FPS,
						yv: -LASER_SPD * Math.sin(ship.a) / FPS,
						dist: 0,
						explodeTime: 0
					}
				)
			}
			
			//prevent further shooting
			ship.canShoot = false;
		}

        function update() {
			var blinkOn = ship.blinkNum % 2 == 0;
			var exploding = ship.explodeTime > 0;
			
            // desenhar o fundo
            ctx.fillStyle = "pink";
            ctx.fillRect(0, 0, canv.width, canv.height);

            // desenhar a nave triangular
			if(!exploding)
			{
				if(blinkOn && !ship.dead)
				{
					drawShip(ship.x, ship.y, ship.a);
				}
				
				// fazer os blinks
				if(ship.blinkNum > 0)
				{
					//reduzir o tempo dos blinks
					ship.blinkTime--;
					
					//reduzir o numero de blinks
					if(ship.blinkTime == 0)
					{
						ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
						ship.blinkNum--;
					}
				}
			}
			else
			{
				//desenhar a explosão
				ctx.fillStyle = "darkred";
				ctx.beginPath();
				ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
				ctx.fill();
				
				ctx.fillStyle = "red";
				ctx.beginPath();
				ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
				ctx.fill();
				
				ctx.fillStyle = "orange";
				ctx.beginPath();
				ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
				ctx.fill();
				
				ctx.fillStyle = "yellow";
				ctx.beginPath();
				ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
				ctx.fill();
				
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
				ctx.fill();
			}
			
			if(SHOW_BOUNDING)
			{
				ctx.strokeStyle = "lime";
				ctx.beginPath();
				ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
				ctx.stroke();
			}
			
			//desenhar os meteoros
			var x, y, r, a, vert, offs;
			for(var i = 0; i < mets.length; i++)
			{
				ctx.strokeStyle = "slategrey"
				ctx.lineWidth = SHIP_SIZE / 20;
			
				//pegar as propriedades do meteoro
				x = mets[i].x;
				y = mets[i].y;
				r = mets[i].r;
				a = mets[i].a;
				vert = mets[i].vert;
				offs = mets[i].offs;
				
				//começar as linhas
				ctx.beginPath();
				ctx.moveTo(
					x + r * offs[0] * Math.cos(a),
					y + r * offs[0] * Math.sin(a),
				);
				
				//desenhar os poligonos
				for(var j = 1; j < vert; j++)
				{
					ctx.lineTo(
						x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
						y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert),
					);
				}
				ctx.closePath();
				ctx.stroke();
				
				if(SHOW_BOUNDING)
				{
					ctx.strokeStyle = "lime";
					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2, false);
					ctx.stroke();
				}
			}
			
			//desenhar os lasers
			for(var i = 0; i < ship.lasers.length; i++)
			{
				if(ship.lasers[i].explodeTime == 0)
				{
					ctx.fillStyle = "salmon";
					ctx.beginPath();
					ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
					ctx.fill();
				}
				else
				{
					//desenhar a explosão
					ctx.fillStyle = "orangered";
					ctx.beginPath();
					ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
					ctx.fill();
					
					ctx.fillStyle = "salmon";
					ctx.beginPath();
					ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
					ctx.fill();
					
					ctx.fillStyle = "pink";
					ctx.beginPath();
					ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
					ctx.fill();
				}
			}
			
			//desenhar o texto no game
			if(textAlpha >= 0)
			{
				ctx.textAlign = "center";
				ctx.textBaseLine = "middle";
				ctx.fillStyle = "rgba(255, 255, 255," + textAlpha + ")";
				ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
				ctx.fillText(text, canv.width / 2, canv.height * 0.75);
				textAlpha -= (1.0 / TEXT_FADE_TIME / FPS); 
			}
			else if (ship.dead)
			{
				newGame();
			}
			
			// desenhar as vidas
			var lifeColour;
			for(var i = 0; i < lives; i++)
			{
				lifeColour = exploding && i == lives - 1 ? "red" : "white";
				drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColour);
			}
			
			// draw the score
			ctx.textAlign = "right";
			ctx.textBaseLine = "middle";
			ctx.fillStyle = "white";
			ctx.font = TEXT_SIZE + "px dejavu sans mono";
			ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);

			//Draw the desafio
			if(desafio > 0)
			{
				ctx.textAlign = "right";
				ctx.textBaseLine = "middle";
				ctx.fillStyle = "red";
				ctx.font = 24 + "px dejavu sans mono";
				ctx.fillText('Desafio a ser batido: ' + desafio, 375, SHIP_SIZE);
			}
			
			
			//detectar os hits do laser no meteoro
			var ax, ay, ar, lx, ly;
			for(var i = mets.length - 1; i >= 0; i--)
			{
				//pegar as propriedades do meteoro
				ax = mets[i].x;
				ay = mets[i].y;
				ar = mets[i].r;

				//loop nos lasers
				for(var j = ship.lasers.length - 1; j >= 0; j--)
				{
					//pegar as propriedades do laser
					lx = ship.lasers[j].x;
					ly = ship.lasers[j].y;
					
					//detectar os hits
					if(ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar)
					{
						//destruir e remover o meteoro e ativar a explosão do laser
						destroyMeteoro(i);
						//i--;
						ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
						
						break;
					}
				}
			}
			
			// checar a colisão no meteoro (quando não estiver explodindo)
			if(!exploding)
			{
				// só checar quando não estiver blinkando
				if(ship.blinkNum == 0 && !ship.dead)
				{
					for(var i = 0; i < mets.length; i++)
					{
						if(distBetweenPoints(ship.x, ship.y, mets[i].x, mets[i].y) < ship.r + mets[i].r)
						{
							explodeShip();
							destroyMeteoro(i);
							break;
						}
					}
				}

				// rotacionar a nave
				ship.a += ship.rot;
			}
			else
			{
				ship.explodeTime--;
				
				if(ship.explodeTime == 0)
				{
					lives--;
					if(lives == 0)
					{
						gameOver();
					}
					else
					{
						ship = newShip();
					}
				}
			}

			//mover os lasers
			for(var i = ship.lasers.length - 1; i >= 0; i--)
			{
				//checar a distancia viajada
				if(ship.lasers[i].dist > LASER_DIST * canv.width)
				{
					ship.lasers.splice(i, 1);
					continue;
				}
				
				//fazer a explosão
				if(ship.lasers[i].explodeTime > 0)
				{
					ship.lasers[i].explodeTime--;
					
					//destruir o laser depois da duração
					if(ship.lasers[i].explodeTime == 0)
					{
						ship.lasers.splice(i, 1);
						continue;
					}
				}
				else
				{
					//mover o laser
					ship.lasers[i].x += ship.lasers[i].xv;
					ship.lasers[i].y += ship.lasers[i].yv;
					
					//calcular a distancia percorrida
					ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
				}
				
				// saida da tela
				if(ship.lasers[i].x < 0)
				{
					ship.lasers[i].x = canv.width;
				}
				else if(ship.lasers[i].x > canv.width)
				{
					ship.lasers[i].x = 0;
				}
				if(ship.lasers[i].y < 0)
				{
					ship.lasers[i].y = canv.height;
				}
				else if(ship.lasers[i].y > canv.height)
				{
					ship.lasers[i].y = 0;
				}
			}
			
			//movimentação do meteoro
			for(var i = 0; i < mets.length; i++)
			{
				mets[i].x += mets[i].xv;
				mets[i].y += mets[i].yv;
				
				//saida da tela
				if(mets[i].x < 0 - mets[i].r)
				{
					mets[i].x = canv.width + mets[i].r;
				}
				else if(mets[i].x > canv.width + mets[i].r)
				{
					mets[i].x = 0 - mets[i].r
				}
				if(mets[i].y < 0 - mets[i].r)
				{
					mets[i].y = canv.height + mets[i].r;
				}
				else if(mets[i].y > canv.height + mets[i].r)
				{
					mets[i].y = 0 - mets[i].r
				}
			}
        }