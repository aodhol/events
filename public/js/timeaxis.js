var fontHeight = 16,
	scaleKey,
	scaleValue,
	scaleIndex,
	keyWidth,
	articleTimelineKey = 'published',
	ev,
	start,
	end,
	articleId,
	maxKeys = { 'days':40, 'hours':36, 'months':18, 'years':100 },
	canvas = null,
	months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
	colours = { 'background': '#fff', 'article':'#ccc', 'current':'#f87217' };

var TimeAxis = function(){
	this.init();
};

TimeAxis.prototype.init = function(){
				
	canvas = document.getElementById('timeaxis'),
		context = canvas.getContext('2d'),
		canvasHeight = canvas.height,
		canvasWidth = window.innerWidth,
		fontHeight = 16,
		/**scaleKey,
		scaleValue,
		scaleIndex,
		keyWidth,
		articleTimelineKey = 'published',
		ev,
		start,
		end,
		articleId,
		maxKeys = { 'days':40, 'hours':36, 'months':18 },
		months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
		colours = { 'background': '#fff', 'article':'#ccc', 'current':'#c11b17' },**/
		self = this;

		canvas.width = canvasWidth;

		window.addEventListener('resize', function () { self.resizeCanvas(self); }, false);
}



TimeAxis.prototype.renderTimeline = function(event, currentArticleId) {
	ev = event;
	articleId = currentArticleId;
	start = new Date(ev.start_at);
	end = new Date(ev.end_at);
	var datediff = end.getTime() - start.getTime(),
		seconds = datediff / 1000,
		minutes = seconds / 60,
		hours = minutes / 60,
		days = hours / 24,
		monthsTotal = days / 30,
		years = monthsTotal / 12;

	if (hours < maxKeys['hours']) {
		scaleKey = 'hours';
		scaleValue = hours;
	} else if (days < maxKeys['days']) {
		scaleKey = 'days';
		scaleValue = days;
	} else if (monthsTotal < maxKeys['months']) {
		scaleKey = 'months';
		scaleValue = months;
	} else {
		scaleKey = 'years';
		scaleValue = years;
	}

	this.getSizes();
	this.background();
	this.addArticles();
	this.addKey();
}

TimeAxis.prototype.resizeCanvas = function(self) {
	self.getSizes();
	self.background();
	self.addArticles();
	self.addKey();
}

TimeAxis.prototype.getSizes = function() {
	canvasWidth = window.innerWidth;
	canvas.width = canvasWidth;
	keyWidth = canvasWidth / scaleValue;
}

TimeAxis.prototype.background = function() {
	context.fillStyle = colours.background;
	context.fillRect(0, 0, canvas.width, canvas.height);
}

TimeAxis.prototype.addArticles = function() {
	for (article in ev.articles) {
		var articleDate = new Date(ev.articles[article][articleTimelineKey]);

		diff = this.getDateShort(articleDate).getTime() - this.getDateShort(start).getTime();
		if (scaleKey !== 'hours') {
			fullDiff = this.getDateShort(end).getTime() - this.getDateShort(start).getTime();
			position = (canvasWidth / fullDiff) * diff;
		} else {
			position = Math.floor(diff / (1000 * 60 * 60));
		}

		this.addMarker(position, (ev.articles[article].id === articleId));
	}
}

TimeAxis.prototype.getDateShort = function (date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

TimeAxis.prototype.addMarker = function(point, current) {
	width = (scaleKey !== 'days') ? 4 : keyWidth;
	context.fillStyle = (current) ? colours.current : colours.article;
	context.fillRect(point, 0, width, canvas.height / 4);
}

TimeAxis.prototype.addKey = function() {
	context.fillStyle = 'black';
	context.font = 'bold 12px Arial';
	var currentDate = new Date(start.getTime()),
		position = 0,
		count = 0,
		currentDay,
		currentMonth,
		currentYear,
		displaySwitch = (Math.floor(currentDate.getDate() % 2));

	while (currentDate <= end) {
		//if (scaleKey === 'days') {
		if (!(count % 2) || scaleValue < maxKeys[scaleKey]/2) {
			if (scaleKey === 'hours') {
				console.log('hours');
			}
			if (scaleKey === 'days') {
				context.fillText(currentDate.getDate(), position, canvasHeight - (fontHeight) * 2);
			}
			if (currentMonth !== currentDate.getMonth()) {
				currentMonth = currentDate.getMonth();
				context.fillText(months[currentMonth], position, canvasHeight - fontHeight);
			}
			//console.log(currentDate.getFullYear());
			if (currentYear !== currentDate.getFullYear()) {
				currentYear = currentDate.getFullYear();
				context.fillText(currentYear, position, canvasHeight - 2);
			}
		}
		//}
		position += keyWidth;
		count++;
		if (scaleKey === 'days') {
			currentDate.setDate(currentDate.getDate() + 1);
		} else if (scaleKey === 'years') {
			currentDate.setFullYear(currentDate.getFullYear() + 1);
		}
	}
	
}


