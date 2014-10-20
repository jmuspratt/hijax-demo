// Based on 
// http://uhnomoli.com/2014/01/10/Rolling-your-own-PJAX-implementation-with-History.js/


(function ($) {
	var $document = $(document);
    var $ajax_links = $('.main-header a');
	
	if (!History.enabled) {
		return false;
		
	}
    
	var root = History.getRootUrl();
	
	//
	// $.expr.filters.internal = function (elem) {
	// 	return (elem.hostname == window.location.hostname && /(\/|\.html)$/i.test(elem.pathname)) || false;
	// };
    
	function update_nav (clicked_link) {
		var $clicked_link = $(clicked_link);
		$ajax_links.closest('nav').find('li').removeClass('active');
		$clicked_link.closest('li').addClass('active');
	}
	
	function find_all($html, selector) {
		return $html.filter(selector).add($html.find(selector));
	}
    
	function parse_html(html) {
		return $($.parseHTML(html, document, true));
	}
    
	function parse_response(html) {
		var
		head = /<head[^>]*>([\s\S]+)<\/head>/.exec(html),
		body = /<body[^>]*>([\s\S]+)<\/body>/.exec(html),
            
		$head = head ? parse_html(head[1]) : $(),
		$body = body ? parse_html(body[1]) : $(),
            
		title = $.trim(find_all($head, 'title').last().html()),
		$content = $.trim(find_all($body, '#content').first().html());
        
		return {
			'title': title,
			'$content': $content
		}
	}
    
	
	
	
	
	
	$document.ready(function () {
		
		$ajax_links.on('click', function (event) {
			if (event.which == 2 || event.ctrlKey || event.metaKey) {
				return true;
			}
			update_nav(this);
			History.pushState(null, null, $(this).attr('href'));
			
			event.preventDefault();
			
			return false;
		});
	});
    
	
	
	$(window).on('statechange', function () {
		var
		url = History.getState().url,
		rel = url.replace(root, '/');
        
		$.get(rel).done(function (date) {
			var response = parse_response(date);
            
			if (!response.$content.length) {
				document.location.href = url;
                
				return false;
			}
            
			var $content = $('#content');
            
			if (response.title.length) {
				$('title').last().html(response.title);
			}
            
			$content
			.addClass('exit')
			.fadeOut(100, function(){
				$(this).removeClass('exit')
				
			})
			.promise()
			.done(function () {
				$content
				.html(response.$content)
				.addClass('enter')
				.fadeIn(300, function(){ 
					$(this).removeClass('enter')
				});
			});
		}).fail(function () {
			document.location.href = url;
			return false;
		});
	});
	
	
})(jQuery);
