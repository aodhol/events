events
======

Singular event: http://juicer.responsivenews.co.uk/api/events/7

Multiple events: 
GET http://juicer.responsivenews.co.uk/api/events?binding=e&where=?e rdf:type pne:Event .&limit=50

POST http://juicer.responsivenews.co.uk/api/events?binding=e&limit=50
body:
?e rdf:type pne:Event .



Articles feed with images:
http://juicer.responsivenews.co.uk/api/articles?binding=s&limit=5&where=%3Fs%20%3Chttp%3A%2F%2Fdata.press.net%2Fontology%2Ftag%2Fabout%3E%20%3Chttp%3A%2F%2Fjuicer.responsivenews.co.uk%2Fevents%2F7%3E%20.

Query becomes: ?s <http://data.press.net/ontology/tag/about> <http://juicer.responsivenews.co.uk/events/7> .




Notes
=====
* Limit param defaults to 10 and has a max range of 50