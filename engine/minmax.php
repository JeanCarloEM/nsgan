<?php
require_once "blocos.php"
?><html lang="pt">
	<head>
		<meta http-equiv=”Content-Type” content=”text/html; charset=utf-8″>
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
							conjuntoParetoMinMax();
					}, 1000);

					$("div.opens > .open").on("click", function(){
						conjunto(parseInt($(this).attr("data-c")));
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

<div class="progress"><div class="bar"></div></div>
<a href="index.php" class='button red'>Disperso</a>
<a href="pareto.php" class='button red'>Pareto</a>
<hr />

<h3>Aleatório</h3>

	<div class="res faixa">
	<button class="showgrafic">Exibir/Ocultar Gráficos</button>
		<div class="ind hide">
		</div>

		<div class='calc'>
			<h4>Indices</h4>
			<div class="filter_indice"></div>
			<div class="graficos indices"></div>
		</div>

		<div class='calc'>
			<h4>Calculos</h4>
			<div class="filter_statis"></div>
			<div class="graficos statis"></div>
		</div>

		<div class='calc'>
			<h4>Quartil</h4>
			<div class="graficos quartil"></div>
		</div>
	</div>


<h3>Uniforme</h3>


	<div class="res quadrado">
	<button class="showgrafic">Exibir/Ocultar Gráficos</button>
		<div class="ind hide">
		</div>

		<div class='calc'>
			<h4>Indices</h4>
			<div class="filter_indice"></div>
			<div class="graficos indices"></div>
		</div>

		<div class='calc'>
			<h4>Calculos</h4>
			<div class="filter_statis"></div>
			<div class="graficos statis"></div>
		</div>

		<div class='calc'>
			<h4>Quartil</h4>
			<div class="graficos quartil"></div>
		</div>
	</div>

<hr />
<br />
<br />

</body>

</html>