spa.shell = (function () {
    // -------- BEGIN MODULE SCOPE VARIABLES --------
    var configMap = {
	anchor_schema_map: {
	    chat: { open: true, closed: true }
	},
	main_html: String()
	    +  '<header class="spa-shell-head">'
	    +    '<div class="spa-shell-head-logo col-md-1 pull-left"></div>'
	    +    '<div class="spa-shell-head-acct col-md-1 pull-right"></div>'
	    +    '<div class="spa-shell-head-search col-md-2 pull-right"></div>'
	    +  '</header>'
	    +  '<main class="spa-shell-main panel panel-default">'
	    +    '<nav class="spa-shell-main-nav col-md-2 pull-left"></nav>'
	    +    '<article class="spa-shell-main-content panel-body"></article>'
	    +  '</main>'
	    +  '<footer class="spa-shell-foot"></footer>'
	    +  '<div class="spa-shell-chat col-md-3"></div>'
	    +  '<div class="spa-shell-modal popover"></div>',
	chat_extend_time: '800ms',
	chat_extend_height: 450,
	chat_extend_title: 'Click to retract',
	chat_retract_time: '300ms',
	chat_retract_height: 15,
	chat_retract_title: 'Click to extend'
    },
    stateMap = {
	$container: null,
	anchor_map: {},
	is_chat_retracted: true
    },
    jqueryMap = {},
    copyAnchorMap, setJqueryMap, toggleChat,
    changeAnchorPart, onHashchange,
    onClickChat, initModule;
    // -------- END MODULE SCOPE VARIABLES ----------

    // -------- BEGIN UTITLITY METHODS --------------
    // Returns copy of stored anchor map; minimizes overhead
    copyAnchorMap = function () {
	return $.extend(true, {}, stateMap.anchor_map);
    };
    // -------- END UTITLITY METHODS ----------------

    // -------- BEGIN DOM METHODS -------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
	var $container = stateMap.$container;
	jqueryMap = {
	    $container: $container,
	    $chat: $container.find('.spa-shell-chat')
	};
    };
    // End DOM method /setJqueryMap/

    // Begin DOM method /changeAnchorPart/
    // Purpose: Change part of the URI anchor component
    // Arguments:
    //   * arg_map - The map describing what part of the URI anchor
    //     we want changed
    // Returns: boolean
    //   * true - the anchor portion of the URI was updated
    //   * false - the anchor portion of the URI could not be updated
    //
    changeAnchorPart = function (arg_map) {
	var
	anchor_map_revise = copyAnchorMap(),
	keyname, keyname_dep;

	KEYVAL:
	for (keyname in arg_map) {
	    if (arg_map.hasOwnProperty(keyname)) {
		// Skip dependent key during iteration
		if (keyname.indexOf('_') === 0) continue KEYVAL;
		anchor_map_revise[keyname] = arg_map[keyname];

		// update matching dependent key
		keyname_dep = '_' + keyname;
		if (arg_map[keyname_dep]) {
		    anchor_map_revise[keyname_dep] = arg_map[keyname_dep];
		} else {
		    delete anchor_map_revise[keyname_dep];
		    delete anchor_map_revise['_s' + keyname_dep];
		}
	    }
	}
	// End merge changes into anchor map

	// Attempt to update URI; revert on failure
	try {
	    $.uriAnchor.setAnchor(anchor_map_revise);
	} catch (error) {
	    $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
	    return false
	}

	return true;
    };
    // End DOM method /changeAnchorPart/

    // Begin DOM method /toggleChat/
    // Purpose: Extends or retracts chat slider
    // Arguments:
    //   * do_extend - extends slider if true, retracts otherwise
    //   * callback - call back at the end of the animation
    // Settings:
    //   * chat_transition_time
    //   * chat_extend_height, chat_retract_height
    // Returns: boolean
    //   * true - slider animation activated
    //   * false - slider animation not activated
    //
    toggleChat = function (do_extend, callback) {
	var px_chat_ht = jqueryMap.$chat.height(),
	is_open = (px_chat_ht === configMap.chat_extend_height),
	is_closed = (px_chat_ht === configMap.chat_retract_height),
	is_sliding = !is_closed && !is_open;

	if (is_sliding || (do_extend && is_open) || (!do_extend && is_closed)) return false;

	var height = do_extend ? configMap.chat_extend_height : configMap.chat_retract_height;
	var title = do_extend ? configMap.chat_extend_title : configMap.chat_retract_title;
	var duration = do_extend ? configMap.chat_extend_time : configMap.chat_retract_time;
	
	jqueryMap.$chat.css('transition', 'height ' + duration + ' ease-out');
	jqueryMap.$chat.height(height);

	jqueryMap.$chat.one('webkitTransitionEnd transitionend', function (event) {
	    $(this).attr('title', title);
	    stateMap.is_chat_retracted = !do_extend;
	    if (callback)
		callback(this, event);
	});
	
	return true;
    };
    // End DOM method /toggleChat/
    // -------- END DOM METHODS ---------------------

    // -------- BEGIN EVENT HANDLERS ----------------
    onClickChat = function (event) {
	changeAnchorPart({
	    chat: stateMap.is_chat_retracted ? 'open' : 'closed'
	});
	return false;
    };

    // Begin Event handler /onHashchange/
    onHashchange = function (event) {
	var
	anchor_map_previous = copyAnchorMap(),
	anchor_map_proposed,
	_s_chat_previous, _s_chat_proposed,
	s_chat_proposed;

	// Attempt to parse anchor
	try {
	    anchor_map_proposed = $.uriAnchor.makeAnchorMap();
	} catch (error) {
	    $.uriAnchor.setAnchor(anchor_map_previous, null, true);
	    return false;
	}
	stateMap.anchor_map = anchor_map_proposed;

	// convenience vars
	_s_chat_previous = anchor_map_previous._s_chat;
	_s_chat_proposed = anchor_map_proposed._s_chat;

	// Adjust chat component if changed
	if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
	    s_chat_proposed = anchor_map_proposed.chat;
	    switch (s_chat_proposed) {
	    case 'open':
		toggleChat(true);
		break;
	    case 'closed':
		toggleChat(false);
		break;
	    default:
		toggleChat(false);
		delete anchor_map_proposed.chat;
		$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
	    }
	}
	return false;
    };
    // End Event handler /onHashchange/
    // -------- END EVENT HANDLERS ------------------

    // -------- BEGIN PUBLIC METHODS ----------------
    // Begin Public method /initModule/
    initModule = function ($container) {
	stateMap.$container = $container;
	$container.html(configMap.main_html);
	setJqueryMap();

	stateMap.is_chat_retracted = true;
	jqueryMap.$chat
	    .attr('title', configMap.chat_retract_title)
	    .click(onClickChat);

	// Configure uriAnchor
	$.uriAnchor.configModule({
	    schema_map: configMap.anchor_schema_map
	});

	// Bind hashchange event
	// This done after all feature modules' initialization
	// since they'll be handling the change
	$(window)
	    .bind('hashchange', onHashchange)
	    .trigger('hashchange');
    };
    // End Public mehtod /initModule/

    return { initModule: initModule };
    // -------- END PUBLIC METHODS ------------------
})();
