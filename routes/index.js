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
                "media":"http://localhost:5000/image/" + article.cps_id + ".jpg",
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

exports.list_event_articles = function(req,res){

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
            ids.push(result.articles[i].cps_id);
        }

        res.send(JSON.stringify(ids));

      }
    });
}

exports.event_article = function(req,res){
    var eventId = req.param('event_id');

    res.render('event-article',{"event_id":eventId});

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

exports.get_events = function(req, res){
     
    var request = restler.get("http://juicer.responsivenews.co.uk/events.json");

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log("Error:",result);
      } else {//
        res.render("events",{"events":result,layout:true});
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
        res.setHeader('Cache-Control', 'public, max-age=' + 3600);
        res.json(result);
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


