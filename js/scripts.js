// Adapted from http://uhnomoli.com/2014/01/10/Rolling-your-own-PJAX-implementation-with-History.js/

var Hijax = {
	settings: {
		content: '#main', // string only, not the jQuery object
		$window: $(window),
		$ajax_links: $('.main-header a'),
		fade_duration: 300,
	},
	init: function() {
		Hijax.bind();
	},
	bind: function(){
		
		var root = History.getRootUrl();
		
		// on click
		Hijax.settings.$ajax_links.click(function(event) {
			
			if (event.which == 2 || event.ctrlKey || event.metaKey) {
				return true;
			}
			Hijax.update_nav(this);
			History.pushState(null, null, $(this).attr('href'));
			
			event.preventDefault();
			
			return false;
		});
		
		
		// on window state change
		Hijax.settings.$window.on('statechange', function () {
			var
			url = History.getState().url,
			rel = url.replace(root, '/');
			
			
        
			$.get(rel).done(function (data) {
				var response = Hijax.parse_response(data);
            
				if (!response.$content.length) {
					document.location.href = url;
                
					return false;
				}
            
				var $content = $(Hijax.settings.content);
            
				if (response.title.length) {
					$('title').last().html(response.title);
				}
            
				$content
				.addClass('exit')
				.fadeOut(Hijax.settings.fade_duration, function(){
					$(this).removeClass('exit')
				
				})
				.promise()
				.done(function () {
					$content
					.html(response.$content)
					.addClass('enter')
					.fadeIn(Hijax.settings.fade_duration, function(){ 
						$(this).removeClass('enter')
					});
				});
			}).fail(function () {
				document.location.href = url;
				return false;
			});
		});
		
	},
	
	update_nav: function(clicked_link) {
		var $clicked_link = $(clicked_link);
		Hijax.settings.$ajax_links.closest('nav').find('li').removeClass('active');
		$clicked_link.closest('li').addClass('active');
	},
	find_all: function($html, selector) {
		return $html.filter(selector).add($html.find(selector));
		
	},
	parse_html: function(html) {
		return $($.parseHTML(html, document, true));
		
	},
	parse_response: function(html) {
		var
		head = /<head[^>]*>([\s\S]+)<\/head>/.exec(html),
		body = /<body[^>]*>([\s\S]+)<\/body>/.exec(html),
            
		$head = head ? Hijax.parse_html(head[1]) : $(),
		$body = body ? Hijax.parse_html(body[1]) : $(),
            
		title	 = $.trim(Hijax.find_all($head, 'title').last().html()),
		$content = $.trim(Hijax.find_all($body, Hijax.settings.content).first().html());
        
		return {
			'title': title,
			'$content': $content
		}
	},
	
};


$(document).ready(function() {
	Hijax.init();
});