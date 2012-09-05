function getEvents(callback){

	var jqxhr = $.ajax( "/events");

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

function getEvent(){

}

function isValid(event){

}
