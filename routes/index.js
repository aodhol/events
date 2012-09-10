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

exports.panel2 = function(req, res){
  res.render('panel2');
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
            "text":articleText
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
     
    var request = restler.get("http://juicer.responsivenews.co.uk/events.json");

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log("Error:",result);
      } else {
        res.render("events",{"events":result});
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


