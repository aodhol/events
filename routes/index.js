var restler = require('restler'),
    url = require('url'),
    http = require('http');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.panel = function(req, res){
  res.render('panel');
};

exports.panel2 = function(req, res){
  res.render('panel2');
};

exports.timeaxis = function(req, res) {
  res.render('timeaxis');
}

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

exports.image = function(req,res){

    var id = parseInt(req.param('id'));

    var request = restler.get("http://juicer.responsivenews.co.uk/articles/" + id + ".json");

    console.log("URL:" + "http://juicer.responsivenews.co.uk/articles/" + id + ".json")

    request.on('complete', function(result) {

      if (result instanceof Error) {
        console.log('Error: ' + result.message);
        res.send();
      } else {

       if(result.article){

        var parsedUrl = url.parse(result.article.full_data.image.origin);

        var options = {
          host: parsedUrl.host,
          port: 80,
          path: parsedUrl.path,
          method: 'GET'
        };

        var data = '';

        var imgReq = http.request(options, function(imgRes) {

            imgRes.setEncoding('binary');

            imgRes.on('data', function (chunk) {
              data += chunk;
            });
          
            imgRes.on('end',function(){
              var image = new Buffer(data, 'binary');
              res.setHeader('Cache-Control', 'public, max-age=' + 3600);
              res.writeHead(200, {'Content-Type': 'image/jpg','Content-Length' : image.length});
              res.end(image);
            });

        });

        imgReq.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });

        imgReq.end();

        }else{
            res.send();
        }
    }

    });

}

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

       // console.dir(article)
        
        var pubDate = getTlDate(article.published);

        var articleText =
          '<div class="panel">'
            + '<h2 class="title mod">'
              + '<img src="http://news.bbcimg.co.uk/media/images/62400000/jpg/_62400998_introduction.jpg" />'
              + '<span class="title-text">' + article.title + '</span>'
            + '</h2>'
            + '<span class="date">' + pubDate + '</span>'
            + '<p class="description">' + article.description + '</p>'
            + '<a class="full" href="' + article.url + '">Read full article</a>'
            + '<div class="mod">';

            for (keyword in event.concepts) {
              articleText += '<span class="keyword">' + event.concepts[keyword].label + '</span>';
            }
              
            articleText += '</div>';

            if (article.places.length) {
              articleText += '<h3 class="">Places</h3>';

              for (place in article.places) {
                articleText += '<span class="place keyword">' + article.places[place].name + '</span>';
              }
            }

            if (article.people.length) {
              articleText += '<h3 class="">People</h3>';

              for (person in article.people) {
                articleText += '<span class="person keyword">' + article.people[person].name + '</span>';
              }
            }

            if (article.organisations.length) {
              articleText += '<h3 class="">Organisations</h3>';

              for (organisation in article.organisations) {
                articleText += '<span class="organisation keyword">' + article.organisations[organisation].name + '</span>';
              }
            }

          articleText += '</div>';

        var tlEvent = {
            "startDate":pubDate,
            "endDate":pubDate,
            "headline":article.title,
            "text":'',
            "asset":
            {
                "media":"/image/" + article.cps_id + ".jpg",
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

function getEventInfo(eventId,callback){

  
  var request = restler.get("http://juicer.responsivenews.co.uk/events/" + eventId + ".json");

  request.on('complete', function(result) {
    if (result instanceof Error) {
      console.log('Error: ' + result.message);
    } else {

      if(result.end_at == null){
        result.end_at = new Date().toISOString();
      }

      if(result.parent_id != null){
        getEventInfo(result.parent_id, function(parentResult){
          callback({"title":result.title,"parent_title":parentResult.title, "start_at":result.start_at, "end_at":result.end_at});
        });

      }else{
         callback({"title":result.title,"parent_title":null, "start_at":result.start_at, "end_at":result.end_at});
      }
    
    }
  });
}


exports.list_event_articles = function(req,res){

  console.log("listing event articles");

    var eventId = req.param('event_id');

    var request = restler.get("http://juicer.responsivenews.co.uk/events/" + eventId + ".json");

    console.log("http://juicer.responsivenews.co.uk/events/" + eventId);

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error: ' + result.message);
      } else {

        //res.send instead of res.json as callback automatically added and causes problems
        //on front end..
        res.setHeader('Cache-Control', 'public, max-age=' + 3600);
        
        var ids = [];

        for(var i = 0; i < result.articles.length; i++){
          ids.push({"id":result.articles[i].cps_id,
            "published":result.articles[i].published,
            "title":result.articles[i].title,
            "highlight":(i % Math.floor(Math.random() * result.articles.length) == 0)});
        }

        console.log("listed event articles");

        getEventInfo(result.id,function(data){
         res.json({"article_ids":ids,
          "agents":result.agents,
          "places":result.places,
          "concepts":result.concepts,
          "end_at":result.end_at,
          "start_at":result.start_at,
          "parent_title":data.parent_title});      
        });
      }
    });
}

exports.event_article = function(req,res){

    var eventId = req.param('event_id');

  //  res.setHeader('Cache-Control', 'public, max-age=' + 3600);

    var request = restler.get("http://juicer.responsivenews.co.uk/events/" + eventId + ".json");

    console.log("http://juicer.responsivenews.co.uk/events/" + eventId);

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error: ' + result.message);
      } else {

        //res.send instead of res.json as callback automatically added and causes problems
        //on front end..
        
        var ids = [];

        for(var i = 0; i < result.articles.length; i++){
          ids.push({"id":result.articles[i].cps_id,"published":result.articles[i].published,"title":result.articles[i].title, "highlight":true});
        }

        console.log("listed event articles");

        getEvents(function(error,data){
          var relatedEvents = null;
          if (error instanceof Error) {
            console.log("Error:",data);
          }else{
            relatedEvents = getChildEvents(eventId,data);
          }

          getEventInfo(result.id,function(data){
           res.render("event-article-new",{
            "article_ids":ids,
            "agents":result.agents,
            "places":result.places,
            "concepts":result.concepts,
            "end_at":result.end_at,
            "start_at":result.start_at,
            "parent_id":result.parent_id,
            "parent_title":data.parent_title,
            "title":data.title,
            "event_id":eventId,
            "relatedEvents":relatedEvents,
            "start_at":data.start_at,
            "end_at":data.end_at
            });      
          });

        });

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
         res.setHeader('Cache-Control', 'public, max-age=' + 3600);

         res.send(JSON.stringify(transform(result)));
      }
    });
}


function getChildEvents(parentId,events){
  
  var childEvents = [];

  for(var i = 0; i < events.length; i++){
    if(events[i].parent_id == parentId){      
      childEvents.push(events[i]);
    }
  }

  return childEvents;

}

function relate(events){

  var parentEvents = [];
  var parentEventsById = [];
  var childEvents = [];

  for(var i = 0; i < events.length; i++){
    if(events[i].parent_id == null){
      parentEventsById[events[i].id] = events[i];
      parentEvents.push(events[i]);
    }else{
      childEvents.push(events[i]);
    }
  }

  for(var i = 0; i < childEvents.length; i++){
    var childEvent = childEvents[i];
    var parentEventId = childEvent.parent_id;
    var parentEvent = parentEventsById[parentEventId];
    if(parentEvent.childEvents == undefined){
      parentEvent.childEvents = [];
    }
    parentEvent.childEvents.push(childEvent);
  }

  return parentEvents;

}

function getEvents(callback){
  var request = restler.get("http://juicer.responsivenews.co.uk/events.json");

  request.on('complete', function(result) {
    if (result instanceof Error) {
      console.log("Error:",result);
      callback(result,null);
    } else {//
      callback(null,result)
    }
  });
}


exports.get_events = function(req, res){   
    getEvents(function(error,data){
      if (error instanceof Error) {
        console.log("Error:",data);
      } else {
        var related = relate(data);
        res.render("events",{"events":data,"related":related});
      }
    });
}

exports.article = function(req,res){
    
    var id = parseInt(req.param('id'));

    var request = restler.get("http://juicer.responsivenews.co.uk/articles/" + id + ".json");

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log("Error:",result);
      } else {//
        console.log("setting cache header");
        res.setHeader('Cache-Control', 'public, max-age=' + 3600);
        //res.json(result);
        res.render("story",result);
      }
    });
}

exports.timeline = function(req,res){

    var id = req.param('event_id');

    res.render("timeline",{"event_id":id});
}   

exports.concept = function(req,res){

    var title = req.param('concept_title');

    var request = restler.get("http://juicer.responsivenews.co.uk/concepts/" + title + ".json");

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log("Error:",result);
      } else {
        res.render("concept",{"concept":result});
      }
    });

}   


