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
						//plotJsonPareto("div.canvas", "adinovam/Conjunto585.faixa.11.json");
					}, 1000);

					$("button.ir").on("click", function(e){
						var pontos = $("input.ir.pontos").val();
						var faixas = $("input.ir.faixas").val();

						if (isNum(pontos) && (pontos % 5 == 0) && ((pontos-5) % 10 === 0) && (pontos >= 5) && (pontos <= 305)){
							return conjuntoPareto(pontos, "pontos", $("div.opens input[type='checkbox']").prop("checked")?"unif":"sort");
						}else if (isNum(faixas) && ([2, 3, 4, 5, 7, 8, 9, 10, 11].indexOf(parseInt(faixas)) >= 0)){
							return conjuntoPareto(faixas, "faixas", $("div.opens input[type='checkbox']").prop("checked")?"unif":"sort");
						}

						alert("Valor selecionado inválido!");
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
<a href="minmax.php" class='button red'>Minimo Máximo Pareto</a>
<hr />

<h3>Conjuntos</h3>
<p>Há duas opções de visualização. A primeira, selecionando o número de pontos, ele mostrar ao comparativo entre as faixas. A segunda opção, escolher o número de faixas e, ele mostrar o comparativo entre a quantidade de pontos.</p>

<?php
	$r = [
		["Tipo \ Áreas",					"02",	"03",	"04",	"05",	"07",	"08",	"09",	10, 	11],
		["Faixas RETAS", 					1,		1, 		1,		1,		1,		1, 		1,		1,		1],
		["Faixas Quadradas",			1,		0, 		1,		1,		0,		1, 		0,		1,		0],
		["Xadres", 								1,		0, 		1,		1,		0,		1, 		0,		1,		0],
		["Raios Convergentes", 		1,		1, 		1,		1,		1,		1, 		1,		1,		1]
	];
?>

<table cellspacing="0" cellpading="0" border="0">
<?php
foreach($r as $k => $v){
	echo "<tr>";
		foreach($v as $i => $s){
			echo "<td".(($s==1)?" class='selected'":'').">".($s?$s:'')."</td>";
		}
	echo "</tr>";
}
?>
</table>

<p>Para opção de pontos, o range incrementa de 10 em 10, começando em 5 e terminando em 305.</p>
<div class="opens">
	<input placeholder="pontos" class="ir pontos" type="number" max-lengh="3" min="1" max="715"/>	 XOR
		<input placeholder="áreas" class="ir faixas" type="number" max-lengh="3" min="1" max="715"/> <input type='checkbox' /><label>Uniforme?</label>
		&nbsp;&nbsp;
	<button class="ir">Ir</button>
</div>

<?php blocos();?>

<hr />
<br />
<br />

</body>

</html>