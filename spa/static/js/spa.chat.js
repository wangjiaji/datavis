spa.chat = (function () {
    'use strict';
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
	    +      '<main class="spa-chat-msgs">'
            +         '<aside class="spa-chat-list pull-left">'
            +           '<div class="spa-chat-list-box"></div>'
            +         '</aside>'
            +         '<div class="spa-chat-msgs-log"></div>'
            +      '</main>'
            +      '<div class="spa-chat-msgs-in">'
            +        '<form class="spa-chat-msgs-form">'
            +          '<div class="spa-chat-box input-group">'
            +             '<input class="form-control" type="text" />'
            +             '<span class="input-group-btn">'
            +                '<button class="btn btn-default spa-chat-msgs-send">Send</button>'
            +             '</span>'
            +          '</div>'
            +          '<input type="submit" class="hide" />'
            +        '</form>'
            +      '</div>'
	    +   '</div>'
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

        chat_model: null,
        people_model: null,

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
    scrollChat, writeChat, writeAlert, clearChat,
    onUpdateChat, onSubmitMsg, onClickList,
    onSetchatee, onListchange, onLogin, onLogout,
    setJqueryMap, configModule, initModule, setSliderPosition,
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
            $list_box: $chat.find('.spa-chat-list-box'),
	    $msgs_log: $chat.find('.spa-chat-msgs-log'),
            $msgs_in: $chat.find('.spa-chat-msgs-in'),
            $input: $chat.find('.spa-chat-msgs-in input[type=text]'),
            $send: $chat.find('.spa-chat-msgs-send'),
            $form: $chat.find('.spa-chat-msgs-form')
	};
    };
    // End /setJquery/

    // Public methods
    initModule = function ($container) {
        var $list_box;
        
	stateMap.$container = $container;
	$container.append(configMap.main_html);
	setJqueryMap();

	jqueryMap.$toggle.attr('title', configMap.chat_closed_title);
	jqueryMap.$head.click(onClickToggle);
	stateMap.position = 'closed';

        $list_box = jqueryMap.$list_box;
        $.gevent.subscribe($list_box, 'spa-listchange', onListchange);
        $.gevent.subscribe($list_box, 'spa-setchatee', onSetchatee);
        $.gevent.subscribe($list_box, 'spa-updatechat', onUpdateChat);
        $.gevent.subscribe($list_box, 'spa-login', onLogin);
        $.gevent.subscribe($list_box, 'spa-logout', onLogout);

        jqueryMap.$head.bind('utap', onClickToggle);
        jqueryMap.$list_box.bind('utap', onClickList);
        jqueryMap.$send.bind('utap', onSubmitMsg);
        jqueryMap.$form.bind('submit', onSubmitMsg);
	
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

        if (position === 'opened' &&
                configMap.people_model.get_user().is_anon())
            return false;
	if (is_sliding ||
                (position === 'opened' && is_open) ||
                (position === 'closed' && is_closed))
            return false;

	switch (position) {
	case 'opened':
	    height = configMap.chat_opened_height;
	    title = configMap.chat_opened_title;
	    duration = configMap.chat_open_time;
            jqueryMap.$input.focus();
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

	jqueryMap.$chat.one('transitionend', function (event) {
            console.log('transition end');
	    jqueryMap.$glyphicon.toggleClass('glyphicon-resize-full glyphicon-resize-small');
	    jqueryMap.$head.attr('title', title);
	    stateMap.position = position;
	    if (callback)
		callback(this, event);
	});
	
	return true;
    };

    // Begin private DOM methods to manage chat message
    scrollChat = function () {
        var $msgs_log = jqueryMap.$msgs_log;
        $msgs_log.animate({
            scrollTop: $msgs_log.prop('scrollHeight') - $msgs_log.height()
        }, 150);
    };

    writeChat = function (person_name, text, is_user) {
        var msg_class = is_user ? 'spa-chat-msgs-log-me' : 'spa-chat-msgs-log-msg';

        jqueryMap.$msgs_log.append(
                '<div class="' + msg_class + '">' +
                spa.util_b.encodeHtml(person_name) + ': ' +
                spa.util_b.encodeHtml(text) +
                '</div>'
        );

        scrollChat();
    };

    writeAlert = function (alert_text) {
        jqueryMap.$msgs_log.append(
            '<div class="alert alert-info">' +
            spa.util_b.encodeHtml(alert_text) +
            '</div>'
        );
        scrollChat();
    };

    clearChat = function () {
        jqueryMap.$msgs_log.empty();
    };

    // Event Handlers
    onSubmitMsg = function (event) {
        var msg_text = jqueryMap.$input.val();
        if (msg_text.trim() === '') {
            return false;
        }

        configMap.chat_model.send_msg(msg_text);
        jqueryMap.$input.focus();
        jqueryMap.$send.addClass('spa-x-select');
        setTimeout(function () {
            jqueryMap.$send.removeClass('spa-x-select');
        }, 250);
        return false;
    };

    onClickToggle = function (event) {
	if (stateMap.position === 'opened') {
	    configMap.set_chat_anchor('closed');
	} else if (stateMap.position === 'closed') {
	    configMap.set_chat_anchor('opened');
	}

	return false;
    };

    onClickList = function (event) {
        var $elem = $(event.elem_target), chatee_id;

        if(!$elem.hasClass('spa-chat-list-name'))
            return false;

        chatee_id = $elem.data('id');
        if (!chatee_id)
            return false;

        configMap.chat_model.set_chatee(chatee_id);
        return false;
    };

    onSetchatee = function (event, arg_map) {
        var new_chatee = arg_map.new_chatee,
            old_chatee = arg_map.old_chatee;

        jqueryMap.$input.focus();
        if (!new_chatee) {
            if (old_chatee)
                writeAlert(old_chatee.name + ' has left the chat.');
            else
                writeAlert('Your friend has left the chat');

            jqueryMap.$title.text('Chat');
            return false;
        }
        jqueryMap.$list_box.find('.spa-chat-list-name')
            .removeClass('spa-x-select')
            .end()
            .find('[data-id=' + new_chatee.id + ']')
            .addClass('spa-x-select');

        writeAlert('Now chatting with ' + new_chatee.name);
        jqueryMap.$title.text(new_chatee.name);
        return true;
    };

    onListchange = function (event) {
        var list_html = String(),
            people_db = configMap.people_model.get_db(),
            chatee = configMap.chat_model.get_chatee();

        people_db().each(function (person, i) {
            var select_class = '';

            if (person.is_anon() || person.is_user()) {
                return true;
            }

            if (chatee && chatee.id === person.id) {
                select_class = ' spa-x-select';
            }

            list_html += '<div class="spa-chat-list-name' +
                select_class +
                '" data-id="' + person.id + '">' +
                spa.util_b.encodeHtml(person.name) +
                '</div>';
        });

        if (!list_html) {
            list_html = '<div class="spa-chat-list-note">' +
                'To chat alone is the fate of all great souls...<br><br>' +
                'No one is online' +
                '</div>';
            clearChat();
        }

        jqueryMap.$list_box.html(list_html);
    };

    onUpdateChat = function (event, msgmap) {
        var is_user, sender_id = msgmap.sender_id,
            msg_text = msgmap.msg_text,
            chatee = configMap.chat_model.get_chatee() || {},
            sender = configMap.people_model.get_by_cid(sender_id);

        if (!sender) {
            writeAlert(msg_text);
            return false;
        }

        is_user = sender.is_user();
        if (!(is_user || sender_id === chatee.id)) {
            configMap.chat_model.set_chatee(sender_id);
        }
        writeChat(sender.name, msg_text, is_user);

        if (is_user) {
            jqueryMap.$input.val('');
            jqueryMap.$input.focus();
        }
    };

    onLogin = function (event, login_user) {
        configMap.set_chat_anchor('opened');
    };

    onLogout = function (event, logout_user) {
        configMap.set_chat_anchor('closed');
        jqueryMap.$title.text('Chat');
        clearChat();
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
