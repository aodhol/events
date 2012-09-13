var articleIndex = 0;

var articleIds = [];

function getArticleIds(eventId,callback){

	var jqxhr = $.ajax( "/articles/list/" + eventId);

	console.log("getting articles:/articles/list/" + eventId)

	jqxhr.done(function(data) {
		callback(null,data);
	});

	jqxhr.error(function(error){
		callback(error,null);
	});

	jqxhr.fail(function(e) {
		callback(e,null)
	});
}

function getArticleId(index){
	//console.log("article id at index:" + arr[0]);
	return articleIds[index];
}

var cache = [];
var requests = [];
function getArticle(index,callback){

	console.log("Getting article for index:" + index);

	if(requests[index] == undefined && cache[index] == undefined){

		console.log("is undefined 2");
		requests[index] = 1;

		if(cache[index] != undefined){
			console.log("cache hit");
			callback(null,cache[index]);
			return;
		}else{
			console.log("cache miss");
		}

		var articleId = articleIds[index].id;//getArticleId(index);
		
		console.log("getting:" + "/article/" + articleId);
		
		var jqxhr = $.ajax( {"url":"/article/" + articleId,
			"cache":true
		});

		jqxhr.done(function(data) {
			
			console.log("pushing story to cache index:" + index);

			cache[index] = data;
			callback(null,data);
		});

		jqxhr.error(function(error){
			callback(error,null);
		});

		jqxhr.fail(function(error) {
			callback(error,null)
		});


	}else{
		return;
	}
}