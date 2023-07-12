if (typeof (plotJsonPareto) == "undefined" || !plotJsonPareto) {
  (function ($, _, w, Z, xlog) {
    /*
     * OBTEM UM JSON
     *
     * Dica obtida em
     * http://stackoverflow.com/questions/9922101/get-json-data-from-external-url-and-display-it-in-a-div-as-plain-text
     *
     * @param string url
     * @returns json
     */
    if (typeof _.getJSON !== 'function') {
      _.getJSON = function (url) {
        return function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('get', url, true);
          xhr.responseType = 'json';
          xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
              resolve(xhr.response);
            } else {
              reject(status);
            }
          };
          xhr.send();
        };
      };
    };

    /* VERIFICA SE A A CHAVE EXISTE EM UM ARRAY
     *
     * discuss at: http://phpjs.org/functions/key_exists/
     * original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * improved by: Felix Geisendoerfer (http://www.debuggable.com/felix)
     * example 1: key_exists('kevin', {'kevin': 'van Zonneveld'});
     * returns 1: true
     */
    if (!_.key_exists) {
      _.key_exists = function (key, search) {
        if (!search || (search.constructor !== Array && search.constructor !== Object)) {
          return false;
        }

        return key in search;
      };
    };


    _.sortear = function () {
      return _.Math.floor((1 + Math.random()) * 0x10000);
    };

    _.uid = function () {
      function s4() {
        return _.sortear()
          .toString(16)
          .substring(1);
      }
      return String.fromCharCode((((_.sortear() % 2) === 1) ? 65 : 97) + (_.sortear() % 26)) + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };

    _.isNum = function (valor) {
      return (!isNaN(parseFloat(valor)) && isFinite(valor));
    };

    _.parseIfJson = function (str) {
      try {
        js = JSON.parse(str);
      } catch (e) {
        return false;
      }

      return js;
    };

    _.isUrl = function (str) {
      var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
      return !!pattern.test(str);
    };

    Z.container = null;
    Z.svg = null;
    Z.json = null;
    Z.size = 1000;
    Z.margem = 70;
    Z.grupos = []
    Z.areas = []
    Z.call = null;

    Z.initVars = function (obj, size, psize, destino) {
      obj = $(obj);
      Z.container = obj;
      Z.destino = destino;

      if ((typeof Z.container.id !== "string") || (Z.container.id === "")) {
        Z.container.attr("id", _.uid());
      }

      /*
      if (Z.container.prop("tagName").toLowerCase() === "canvas") {
        Z.canvas = Z.container;
      } else {
        Z.canvas = $(Z.container.id + " > canvas");

        if (Z.canvas.length === 0) {
          Z.container.html("");
          Z.container.append("<canvas id='" + _.uid() + "'></canvas>");
          Z.canvas = $('#' + Z.container.attr("id") + " > canvas");
        }
      }
      */

      /*
      Z.canvas.css("width", Z.chart.canvas.w);
      Z.canvas.css("height", Z.chart.canvas.h);
      */

      Z.size = _.isNum(size) ? size : 1000;
      Z.psize = _.isNum(psize) ? psize : 3;

      Z.grupos = Z.json.hasOwnProperty("grupos") ? Z.json.grupos : Z.json;
      Z.areas = (Z.json.hasOwnProperty("areas") && (Object.keys(Z.json.areas).length) > 0) ? Z.json.areas : (
        Z.grupos[0].hasOwnProperty("areas") ? Z.grupos[0].areas : Z.grupos
      );

      return Z.container && Z.canvas;
    };

    Z.make = function (obj, jsn, size, psize, callb, destino) {
      if (typeof jsn === "string") {
        Z.json = _.parseIfJson(jsn);

        if (!Z.json) {
          if (_.aBaixar.indexOf(jsn) < 0) {
            _.aBaixar.push(jsn);
          }

          _.getJSON(jsn)(function (json) {
            if (typeof json == "object" || Array.isArray(json)) {
              if (typeof callb == "function") {
                w.setTimeout(function () {
                  callb(obj, Z.destino);
                }.bind(this), 500);
              }
              Z.make(obj, json, size, psize, callb, destino);
              xlog.log("JSON carregado com sucesso!");
              progressUpdt(jsn);
            } else {
              xlog(json);
              xlog.error("JSON NÃO foi carregado corretamente!");
            }

            return true;
          }.bind(this), function (status) {
            xlog.error('Impossível carregar json: [' + jsn + "'].");
            Z.make(obj, jsn, size, psize, callb, destino);
            return;
          }.bind(this));
        };

        xlog.log("Baixando Json " + jsn + "...");
        return;
      } else {
        Z.json = jsn;
      }

      if (typeof Z.json !== "object" && !Array.isArray(Z.json)) {
        xlog.log("Problemas, parâmetro jsn inválido.");
        return;
      }

      if (typeof Z.call == "function") {
        w.setTimeout(function () {
          Z.call(Z.container);
        }, 500);
      }

      Z.initVars(obj, size, psize, destino);

      Z.container[0].json = JSON.parse(JSON.stringify(jsn));

      Z.makeChart();
    }

    Z._x = function (p) {
      return p + Z.margem;
    };

    Z._y = function (p) {
      return Z.size - p;
    }


    Z.x1Dto2D = function (index, largura) {
      var menos = index < 0;
      var r = (index % largura);

      if (menos)
        r = r % -largura;

      return Z._x(r);
    };

    Z.y1Dto2D = function (index, largura) {
      var menos = index < 0;
      var r = parseInt(index / largura);

      if (menos)
        r = r % -largura;

      return Z._y(r);
    };

    Z.makeChart = function () {
      Z.makeSVG();
    };

    Z.svgNode = function (n, v) {
      n = document.createElementNS("http://www.w3.org/2000/svg", n);

      for (var p in v)
        n.setAttribute(p, v[p]);

      return $(n);
    };

    Z.makeSVG = function () {
      var colors = ["#ff0000", "#2b92db", "#911eb4", "#3cb44B", "#ff0000", "#2b92db", "#911eb4", "#3cb44B", "#ff0000", "#2b92db",
        "#911eb4", "#3cb44B", "#ff0000", "#2b92db", "#911eb4", "#3cb44B", "#ff0000", "#2b92db", "#911eb4", "#3cb44B"];

      svg = Z.svgNode("svg", {
        "id": _.uid(),
        "preserveAspectRatio": "xMidYMid meet",
        "viewBox": "0 0 " + (Z.size + Z.margem + 5) + " " + (Z.size + Z.margem + 5),
        "xmlns": "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:ev": "http://www.w3.org/2001/xml-events",
        "class": "canvas",
        "style": "font-size:15;font-family:Arial, san-serif;font-weight:bold;stroke:black;stroke-width:0;fill:#444444"
      });

      var defs = Z.svgNode("defs");
      var clip = Z.svgNode('clipPath', {
        "id": "areadografico"
      });
      clip.append(Z.svgNode('rect', {
        "height": 1000,
        "width": 1000,
        "x": 70,
        "y": 0
      }));
      defs.append(clip);
      svg.append(defs);

      master = Z.svgNode("g", { "class": "master" });
      especies = Z.svgNode("g", { "class": "especies" });

      for (e = 0; e < Z.grupos.length; e++) {
        esp = Z.svgNode("g", { "class": "e" + e });

        for (i = 0; i < Z.grupos[e].points.length; i++) {
          esp.append(Z.svgNode("circle", {
            "cx": Z.x1Dto2D(Z.grupos[e].points[i], 1000),
            "cy": Z.y1Dto2D(Z.grupos[e].points[i], 1000),
            "r": Z.psize,
            "stroke-width": 0,
            "fill": colors[e]
          }));
        }

        especies.append(esp);
      }

      p = Z.genLinesTexts();

      master.append(p[0]);
      master.append(p[1]);
      master.append(Z.genPols());
      master.append(especies);
      Z.container.html("");
      svg.append(master);

      Z.container.append(svg);
    };

    Z.genLinesTexts = function () {
      var texts = Z.svgNode("g", { "class": "textos" });
      var lines = Z.svgNode("g", { "class": "linhas" });

      for (var i = 0; i <= Z.size; i += parseInt(Z.size / 10)) {
        // <line fill-opacity="0.3" stroke="#999999" stroke-width="1" x1="1070" x2="1070" y1="1070" y2="70" />
        lines.append(Z.genLine(i + Z.margem, 0, i + Z.margem, Z.size, "#000000"));
        lines.append(Z.genLine(Z.margem, i, Z.size + Z.margem, i, "#000000"));

        texts.append(Z.genText(i, i * 0.97 + Z.margem, Z.size + Z.margem / 2));
        texts.append(Z.genText(i, Z.margem / 2, Z.size - i));
      }

      return [texts, lines];
    };

    Z.genText = function (text, x, y) {

      var t = Z.svgNode("text", {
        "x": x,
        "y": y
      });

      $(t).text(text);

      return t;
    };

    Z.genLine = function (sx, sy, ex, ey, cor) {
      return Z.svgNode("line", {
        "fill-opacity": 0.3,
        "stroke": cor,
        "stroke-width": 1,
        "x1": sx,
        "x2": ex,
        "y1": sy,
        "y2": ey
      });
    };

    Z.genPols = function () {
      var pols = Z.svgNode("g", { "class": "poligonos" });
      colors = ["#000000", "#ffffff"]

      for (p = 0; p < Z.areas.length; p++) {
        points = ""
        for (i = 0; i < Z.areas[p].length; i++) {
          points += Z.x1Dto2D(Z.areas[p][i], 1000) + "," + Z.y1Dto2D(Z.areas[p][i], 1000) + " ";
        }

        var c = [];
        for (var i = 0; i < Math.sqrt(Z.areas.length); i++) {
          c.push(colors[i % colors.length]);
        }
        c.push("#ff0000");

        var cor = (Z.json.hasOwnProperty("modo") && (Z.json["modo"].toLowerCase().trim() == "xadres"))
          ? (c[p % c.length])
          : ((Z.json.hasOwnProperty("modo") && (Z.json["modo"].toLowerCase().trim() == "quadrado"))
            ? ((p === 0) ? colors[0] : (([1, 2].indexOf(p % 4) >= 0) ? colors[1] : colors[0]))
            : (((p == 0) || ((p > 0) && ((p - 1) % 2 == 1))) ? colors[0] : colors[1]));

        pols.append(Z.svgNode("polygon", {
          "clip-path": "url(#areadografico)",
          "fill": cor,
          "fill-opacity": .1,
          "points": points
        }));
      }

      return pols;
    };

  }(Zepto, this, window, (function (global) {
    /*
    * CLASSE PASSMETER
    *
    */
    global.window.plotJsonPareto = function (obj, jsn, size, psize, callb, destino) {
      return plotJsonPareto.make(obj, jsn, size, psize, callb, destino);
    };

    global.Passmeter = global.window.plotJsonPareto;
    return global.window.plotJsonPareto;
  })(this), console));
}
