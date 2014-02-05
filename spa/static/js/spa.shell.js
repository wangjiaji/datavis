spa.shell = (function () {
    // -------- BEGIN MODULE SCOPE VARIABLES --------
    var configMap = {
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
	is_chat_retracted: true
    },
    jqueryMap = {},
    setJqueryMap, toggleChat, onClickChat, initModule;
    // -------- END MODULE SCOPE VARIABLES ----------

    // -------- BEGIN UTITLITY METHODS --------------
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
	toggleChat(stateMap.is_chat_retracted);
	return false;
    };
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
    };
    // End Public mehtod /initModule/

    return { initModule: initModule };
    // -------- END PUBLIC METHODS ------------------
})();
