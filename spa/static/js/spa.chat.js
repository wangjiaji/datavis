spa.chat = (function () {
    // Module scope variables
    var
    configMap = {
	main_html: String()
	    + '<div class="spa-chat" id="chat">'
	    +   '<header class="spa-chat-head">'
	    +      '<span class="spa-chat-head-toggle pull-left"><span class="glyphicon glyphicon-resize-full"></span></span>'
	    +      '<span class="spa-chat-head-title">Chat</span>'
	    +      '<span class="spa-chat-closer pull-right">&times;</span>'
	    +    '</header>'

	    +    '<div class="spa-chat-sizer">'
	    +      '<main class="spa-chat-msgs"></main>'
	    +      '<div class="spa-chat-box input-group">'
	    +        '<input type="text" class="form-control" />'
	    +        '<span class="input-group-btn">'
	    +        '<button type="button" class="btn btn-default">Send</button>'
	    +        '</span>'
	    +      '</div>'
	    +    '</div>'

	    
	    + '</div>',

	settable_map: {
	    chat_open_time: true,
	    chat_opened_em: true,
	    chat_opened_title: true,
	    chat_close_time: true,
	    chat_closed_em: true,
	    chat_closed_title: true,

	    chat_model: true,
	    people_model: true,
	    set_chat_anchor: true
	},

	chat_open_time: '700ms',
	chat_opened_height: 360,
	chat_opened_title: 'Click to close',
	chat_opened_min_height: 180,
	chat_close_time: '300ms',
	chat_closed_height: 28,
	chat_closed_title: 'Click to open',
	window_min_height: 300
    },
    
    stateMap = { $container: null },
    jqueryMap = {},
    setJqueryMap, configModule, initModule,
    onClickToggle, removeChat, handleResize;

    // Utility methods

    // DOM methods
    // Begin DOM method /setJquery/
    setJqueryMap = function () {
	var $container = stateMap.$container,
	$chat = $container.find('.spa-chat');
	
	jqueryMap = {
	    $chat: $chat,
	    $head: $chat.find('.spa-chat-head'),
	    $toggle: $chat.find('.spa-chat-head-toggle'),
	    $glyphicon: $chat.find('.spa-chat-head-toggle > .glyphicon'),
	    $title: $chat.find('.spa-chat-head-title'),
	    $sizer: $chat.find('.spa-chat-sizer'),
	    $msgs: $chat.find('.spa-chat-msgs'),
	    $box: $chat.find('.spa-chat-box'),
	    $input: $chat.find('input[type=text]')
	};
    };
    // End /setJquery/

    // Event Handlers
    onClickToggle = function (event) {
	if (stateMap.position === 'opened') {
	    console.log('close!');
	    configMap.set_chat_anchor('closed');
	} else if (stateMap.position === 'closed') {
	    console.log('open!');
	    configMap.set_chat_anchor('opened');
	}

	return false;
    };

    // Public methods
    initModule = function ($container) {
	stateMap.$container = $container;
	$container.append(configMap.main_html);
	setJqueryMap();

	jqueryMap.$toggle.attr('title', configMap.chat_closed_title);
	jqueryMap.$head.click(onClickToggle);
	stateMap.position = 'closed';
	
	return true;
    };

    configModule = function (input_map) {
	spa.util.setConfigMap({
	    input_map: input_map,
	    settable_map: configMap.settable_map,
	    config_map: configMap
	});
    };

    // Begin public method /setSliderPosition/
    // Purpose: Extends or retracts chat chat slider
    // Arguments:
    //   * position - extends slider if opened, retracts if closed
    //   * callback - call back at the end of the animation
    // Settings:
    //   * chat_transition_time
    //   * chat_extend_height, chat_retract_height
    // Returns: boolean
    //   * true - slider animation activated
    //   * false - slider animation not activated
    //
    setSliderPosition = function (position, callback) {
	var px_chat_ht = jqueryMap.$chat.height(),
	is_open = (px_chat_ht === configMap.chat_opened_height),
	is_closed = (px_chat_ht === configMap.chat_closed_height),
	is_sliding = !is_closed && !is_open,
	height, title, duration;

	if (is_sliding || (position === 'opened' && is_open) || (position === 'closed' && is_closed)) return false;

	switch (position) {
	case 'opened':
	    height = configMap.chat_opened_height;
	    title = configMap.chat_opened_title;
	    duration = configMap.chat_open_time;
	    break;
	case 'closed':
	    height = configMap.chat_closed_height;
	    title = configMap.chat_closed_title;
	    duration = configMap.chat_close_time;
	    break;
	default:
	    return false;
	}
	
	jqueryMap.$chat.css('transition', 'height ' + duration + ' ease-out');
	jqueryMap.$chat.height(height);

	jqueryMap.$chat.one('webkitTransitionEnd transitionend', function (event) {
	    jqueryMap.$glyphicon.toggleClass('glyphicon-resize-full glyphicon-resize-small');
	    jqueryMap.$head.attr('title', title);
	    stateMap.position = position;
	    if (callback)
		callback(this, event);
	});
	
	return true;
    };

    // Begin public method /removeChat/
    // Purpose:
    //   * Remove chat DOM element
    //   * Reverts to initial state
    //   * Remove pointers to callbacks and other data
    //
    removeChat = function () {
	if (jqueryMap.$chat) {
	    jqueryMap.$chat.remove();
	    jqueryMap = {};
	}
	stateMap.$container = null;
	stateMap.position = 'closed';

	// Unset configurations
	configMap.chat_model = null;
	configMap.people_model = null;
	configMap.set_chat_anchor = null;
    };

    // Begin public method /handleResize/
    // Purpose:
    //   * If the window height or width falls below
    //     a given threshold, resize the chat slider
    //     to a suitable size.
    //
    handleResize = function () {
	
    };

    return {
	initModule: initModule,
	configModule: configModule,
	setSliderPosition: setSliderPosition,
	removeChat: removeChat,
	handleResize: handleResize
    };
})();
