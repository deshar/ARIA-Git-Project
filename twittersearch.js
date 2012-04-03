function getEl(id){
		return document.getElementById(id);
	}
function displayStats(){
	if (!window.localStorage){ return; }
	var i = 0;
	var key = "";
	var index = [];
	var cachedSearches = [];
	var graphAxes = [];
	for (i=0;i<localStorage.length;i++){
		key = localStorage.key(i);
		if (key.indexOf("index::") == 0){
			index = JSON.parse(localStorage.getItem(key));
			cachedSearches.push ({keyword: key.slice(7), numResults: index.length});
			}
		}
		cachedSearches.sort(function(a,b){
		if (a.numResults == b.numResults){
			if (a.keyword.toLowerCase() < b.keyword.toLowerCase()){
				return -1;
			} else if (a.keyword.toLowerCase() > b.keyword.toLowerCase()){
				return 1;
			}
			return 0;
		}
		return b.numResults - a.numResults;
	}).slice(0,10).forEach(function(search){
		var li = document.createElement("li");
		var txt = document.createTextNode(search.keyword + " : " + search.numResults);
		li.appendChild(txt);
		getEl("stats").appendChild(li);
	});
	displayGraph(cachedSearches.slice(0,10));
}

function displayGraph(cSearches) {
	Highcharts.theme = {
	   colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
	   chart: {
	      backgroundColor: {
		 linearGradient: [0, 0, 500, 500],
		 stops: [
		    [0, 'rgb(255, 255, 255)'],
		    [1, 'rgb(240, 240, 255)']
		 ]
	      },
	      borderWidth: 2,
	      plotBackgroundColor: 'rgba(255, 255, 255, .9)',
	      plotShadow: true,
	      plotBorderWidth: 1
	   },
	   title: {
	      style: {
		 color: '#000',
		 font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
	      }
	   },
	   subtitle: {
	      style: {
		 color: '#666666',
		 font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
	      }
	   },
	   xAxis: {
	      gridLineWidth: 1,
	      lineColor: '#000',
	      tickColor: '#000',
	      labels: {
		 style: {
		    color: '#000',
		    font: '11px Trebuchet MS, Verdana, sans-serif'
		 }
	      },
	      title: {
		 style: {
		    color: '#333',
		    fontWeight: 'bold',
		    fontSize: '12px',
		    fontFamily: 'Trebuchet MS, Verdana, sans-serif'

		 }
	      }
	   },
	   yAxis: {
	      minorTickInterval: 'auto',
	      lineColor: '#000',
	      lineWidth: 1,
	      tickWidth: 1,
	      tickColor: '#000',
	      labels: {
		 style: {
		    color: '#000',
		    font: '11px Trebuchet MS, Verdana, sans-serif'
		 }
	      },
	      title: {
		 style: {
		    color: '#333',
		    fontWeight: 'bold',
		    fontSize: '12px',
		    fontFamily: 'Trebuchet MS, Verdana, sans-serif'
		 }
	      }
	   },
	   legend: {
	      itemStyle: {
		 font: '9pt Trebuchet MS, Verdana, sans-serif',
		 color: 'black'

	      },
	      itemHoverStyle: {
		 color: '#039'
	      },
	      itemHiddenStyle: {
		 color: 'gray'
	      }
	   },
	   labels: {
	      style: {
		 color: '#99b'
	      }
	   }
	};

	// Apply the theme
	var highchartsOptions = Highcharts.setOptions(Highcharts.theme);
	var chart1; // globally available
	var cats = [];
	var vals = [];					
	for(i=0; i<cSearches.length; i++) {
		cats.push(cSearches[i].keyword);
		vals.push(cSearches[i].numResults);
	}
	$(document).ready(function() {
	      chart1 = new Highcharts.Chart({
		 chart: {
		    renderTo: 'container',
		    type: 'bar'
		 },
		 title: {
		    text: 'Twitter Searches'
		 },
		 xAxis: {
		    categories: cats
		 },
		 yAxis: {
		    title: {
		       text: 'No of Tweets'
		    }
		 },
		 series: [{ data: vals}]

	      });
	});
}

function clearTwitter() {
	localStorage.clear();
	$("div#confirmed").text("Stats now deleted");
	$("div#results").text("");
	}

function handleOnStorage() {
	if (window.event && window.event.key.indexOf("index::") == 0){
		$("div#stats").text = "";
		displayStats();
	}
}
function searchTwitter(){
	if (getEl("resultsTable")){		
		getEl("resultsTable").innerHTML = ""; // clear results
	}
	makeResultsTable();
	var keyword = getEl("kwBox").value;
	maxId = loadLocal(keyword);
	var query = "http://search.twitter.com/search.json?callback=processResults&include_entities=true&q=";
	query += keyword;
	if (maxId){
		query += "&since_id=" + maxId;
	}
	var script = document.createElement("script");
	script.src = query;
	document.getElementsByTagName("head")[0].appendChild(script);
}
function loadLocal(keyword){
	if (!window.localStorage){
		return;
	}
	var index = localStorage.getItem("index::" + keyword);
	var tweets = [];
	var i = 0;
	var tweet = {};
	if (index){
		index = JSON.parse(index);
		for (i=0;i<index.length;i++){
			tweet = localStorage.getItem("tweet"+index[i]);
			if (tweet){
				tweet = JSON.parse(tweet);
				tweets.push(tweet);
			}
		}
	}
	if (tweets.length < 1){
		return 0;
	}
	tweets.sort(function(a,b){
		return a.id - b.id;
	});
	addTweetsToResultsTable(tweets);
	return tweets[0].id;
}
function processResults(response){
	var keyword = getEl("kwBox").value;
	var tweets = response.results;
	tweets.forEach(function(tweet){
		tweet.linkUrl = "https://twitter.com/" + tweet.from_user + "/status/" + tweet.id;
		saveTweet(keyword, tweet);		
	});
	makeResultsTable();
	addTweetsToResultsTable(tweets);
}
function saveTweet(keyword, tweet){
	if (!window.localStorage){
		return;
	}
	// save the tweet
	if (localStorage.getItem("tweet" + tweet.id)){
		// already stored it, so return
		return;
	}
	localStorage.setItem("tweet" + tweet.id, JSON.stringify(tweet));
	var index = localStorage.getItem("index::" + keyword);
	if (index){
		index = JSON.parse(index);
	} else {
		index = [];
	}

	index.push(tweet.id);
	localStorage.setItem("index::"+keyword, JSON.stringify(index));
}
function makeResultsTable(){
	var html = getEl("results").innerHTML;
	html = String(html).trim();
	if (!html || html.length < 1){
		getEl("results").innerHTML = "<table id='resultsTable'></table>";
	}
}
function addTweetsToResultsTable(tweets, insert){
	makeResultsTable();
	var cnt = 1;
	var rows = tweets.map(function(tweet){
		cnt++;
		return createResult(tweet.from_user, tweet.profile_image_url, tweet.text,
				tweet.linkUrl, cnt % 2 == 0);
	});
	var resultsTable = getEl("resultsTable");
	if (maxId){
		rows.reverse();
		rows.forEach(function(row){
			var rowOne = resultsTable.firstChild;
			resultsTable.insertBefore(row, rowOne);
		});
	} else {
		rows.forEach(function(row){
			resultsTable.appendChild(row);
		});
	}
}
function createResult(srcName, srcImgUrl, title, linkUrl, odd){
    var resultsRow = document.createElement("tr");
    if (odd){
	resultsRow.setAttribute("class", "odd");
    }
    var srcCell = document.createElement("td");
    srcCell.setAttribute("class","src");
    resultsRow.appendChild(srcCell);
    var icon = document.createElement("img");
    icon.src = srcImgUrl;
    icon.setAttribute("alt", srcName);
    icon.setAttribute("height", 48);
    icon.setAttribute("width", 48);
    srcCell.appendChild(icon);
    srcCell.appendChild(document.createTextNode(srcName));
    var messageCell = document.createElement("td");
    messageCell.setAttribute("class","msg");
    var link = document.createElement("a");
    link.setAttribute("href", linkUrl);
    link.setAttribute("target", "_blank");
    link.appendChild(document.createTextNode(title));
    messageCell.appendChild(link);
    resultsRow.appendChild(messageCell);
    return resultsRow;
}
