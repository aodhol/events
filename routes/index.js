var restler = require('restler');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.panel = function(req, res){
  res.render('panel');
};

exports.articles = function(req, res){
  var request = restler.get("http://juicer.responsivenews.co.uk/events.json");

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error: ' + result.message);
      } else {
        console.log(result);

        res.render('articles', {
          title: 'Articles',
          data: JSON.stringify(result)
        });
      }
    });
};

// exports.get_events = function(req, res){
    
//     var request = restler.get("http://juicer.responsivenews.co.uk/events.json");

//     request.on('complete', function(result) {
//       if (result instanceof Error) {
//         console.log('Error: ' + result.message);
//       } else {
//         console.log(result);

//         res.json(result);
//       }
//     });

// };

function getTlDate(dateStr){
    var date = new Date(dateStr);
    return date.getYear() + "," + date.getMonth() + "," + date.getDate();

}

function transform(event){

    var eventStart = new Date(event.start_at);
    var eventEnd = new Date(event.end_at);
    var tlStartDate = getTlDate(event.start_at);
    //var tlEndDate = getTlDate(event.end_at);

/*
[
{
cps_id: "19484240",
description: "The new UN and Arab League envoy for Syria, Lakhdar Brahimi, tells the UN the death toll in the conflict is "staggering" and the destruction "catastrophic".",
id: 1169866,
published: "2012-09-04T21:40:32Z",
title: "Syria envoy Lakhdar Brahimi warns of 'staggering' crisis",
url: "http://www.bbc.co.uk/news/world-middle-east-19484240"
},
{
*/
    var articles = event.articles;

    var items = [];

    for(var i = 0; i < articles.length; i++){

        var article = articles[i];
        
        var pubDate = getTlDate(article.published);

        var tlEvent = {
            "startDate":pubDate,
            "endDate":pubDate,
            "headline":article.title,
            "text":article.description,
            "asset":
            {
                "media":"http://static.guim.co.uk/sys-images/Guardian/About/General/2012/9/4/1346781155318/Syrian-refugees-at-the-Za-008.jpg",
                "credit":"",
                "caption":""
            }
        };

        items.push(tlEvent);
    }

    var tlEvent = {
        "timeline":
        {
            "headline":event.title,
            "type":"default",
            "text":event.description,
            "startDate":tlStartDate,
            "date": items
        }        
    };

    return tlEvent;
}

function getArticle(articleId,callback){
    
    var request = restler.get("http://juicer.responsivenews.co.uk/articles/" + articleId + ".json");

    request.on('complete', function(result) {
      if (result instanceof Error) {
        callback(result,null);
      } else {
        callback(null,result);
      }
    });
}

exports.get_event = function(req, res){

    var eventId = req.param('id');

    var request = restler.get("http://juicer.responsivenews.co.uk/events/" + eventId + ".json");

    console.log("http://juicer.responsivenews.co.uk/events/" + eventId)

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error: ' + result.message);
      } else {

        //res.send instead of res.json as callback automatically added and causes problems
        //on front end..
        

         res.send(JSON.stringify(transform(result)));
      }
    });
}

exports.get_events = function(req, res){
    
//    res.send(JSON.stringify(result));

}

exports.timeline = function(req,res){

    var id = req.param('event_id');

    res.render("timeline",{"event_id":id});
}   

