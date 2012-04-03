function checkAndSetField(sym){
	
	var stTicker=sym;
	$("div#headlines").text("");
	$("div#headlines").text("Results for " + stTicker);

	var yqlUrl2="http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Ffinance.yahoo.com%2Fq%3Fs%3D"+stTicker+"%22%20and%20xpath%3D'%2F%2Fdiv%5B%40id%3D%22yfi_headlines%22%5D%2Fdiv%5B2%5D%2Ful%2Fli%2Fa'&format=json&callback=?";
	$.getJSON(yqlUrl2, function(data){
		$.each(data.query.results.a, function(index, item){
			$("<a href='" + item.href + "' target=\"_blank\"/>")
			.html(item.content)
			.appendTo($('#headlines'))
			.wrap('<p/>');
			});
		});
}