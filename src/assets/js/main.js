(function ($, w, _) {
  _.partes = {
    "index": [2, 3, 4, 5, 7, 8, 9, 10, 11],
    "faixa": [1, 1, 1, 1, 1, 1, 1, 1, 1],
    "quadrado": [1, 0, 1, 1, 0, 1, 0, 1, 0],
    "xadres": [1, 0, 1, 1, 0, 1, 0, 1, 0],
    "raios": [1, 1, 1, 1, 1, 1, 1, 1, 1]
  };

  _.aBaixar = [];
  _.jaBaixados = [];

  _.progressUpdt = function (url) {
    if (_.jaBaixados.indexOf(url) < 0) {
      _.jaBaixados.push(url);
      $("div.progress > div.bar").css("width", (_.jaBaixados.length / _.aBaixar.length * 100) + "%");
    }
  };

  _.tipos = ["faixa", "quadrado", "xadres", "raios"];

  _.qtds = {};

  _.arrRound = function (val) {
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length; i++) {
        val = _.arrRound(val[i]);
      }
    } else {
      return Math.round(val * 10000, 4) / 10000;
    }

    return val;
  };

  _.indicesIgnorar = [];
  _.startsIgnorar = [];

  _.callInd = function (dcanvas) {
    dcanvas = $(dcanvas);

    if (dcanvas[0].json.modo === "minmax") {
      var statis = _.getStatis(dcanvas[0]);
    } else {
      var statis = _.getIndices(dcanvas[0]);
    }

    if (!statis) {
      return;
    }

    var quadro = $(dcanvas.parent());

    var x = $("<div class='keys'></div>");

    $.each(statis, function (k, val) {
      if (k !== "r") {
        val = _.arrRound(val);

        var v = (Array.isArray(val)) ? ((JSON.stringify(k) == JSON.stringify(statis.r)) ? "nao" : val.join(", ")) : val;
        x.append($("<div><span>" + k + "</span>: <span>" + v + "</span></div>"))
      }
    });

    if (!quadro.id) {
      quadro.attr("id", _.uid());
    }

    var cont = $("#" + quadro.attr("id") + " div.dados");

    if (cont.length <= 0) {
      cont = $("<div class='dados'></div>");
      quadro.append(cont);
    }

    cont.html(" ");
    cont.append(x);

    w.setTimeout("baixados();", 50);
  };

  _.graficarIndices = function (modo, ignore) {
    ignore = (Array.isArray(ignore) && ignore.length > 0) ? ignore : _.indicesIgnorar;

    /* TUDO MINUSCULOA */
    for (var t = 0; t < ignore.length; t++) {
      ignore[t] = ignore[t].toLowerCase();
    }

    if (_.graficados["idc"].indexOf(modo) >= 0) {
      return;
    }

    _.graficados["idc"].push(modo);

    var jss = $("div." + modo + " > div.ind > div.quadro > div.canvas");
    var matrix = [];

    var filters = $('div.res.' + modo + ' div.calc > div.filter_indices');
    var fid = _.uid();
    filters.attr("id", fid);
    filters.html("");
    filters.html("<span>Ocultar: </span><hr /><div class='cols2'></div><hr />");
    filters.append("<button class='filter' data-fid='" + fid + "'>Aplicar</button>")

    $("#" + fid + " button.filter").on("click", function (e) {
      _.indicesIgnorar = [];
      _.graficados = { "idc": [], "calc": [], "quartil": [] };

      var cheks = $("#" + fid + " input[type=checkbox]:checked");
      for (var t = 0; t < cheks.length; t++) {
        _.indicesIgnorar.push(cheks[t].getAttribute("data-f").toLowerCase());
      }

      $('div.res div.calc div.graficos').html("");

      w.setTimeout("baixados();", 50);
    });

    filters = $('div.res.' + modo + ' div.calc > div.filter_indices div.cols2');

    for (var s = 0; s <= jss.length; s++) {
      if (s === 0) {
        var linha = [modo];
      } else if (s > 0) {
        if ($(jss[s - 1]).attr("data-p") !== undefined) {
          var ct = 0;

          for (var l = 0; l < jss[s - 1].json.grupos.length; l++) {
            ct += jss[s - 1].json.grupos[l].points.length;
          }

          var linha = [ct + ""];
        } else if (jss[s - 1].json.hasOwnProperty("areas") && (jss[s - 1].json.areas.length > 0)) {
          var linha = [jss[s - 1].json.areas.length + ""];
        } else {
          var linha = [$(jss[s - 1]).attr("data-f") + ""];
        }
      }

      var idx = _.getIndices(jss[(s - 1 >= 0) ? s - 1 : 0]);

      if (!idx) {
        return;
      }

      for (k in idx) {
        v = _.arrRound(idx[k]);

        if ((k !== "r") && (s === 0)) {
          filters.append("<div class='item'><input type='checkbox' class='filters' data-f='" + k + "' " + ((ignore.indexOf((k + "").toLowerCase()) >= 0) ? "checked " : "") + "/><span>" + k + "</span></div>");
        }

        if ((k !== "r") && (ignore.indexOf((k + "").toLowerCase()) < 0)) {
          if (s === 0) {
            var indiceName = k;
            linha.push(indiceName);
          } else {
            if (Array.isArray(v)) {
              var soma = 0;
              for (var j = 0; j < v.length; j++) {
                soma += v[j];
              }

              linha.push(soma / v.length);

            } else {
              linha.push(v);
            }
          }
        }
      };

      matrix.push(linha);
    }

    _.google.charts.load('current', { 'packages': ['corechart'] });
    _.google.charts.load('current', { 'packages': ['line'] });
    _.google.charts.setOnLoadCallback(function () {
      var data = _.google.visualization.arrayToDataTable(matrix);

      var options = {
        title: modo,
        curveType: 'function',
        legend: { position: 'bottom' },
        height: 550
      };

      var chart = new _.google.visualization.LineChart($('div.res.' + modo + ' div.calc div.indices')[0]);

      chart.draw(data, options);
    });
  };

  _.getStatis = function (dcanvas) {
    var statis = [];

    if (((typeof dcanvas !== "object") && (!Array.isArray(dcanvas))) || (!dcanvas.hasOwnProperty("json"))) {
      this.console.log("No '.json'.");
      return false;
    }

    if (dcanvas.json.hasOwnProperty("statis")) {
      statis = dcanvas.json.statis;
    } else {
      if (dcanvas.json[0].hasOwnProperty("statis")) {
        statis = dcanvas.json[0].statis;
      } else {
        if ((dcanvas.json[0].hasOwnProperty("dists")) && dcanvas.json[0].dists.hasOwnProperty("statis")) {
          statis = dcanvas.json[0].dists.statis;
        } else {
          this.console.log("No 'statis'.");
          return false;
        }
      }
    }

    return statis;
  };

  _.getIndices = function (dcanvas) {
    var indices = [];

    if (((typeof dcanvas !== "object") && (!Array.isArray(dcanvas))) || (!dcanvas.hasOwnProperty("json"))) {
      this.console.log("No '.json'.");
      return false;
    }

    if (dcanvas.json.hasOwnProperty("indices")) {
      indices = dcanvas.json.indices;
    } else {
      if (dcanvas.json[0].hasOwnProperty("indices")) {
        indices = dcanvas.json[0].indices;
      } else {
        if ((dcanvas.json[0].hasOwnProperty("dists")) && dcanvas.json[0].dists.hasOwnProperty("indices")) {
          indices = dcanvas.json[0].dists.indices;
        } else {
          this.console.log("No '.indices'.");
          return false;
        }
      }
    }

    return indices;
  };



  _.graficarQuartil = function (modo) {
    if (_.graficados["quartil"].indexOf(modo) >= 0) {
      return;
    }

    _.graficados["quartil"].push(modo);

    var jss = $("div." + modo + " > div.ind > div.quadro > div.canvas");

    var matrix = [];

    for (var s = 0; s <= jss.length; s++) {
      if (s === 0) {
        var linha = [modo];
      } else {
        if ($(jss[s]).attr("data-p") !== undefined) {
          var ct = 0;

          for (var l = 0; l < jss[s].json.grupos.length; l++) {
            ct += jss[s].json.grupos[l].points.length;
          }

          var linha = [ct + ""];
        } else if (jss[s - 1].json.hasOwnProperty("areas") && (jss[s - 1].json.areas.length > 0)) {
          var linha = [jss[s - 1].json.areas.length + ""];
        } else {
          var linha = [$(jss[s]).attr("data-f") + ""];
        }
      }

      var stc = _.getStatis(jss[(s - 1 >= 0) ? s - 1 : 0]);

      //$.each(jss[0].json.statis, function(k,v,linha){
      if (!stc) {
        return false;
      }

      if (!stc.hasOwnProperty("quartil") || !Array.isArray(stc.quartil)) {
        return false;
      }

      for (k in stc.quartil) {
        v = _.arrRound(stc.quartil[k]);

        if (k !== "r") {
          if (s == 0) {
            linha.push(k + "");
          } else if (Array.isArray(v)) {
            var soma = 0;
            for (var j = 0; j < v.length; j++) {
              soma += v[j];
            }

            linha.push(soma / v.length);
          } else {
            linha.push(v);
          }
        }
      };

      matrix.push(linha);
    }

    _.google.charts.load('current', { 'packages': ['corechart'] });
    _.google.charts.load('current', { 'packages': ['line'] });
    _.google.charts.setOnLoadCallback(function () {
      var data = _.google.visualization.arrayToDataTable(matrix);

      var options = {
        title: modo,
        legend: 'none',
        curveType: 'function',
        legend: { position: 'bottom' },
        height: 550
      };

      var chart = new _.google.visualization.CandlestickChart($('div.res.' + modo + ' div.calc div.quartil')[0]);

      chart.draw(data, options);
    });
  };






  _.graficarCalculos = function (modo, ignore) {
    ignore = (Array.isArray(ignore) && ignore.length > 0) ? ignore : _.startsIgnorar;

    /* TUDO MINUSCULOA */
    for (var t = 0; t < ignore.length; t++) {
      ignore[t] = ignore[t].toLowerCase();
    }

    if (_.graficados["calc"].indexOf(modo) >= 0) {
      return;
    }


    var filters = $('div.res.' + modo + ' div.calc > div.filter_statis');
    var fid = _.uid();
    filters.attr("id", fid);
    filters.html("");
    filters.html("<span>Ocultar: </span><hr /><div class='cols2'></div><hr />");
    filters.append("<button class='filter' data-fid='" + fid + "'>Aplicar</button>")

    $("#" + fid + " button.filter").on("click", function (e) {
      _.startsIgnorar = [];
      _.graficados = { "idc": [], "calc": [], "quartil": [] };

      var cheks = $("#" + fid + " input[type=checkbox]:checked");
      for (var t = 0; t < cheks.length; t++) {
        _.startsIgnorar.push(cheks[t].getAttribute("data-f").toLowerCase());
      }

      $('div.res div.calc div.graficos').html("");

      w.setTimeout("baixados();", 50);
    });

    filters = $('div.res.' + modo + ' div.calc > div.filter_statis div.cols2');

    _.graficados["calc"].push(modo);

    var jss = $("div." + modo + " > div.ind > div.quadro > div.canvas");

    var matrix = [];

    for (var s = 0; s <= jss.length; s++) {
      if (s === 0) {
        var linha = [modo];
      } else {
        if ($(jss[s - 1]).attr("data-p") !== undefined) {
          var ct = 0;

          for (var l = 0; l < jss[s - 1].json.grupos.length; l++) {
            ct += jss[s - 1].json.grupos[l].points.length;
          }

          var linha = [ct + ""];
        } else if ((jss[s - 1].json.hasOwnProperty("areas")) && (jss[s - 1].json.areas.length > 0)) {
          var linha = [jss[s - 1].json.areas.length];
        } else {
          var linha = [$(jss[s - 1]).attr("data-f")];
        }
      }

      var stc = _.getStatis(jss[(s - 1 >= 0) ? s - 1 : 0]);

      //$.each(jss[0].json.statis, function(k,v,linha){
      if (!stc) {
        return false;
      }

      for (k in stc) {
        v = _.arrRound(stc[k]);

        if ((k !== "r") && (s == 0)) {
          filters.append("<div class='item'><input type='checkbox' class='filters' data-f='" + k + "' " + ((ignore.indexOf((k + "").toLowerCase()) >= 0) ? "checked " : "") + "/><span>" + k + "</span></div>");
        }

        if ((k !== "r") && (ignore.indexOf((k + "").toLowerCase()) < 0)) {
          if (s === 0) {
            linha.push(k + "");
          } else if (Array.isArray(v)) {
            var soma = 0;
            for (var j = 0; j < v.length; j++) {
              soma += v[j];
            }

            linha.push((soma / v.length) + "");
          } else {
            linha.push(v);
          }
        }
      };

      matrix.push(linha);
    }

    _.google.charts.load('current', { 'packages': ['corechart'] });
    _.google.charts.load('current', { 'packages': ['line'] });
    _.google.charts.setOnLoadCallback(function () {
      var data = _.google.visualization.arrayToDataTable(matrix);

      var options = {
        title: modo,
        curveType: 'function',
        legend: { position: 'bottom' },
        height: 550
      };

      var chart = new _.google.visualization.LineChart($('div.res.' + modo + ' div.calc div.statis')[0]);

      chart.draw(data, options);
    });
  };

  _.baixados = function () {
    baixado = true;
    var canvas;

    for (var i = 0; i < _.tipos.length; i++) {
      canvas = $("div." + _.tipos[i] + " > div.ind > div.quadro > div.canvas");

      for (var j = 0; j < canvas.length; j++) {
        if (canvas[j] && (!canvas[j].hasOwnProperty("json") || (typeof canvas[j].json == undefined) || (!canvas[j].json))) {
          baixado = false;
          break;
        }
      }

      if (!baixado) {
        break;
      } else {
        if (canvas[0].json.modo === "minmax") {
          w.setTimeout("graficarQuartil('" + _.tipos[i] + "');", 50);
          w.setTimeout("graficarCalculos('" + _.tipos[i] + "');", 100);
        }

        w.setTimeout("graficarIndices('" + _.tipos[i] + "');", 150);

        w.setTimeout('Zepto("div.opens").css("display", "block");', 500);
      }
    }
  };

  _.graficados = { "idc": [], "calc": [], "quartil": [] };

  _.conjuntoParetoMinMax = function (num, modo, tipo) {
    var quadrado = $("div.res.quadrado > .ind");
    var faixa = $("div.res.faixa > .ind");

    faixa.html("");
    quadrado.html("");

    if (!faixa.attr("id")) {
      faixa.attr("id", _.uid());
    }

    if (!quadrado.attr("id")) {
      quadrado.attr("id", _.uid());
    }

    for (var i = 5; i < 306; i += 10) {
      var fid = _.uid();
      faixa.append('<div class="quadro">' + i + '<div class="canvas"  id="' + fid + '" data-f="' + i + '"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div></div>');

      var qid = _.uid();
      quadrado.append('<div class="quadro">' + i + '<div class="canvas"  id="' + qid + '" data-f="' + i + '"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div></div>');
    }

    conjuntoParetoTipo(null, ["sort", "unif"]);
  };

  _.getTiposEleBy = function (query) {
    const regex = /\#\{tipo\}/i;
    var r = {};

    for (var i = 0; i < _.tipos.length; i++) {
      r["" + _.tipos[i]] = $(query.replace(regex, _.tipos[i]));
    }

    return r;
  };

  _.conjuntoPareto = function (num, modo, tipo) {
    _.aBaixar = [];
    _.jaBaixados = [];
    $('div.res div.calc > div.graficos').html("");
    $('div.res div.calc > div.filter_indices').html("");

    _.graficados = { "idc": [], "calc": [], "quartil": [] };
    num = parseInt(num);
    var tp = _.getTiposEleBy("div.res.#{tipo} > .ind");

    for (let key in tp) {
      tp[key].html("");

      if (!tp[key].attr("id")) {
        tp[key].attr("id", _.uid());
      }
    }

    if (modo.trim() == "faixas") {
      _.paretoFaixas(tipo, tp, num);
    } else {
      var ff = _.partes["index"];

      for (var i = 0; i < _.partes["index"].length; i++) {
        for (var j = 0; j < _.tipos.length; j++) {
          if (_.partes[_.tipos[j]][i]) {
            var uid = _.uid();
            tp[_.tipos[j]].append('<div class="quadro">' + ff[i] + '<div class="canvas"  id="' + uid + '" data-f="' + ff[i] + '"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div></div>');
          }
        }
      }

      _.conjuntoParetoTipo(num, tipo);
    }

    $("div.res div.quadro").on("click", function (e) {
      $(this).toggleClass("maximizado");
    });
  };

  _.paretoFaixas = function (tipo, tp, num) {
    for (i = 5; i <= 305; i += 10) {
      var ff = _.partes["index"];

      for (var j = 0; j < _.tipos.length; j++) {
        if (_.partes[_.tipos[j]][_.partes["index"].indexOf(num)]) {
          var uid = _.uid();
          tp[_.tipos[j]].append('<div class="quadro">' + num + '<div class="canvas"  id="' + uid + '" data-f="' + num + '" data-p="' + i + '"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div></div>');
          var url = "pareto/" + _.tipos[j] + "/" + tipo + "_" + i + "." + _.tipos[j] + "." + num + ".json";
          _.plotJsonPareto($("#" + uid), url, 1000, num, _.callInd);
        }
      }
    }
  };

  _.conjuntoParetoTipo = function (num, tipo) {
    _.graficados = { "idc": [], "calc": [], "quartil": [] };
    $("div.opens").css("display", "none");
    canvas = $("div.res > div.ind > div.quadro > div.canvas");

    for (i = 0; i < canvas.length; i++) {
      $(canvas[i]).html("");
      canvas[i].json = null;
    }

    $('div.res div.calc div.graficos').html("");

    num = (num !== null) ? (num + "") : null;
    pad = "000";

    for (var i = 0; i < _.tipos.length; i++) {
      var quadros = $("div." + _.tipos[i] + " > div.ind > div.quadro");
      var canvas = $("div." + _.tipos[i] + " > div.ind > div.quadro > div.canvas");

      for (var j = 0; j < canvas.length; j++) {
        c = $(canvas[j]);
        c.html('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');

        if (num === null && (Array.isArray(tipo))) {
          var url = "pareto/minmax/" + tipo[i] + "_" + c.attr("data-f") + ".minmax.json";
        } else {
          var url = "pareto/" + _.tipos[i] + "/" + tipo + "_" + num + "." + _.tipos[i] + "." + c.attr("data-f") + ".json";
        }

        _.plotJsonPareto(canvas[j], url, 1000, 3, _.callInd);
      }

    }
  };

  _.conjunto = function (num) {
    $('div.res div.calc > div.graficos').html("");
    $('div.res div.calc > div.filter_indices').html("");
    _.indicesIgnorar = [];
    _.graficados = { "idc": [], "calc": [], "quartil": [] };
    $("div.opens").css("display", "none");
    canvas = $("div.res > div.ind > div.quadro > div.canvas");

    for (i = 0; i < canvas.length; i++) {
      $(canvas[i]).html("");
      canvas[i].json = null;
    }

    $('div.res div.calc div.graficos').html("");

    num = (num + "");
    pad = "000";

    num = parseInt(num);
    var tp = _.getTiposEleBy("div.res.#{tipo} > .ind");

    for (let key in tp) {
      tp[key].html("");

      if (!tp[key].attr("id")) {
        tp[key].attr("id", _.uid());
      }
    }

    var ff = _.partes["index"];

    for (var i = 0; i < _.partes["index"].length; i++) {
      for (var j = 0; j < _.tipos.length; j++) {
        if (_.partes[_.tipos[j]][i]) {
          var uid = _.uid();
          tp[_.tipos[j]].append('<div class="quadro">' + ff[i] + '<div class="canvas"  id="' + uid + '" data-f="' + ff[i] + '"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div></div>');
          var url = "fontes/" + _.tipos[j] + "/Conjunto" + pad.substring(0, pad.length - ("" + num).length) + num + "." + _.tipos[j] + "." + ff[i] + ".json";
          _.plotJsonPareto($("#" + uid), url, 1000, 3, _.callInd);
        }
      }
    }
  };
}(Zepto, window, this));