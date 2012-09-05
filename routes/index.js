var restler = require('restler');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.get_events = function(req, res){
    var request = restler.get("http://juicer.responsivenews.co.uk/events.json");

    request.on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error: ' + result.message);
      } else {
        console.log(result);

        res.json(result);
      }
    });

};
