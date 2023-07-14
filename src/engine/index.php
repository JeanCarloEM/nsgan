<?php
require_once "blocos.php"
?><html>
	<head>
		<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

		<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js"></script>
		<script src="assets/js/canvas.js"></script>
		<script src="assets/js/main.js"></script>

		<script>
			(function($){
				$("document").ready(function($){
					var x = $("div.res.ranges > div.ind");

					for (i = 11; i <= 715; i += 16){
						var ant = (i - 16 <= 0) ? 1 : i-16;
						x.append($("<div class='quadro'><div class='canvas'><img src='assets/imgs/grafi/Conjunto"+i+".jpeg' /></div><span>"+ant+" &#x2192; "+i+"</span></div>"));
					}

					window.setTimeout(function($){
						//plotJsonPareto("div.canvas", "adinovam/Conjunto585.faixa.11.json");
					}, 1000);

					$("button.ir").on("click", function(e){
						if ($("input.ir").val().length > 0){
							conjunto(parseInt($("input.ir").val()));
						}
					});

					$("button.showgrafic").on("click", function(e){
						var e = $(this);
						if (!e.attr("id")){
							e.attr("id", uid());
						}

						$("#" + e.attr("id") + " + div.ind").toggleClass("hide");
					});

					$("div.opens > .open").on("click", function(){
						conjunto(parseInt($(this).attr("data-c")));
					});

					$("button.showrange").on("click", function(e){
						if ($("div.res.ranges > div.ind").hasClass("hide")){
							$(this).html("Ocultar Faixa de Modelos");
						}else{
							$(this).html("Exibir Faixa de Modelos");
						}

						$("div.res.ranges > div.ind").toggleClass("hide");
					});

					$("div.res div.quadro").on("click", function(e){
						$(this).toggleClass("maximizado");
					});
			});
			}(Zepto))
		</script>

		<link href="assets/css/main.css" rel="stylesheet" type="text/css">
	</head>
<body>

<a href="pareto.php" class='button red'>Fronteira</a>
<a href="minmax.php" class='button red'>Minimo Máximo Pareto</a>
<hr />

<div class="progress"><div class="bar"></div></div>

<h3>Ranges</h3>
<p>Confira abaixo os ranges dos graficos:</p>
<div class="res ranges">
	<button class="showrange">Exibir Faixa de Modelos</button>
	<div class="ind hide">
</div>

<h3>Conjuntos</h3>
<p>Selecione o conjunto desejado, de 1 à 715:</p>
<div class="opens">
	<input placeholder="1 - 715" class="ir" type="number" max-lengh="3" min="1" max="715"/>
	<button class="ir">Ir</button>
</div>

<?php blocos();?>

<hr />
<br />
<br />

</body>

</html>