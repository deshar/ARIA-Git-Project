function checkCompanyTicker(){
	if (document.getElementById("company").value == ""){
			document.getElementById("company").value="google";
	}

	var company = document.getElementById("company").value
	$("div#headlines").text("");
	$("div#headlines").text("Ticker IDs for " + company);

	var yqlUrl2 = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fd.yimg.com%2Fautoc.finance.yahoo.com%2Fautoc%3Fquery%3D" + company + "%26callback%3DYAHOO.Finance.SymbolSuggest.ssCallback%22&format=json&callback=?";
	$.getJSON(yqlUrl2, function (data) {

		var items = [];
		//variable to hold the contents of p. the contents of p is a serialised json array
		var innerp = data.query.results.body.p;

		//replacing the unnecessary strings to leave just the serialised array
		innerp = innerp.replace("YAHOO.Finance.SymbolSuggest.ssCallback", "");
		innerp = innerp.replace("(", "");
		innerp = innerp.replace(")", "");

		//parsing the string back into json
		innerp = JSON.parse(innerp);

		//setting innerp to be the results of the parsed json
		innerp = innerp.ResultSet.Result;		
		
		//double for loop to loop through each result and each key value pair in each result
		$.each(innerp, function (result) {
			$.each(innerp[result], function (key, val) {
				if (key == "symbol")
					items.push('<p id="' + val + '"><strong><a href="#ticker">' + val  + '</a></strong>' + '<em>' + ' on the ' + '</em>');
				if (key == "exchDisp")
					items.push('<strong>' + val + '</strong><em>' + ' exchange' + '</em>' + '</p>');
			});			
		});
		$('<p/>', {
			'class': 'my-new-list',
			html: items.join('')
		}).appendTo($('#headlines'));
		
		$("div#headlines p a").click(function() {
			var sym = this.innerHTML;
			checkAndSetField(sym);			
		});
	});
}