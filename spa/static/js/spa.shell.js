spa.shell = (function () {
    'use strict';
    // -------- BEGIN MODULE SCOPE VARIABLES --------
    var configMap = {
	anchor_schema_map: {
	    chat: { opened: true, closed: true }
	},
	main_html: String()
	    +  '<header class="spa-shell-head row">'
	    +    '<div class="spa-shell-head-logo col-md-2 pull-left">'
            +       '<h1>SPA</h1>'
            +       '<p>Javascript end to end</p>'
            +    '</div>'
	    +    '<div class="spa-shell-head-acct col-md-2 pull-right"></div>'
	    +    '<div class="spa-shell-head-search col-md-2 pull-right"></div>'
	    +  '</header>'
	    +  '<main class="spa-shell-main panel panel-default row">'
	    +    '<nav class="spa-shell-main-nav col-md-2 pull-left"></nav>'
	    +    '<article class="spa-shell-main-content col-md-10 panel-body"></article>'
	    +  '</main>'
	    +  '<footer class="spa-shell-foot"></footer>'
	    +  '<div class="spa-shell-modal popover"></div>'
    },
    stateMap = {
	$container: null,
	anchor_map: {},
    },
    jqueryMap = {},
    copyAnchorMap, setJqueryMap, onResize, onTapAcct,
    changeAnchorPart, onHashchange, onLogin, onLogout,
    setChatAnchor, initModule;
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
            $acct: $container.find('.spa-shell-head-acct'),
            $nav: $container.find('.spa-shell-main-nav')
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
    // -------- END DOM METHODS ---------------------

    // -------- BEGIN EVENT HANDLERS ----------------

    // Begin Event handler /onHashchange/
    onHashchange = function (event) {
	var
	anchor_map_previous = copyAnchorMap(),
	anchor_map_proposed,
	success = true,
	_s_chat_previous, _s_chat_proposed,
	s_chat_proposed;

	// Attempt to parse anchor
	try {
	    anchor_map_proposed = $.uriAnchor.makeAnchorMap();
	} catch (error) {
	    console.log('failed');
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
	    case 'opened':
		success = spa.chat.setSliderPosition('opened');
		break;
	    case 'closed':
		success = spa.chat.setSliderPosition('closed');
		break;
	    default:
		spa.chat.setSliderPosition('closed');
		delete anchor_map_proposed.chat;
		$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
	    }
	}

	if (!success) {
	    if (anchor_map_previous) {
		$.uriAnchor.setAnchor(anchor_map_previous, null, true);
		stateMap.anchor_map = anchor_map_previous;
	    } else {
		delete anchor_map_proposed.chat;
		$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
	    }
	}
	return false;
    };
    // End Event handler /onHashchange/
    
    // Begin Event Handler /onTapAcct/
    onTapAcct = function (event) {
        var acct_text, username, user = spa.model.people.get_user();

        if (user.is_anon()) {
            username = prompt('Please sign-in');
            spa.model.people.login(username);
            jqueryMap.$acct.text('...logging in...');
        } else {
            spa.model.people.logout();
        }

        return false;
    };
    // End Event Handler /onTapAcct/
    
    onLogin = function (_, user) {
        jqueryMap.$acct.text(user.name);
    };

    onLogout = function () {
        jqueryMap.$acct.text('Please sign in');
    };
    // -------- END EVENT HANDLERS ------------------

    // -------- BEGIN CALLBACKS ---------------------
    setChatAnchor = function (position) {
	return changeAnchorPart({ chat: position });
    }
    // -------- END CALLBACKS -----------------------

    // -------- BEGIN PUBLIC METHODS ----------------
    // Begin Public method /initModule/
    initModule = function ($container) {
	stateMap.$container = $container;
	$container.html(configMap.main_html);
	setJqueryMap();

	// Configure uriAnchor
	$.uriAnchor.configModule({
	    schema_map: configMap.anchor_schema_map
	});

	// Configure and init feature modules
	spa.chat.configModule({
	    set_chat_anchor: setChatAnchor,
	    chat_model: spa.model.chat,
	    people_model: spa.model.people
	});
	spa.chat.initModule(jqueryMap.$container);

	// Bind hashchange event
	// This done after all feature modules' initialization
	// since they'll be handling the change
	$(window)
	    .bind('hashchange', onHashchange)
	    .trigger('hashchange');

        $.gevent.subscribe($container, 'spa-login', onLogin);
        $.gevent.subscribe($container, 'spa-logout', onLogout);

        jqueryMap.$acct
            .text('Please sign in')
            .on('utap', onTapAcct);
    };

    return { initModule: initModule };
    // End Public mehtod /initModule/
    // -------- END PUBLIC METHODS ------------------
})();

