
// Setting the colours for the background
var uiGradientsUrl = 'https://cdn.rawgit.com/Ghosh/uiGradients/master/gradients.json';
var JSONURL = 'https://spreadsheets.google.com/feeds/list/164rk8vkuSo3SknvTcna-uqUBwb5a4CdFGiPyzRCoUSM/1/public/basic?alt=json';

var html = $('html'),
    helper = $('.helper'),
    title = $('.title'),
    gradientsList,
    activeGradient,
    i = 0;

$.getJSON(uiGradientsUrl, function(data) {
    gradientsList = data;
    // Shuffle Array
    gradientsList.sort(function() {
        return 0.5 - Math.random();
    });
});

var bgChangeInterval = function() {
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

window.onload = function() {
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
    $('.teletype').each(function(index) {
        var c = $(this).html().split("");
        $(this).html('');
        teletype(c, $(this));
    });

    function teletype(c, t) {
        var i = 0;
        setInterval(function() {
            if (i < c.length) {
                t.append(c[i]);
                i++;
            }
        }, 70);
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

function callback(data){
    var rows = [];
    var cells = data.feed.entry;
    
    for (var i = 0; i < cells.length; i++){
        var rowObj = {};
        rowObj.quote = cells[i].title.$t;
        var rowCols = cells[i].content.$t.split(',');
        for (var j = 0; j < rowCols.length; j++){
            var keyVal = rowCols[j].split(':');
            rowObj[keyVal[0].trim()] = keyVal[1].trim();
        }
        rows.push(rowObj);
    }
    var tag = getParameterByName('tag');
    var filteredQuotes = rows.filter(function (el) {
      return el.tag.toLowerCase() === tag.toLowerCase();
    });
    var quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)].quote;
    $('#val').text(quote);
    typeIt();
}

$(document).ready(function(){
    $.ajax({
        url:JSONURL,
        success: function(data){
            callback(data);
        }
    });
});
