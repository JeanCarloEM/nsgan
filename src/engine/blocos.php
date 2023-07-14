<?php
function bloco($id, $nome){
?>

<h3><?php echo $nome;?></h3>

<div class="res <?php echo $id;?>">
		<button class="showgrafic">Exibir/Ocultar Gráficos</button>
		<div class="ind hide">
		</div>

		<div class='calc'>
			<h4>Indices</h4>
			<div class="filter_indices"></div>
			<div class="graficos indices"></div>
		</div>
	</div>

<?php
  }

  function blocos(){
    bloco("faixa", "Modelo de Faixas");
    bloco("quadrado", "Faixa Quadriculada");
    bloco("xadres", "Xadres");
    bloco("raios", "Raios");
	}

	/*
	    <!--
		<div class='calc'>
			<h4>Calculos</h4>
			<div class="graficos statis"></div>
		</div>

		<div class='calc'>
			<h4>Quartil</h4>
			<div class="graficos quartil"></div>
		</div>
		-->
	*/