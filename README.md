events
======

Singular event: http://juicer.responsivenews.co.uk/api/events/7

Multiple events: 
GET http://juicer.responsivenews.co.uk/api/events?binding=e&where=?e rdf:type pne:Event .&limit=50

POST http://juicer.responsivenews.co.uk/api/events?binding=e&limit=50
body:
?e rdf:type pne:Event .



Notes
=====
* Limit param defaults to 10 and has a max range of 50