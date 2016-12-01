// Setting the colours for the background
var uiGradientsUrl = 'https://cdn.rawgit.com/Ghosh/uiGradients/master/gradients.json';
var JSONURL = 'https://spreadsheets.google.com/feeds/list/164rk8vkuSo3SknvTcna-uqUBwb5a4CdFGiPyzRCoUSM/1/public/basic?alt=json';

var html = $('html'),
  helper = $('.helper'),
  title = $('.title'),
  gradientsList,
  activeGradient,
  i = 0;

$.getJSON(uiGradientsUrl, function (data) {
  gradientsList = data;
  // Shuffle Array
  gradientsList.sort(function () {
    return 0.5 - Math.random();
  });
});

var bgChangeInterval = function () {
  // Get gradient
  activeGradient = gradientsList[Math.floor(Math.random() * gradientsList.length)];

  // Flip target for transition
  var target = html;
  helper.removeClass('active');

  if (i % 2 === 0) {
    target = helper;
    html.removeClass('active');
  }

  // Set new gradient
  target.css({
    'background': activeGradient.colors[0],
    'background': 'linear-gradient(to left, ' + activeGradient.colors[0] + ' ,' + activeGradient.colors[1] + ')'
  }).addClass('active');
};

window.onload = function () {
  setTimeout(bgChangeInterval, 200)
}


// Load a random quote
function uniq_fast(a) {
  var seen = {};
  var out = [];
  var len = a.length;
  var j = 0;
  for (var i = 0; i < len; i++) {
    var item = a[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
}

// Type out the quotes
function typeIt() {
  $('.teletype').each(function (index) {
    var c = $(this).html().split("");
    $(this).html('');
    teletype(c, $(this));
  });

  function teletype(c, t) {
    var i = 0;
    setInterval(function () {
      if (i < c.length) {
        t.append(c[i]);
        i++;
      }
    }, 25);
  };
};

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function callback(data) {
  var rows = [];
  var cells = data.feed.entry;

  for (var i = 0; i < cells.length; i++) {
    var rowObj = {};
    rowObj.quote = cells[i].title.$t;
    var rowCols = cells[i].content.$t.split(',');
    for (var j = 0; j < rowCols.length; j++) {
      var keyVal = rowCols[j].split(':');
      if (keyVal[1] && keyVal[0]) {
        rowObj[keyVal[0].trim()] = keyVal[1].trim();
      }
    }
    rows.push(rowObj);
  }

  var allTags = uniq_fast(rows.map(function (a) {
    return a.tag;
  })).filter(Boolean);
  select = document.getElementById('tag-select');

  if (select) {
    for (var i = 0; i <= allTags.length; i++) {
      if (allTags[i]) {
        var opt = document.createElement('option');
        opt.value = window.location.href + 'quote.html?tag=' + allTags[i];
        opt.innerHTML = allTags[i];
        select.appendChild(opt);
      }
    }
  }


  var tag = getParameterByName('tag');
  var filteredQuotes = rows.filter(function (el) {
    if (el && el.tag) {
      return el.tag.toLowerCase() === tag.toLowerCase();
    }
  });
  var quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)].quote;
  $('#val').text(quote);
  // typeIt();
}

$(document).ready(function () {
  $.ajax({
    url: JSONURL,
    success: function (data) {
      callback(data);
    }
  });
});


$(function () {
  var $wrapper = $('#wrapper');

  // theme switcher
  var theme_match = String(window.location).match(/[?&]theme=([a-z0-9]+)/);
  var theme = (theme_match && theme_match[1]) || 'default';
  var themes = ['default', 'legacy', 'bootstrap2', 'bootstrap3'];
  $('head').append('<link rel="stylesheet" href="../dist/css/selectize.' + theme + '.css">');

  var $themes = $('<div>').addClass('theme-selector').insertAfter('h1');
  for (var i = 0; i < themes.length; i++) {
    $themes.append('<a href="?theme=' + themes[i] + '"' + (themes[i] === theme ? ' class="active"' : '') + '>' + themes[i] + '</a>');
  }

  // display scripts on the page
  $('script', $wrapper).each(function () {
    var code = this.text;
    if (code && code.length) {
      var lines = code.split('\n');
      var indent = null;

      for (var i = 0; i < lines.length; i++) {
        if (/^[  ]*$/.test(lines[i])) continue;
        if (!indent) {
          var lineindent = lines[i].match(/^([    ]+)/);
          if (!lineindent) break;
          indent = lineindent[1];
        }
        lines[i] = lines[i].replace(new RegExp('^' + indent), '');
      }

      var code = $.trim(lines.join('\n')).replace(/   /g, '    ');
      var $pre = $('<pre>').addClass('js').text(code);
      $pre.insertAfter(this);
    }
  });

  // show current input values
  $('select.selectized,input.selectized', $wrapper).each(function () {
    var $container = $('<div>').addClass('value').html('Current Value: ');
    var $value = $('<span>').appendTo($container);
    var $input = $(this);
    var update = function (e) {
      $value.text(JSON.stringify($input.val()));
    }

    $(this).on('change', update);
    update();

    $container.insertAfter($input);
  });
});