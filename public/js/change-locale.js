bbc.newsPrototype.changeLocale = {	
	/**
	 * Init the script
	 */
	_savedSearchCookie: null,
	
	init: function () {
		var that = this;

		this._savedSearchCookie = $('#locator').data('save-search-cookie-name');

		$('#content').click(function (e) {
			var action = $(e.target).data('action');
			switch(action) {
				case 'locator-geolocation-find':
					that._getGeoLocation();
					e.preventDefault();
					break;
				
				case 'locator-search-submit':
					var target = $(e.target).closest('form').find('.locator-search-input input'),
						searchVal = target.val();
					
					if (!$('#searched-content').children('h2').length) {
						$('#searched-content').prepend('<h2 data-title="news-item-title">Searched News</h2>');
					}
					
					that._updateContent($('#searched-content .content'), searchVal);
					e.preventDefault();
					break;
				
				case 'delete-search':
					var target = $(e.target).closest('.content-item'),
						location = $(e.target).data('location').toLowerCase(),
						inputVal = $('#locator-search-input').val();
						
					$(target).slideUp(function () {
						$(this).remove();
						
						var savedItems = that._getCookieValue(that._savedSearchCookie).split(','),
							newCookieValue = '';
						
						$.each(savedItems, function(i, val) {
							if (val !== location) {
								newCookieValue += (newCookieValue ? ',' : '') + val;
							}
						});
						that._setNewCookie(that._savedSearchCookie, newCookieValue);
					});
					
					if($('#cant-delete')) {
						$('#cant-delete').replaceWith('<a href="#" data-action="save-search" data-location="' + inputVal.toLowerCase() + '" class="save-item">Save Location</a>');
					}
					e.preventDefault();
					break;
					
				case 'save-search':
					var cookieValue = that._getCookieValue(that._savedSearchCookie),
						target = $(e.target).closest('.save-item');
					
					cookieValue += (cookieValue ? ',' : '') + $(e.target).data('location');

					that._setNewCookie(that._savedSearchCookie, cookieValue);
					
					target.replaceWith('<p>Item saved</p>');
					e.preventDefault();
					break;	
			}
		});
		
		if (bbc.newsPrototype.regionNations) {
			that._searchInputAutoComplete();
		}
	},

	_searchInputAutoComplete: function () {	
		var that = this,
			target = $('#locator-search-input');

		target.attr('autocomplete', 'off');
		target.autocomplete({
			source: bbc.newsPrototype.regionNations
		}).keypress(function (e) {
			// 13 = Enter
		    if (e.which == 13) {
	        	that._updateContent($('#searched-content .content'), target.val());
	        	e.preventDefault();
		    }
		});
	},
	
	/**
	 * @param jQuery DOM object
	 * @param string
	 * Call in new content 
	 */
	_updateContent: function (contextDom, locationName) {
		var that = this,
			location = locationName.toLowerCase(),
			spinner = $('<img />', {
				'src': '/img/ajax-loader.gif',
				'width': '32',
				'height': '32',
				'class' : 'ajax-loader'
			});
		
		that._currentContentVal = location;
		
		contextDom.html(spinner);
		
		$.ajax({
			url: "/search/" + location,
			context: contextDom
		}).done(function(data) {
		  	$(this).fadeOut(function () {
		  		var savedItemCount = that._getCookieValue(that._savedSearchCookie).split(',').length;
		  		if (savedItemCount < 2) {
		  			$(this).html('<a href="#" data-action="save-search" data-location="' + location + '" class="save-item">Save Location</a>');
		  		} else {
		  			$(this).html('<p id="cant-delete">Delete an item to be able to save this search</p>');
		  		}
		  		$(this).append($(data));
	 		 }).fadeIn();
		}).fail(function () {
			console.error('broken');
		});
	},
	
	/**
	 * Activate a browsers HTML5 Geo Location API and append local content
	 */
	_getGeoLocation: function () {
		var that = this;
		//geolocation 
		if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function (position) {
            	$.getJSON('/locator?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude, function(data) {
					var name = data.name;
					that._setNewCookie('newLocal', name);
					that._updateContent($('#local-content .content'), name);
                });
            });
        }
	},
	
	/**
	 * @param string
	 * @param string
	 * Set a cookie
	 */
	_setNewCookie: function (cookieName, value) {
		var cookieName = 'bbcNews_' + cookieName;
		if ($.cookie(cookieName) !== value) {
			$.cookie(cookieName, value);
		}
	},
	
	/**
	 * @param string
	 * Get a cookie
	 */
	_getCookieValue: function (cookieName) { 
		var cookieName = 'bbcNews_' + cookieName,
			cookieValue = $.cookie(cookieName);
		
		if (!cookieValue) {
			cookieValue = ''; 
		}
		
		return cookieValue;
	}
};