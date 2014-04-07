spa.avatar = (function () {
    'use strict';
    // Module scope variables
    var
    configMap = {
	settable_map: {
	    chat_model: true,
	    people_model: true
	},

        chat_model: null,
        people_model: null
    },
    
    stateMap = {
        drag_map: null,
        $drag_target: null,
        drag_bg_color: undefined
    },
    jqueryMap = {},

    getRandRgb, setJqueryMap, updateAvatar,
    onTapNav, onHeldstartNav, onHeldmoveNav,
    onHeldendNav, onSetchatee, onListchange,
    onLogout, configModule, initModule;

    // Utility methods
    getRandRgb = function () {
        var i, rgb_list = [];
        for (i = 0; i < 3; i++) {
            rgb_list.push(Math.floor(Math.random() * 128) + 128);
        }
        return 'rgb(' + rgb_list + ')';
    };

    // DOM methods
    // Begin DOM method /setJquery/
    setJqueryMap = function ($container) {
        jqueryMap = { $container: $container };
    };
    // End /setJquery/

    updateAvatar = function ($target) {
        var css_map, persion_id;

        css_map = {
            top: +$target.css('top'),
            left: +$target.css('left'),
            'background-color': $target.css('background-color')
        };

        persion_id = $target.data('id');

        configMap.chat_model.update_avatar({
            persion_id: persion_id,
            css_map: css_map
        });
    };

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
    onTapNav = function (event) {
        var css_map, $target = $(event.elem_target).closest('.spa-avatar-box');

        if (!$target) {
            return false;
        }
        $target.css({ 'background-color': getRandRgb() });
        updateAvatar($target);
    };

    onHeldstartNav = function (event) {
        var offset_target_map, offset_nav_map,
            $target = $(event.elem_target).closest('.spa-avatar-box');

        if (!$target) {
            return false;
        }

        stateMap.$drag_target = $target;
        offset_target_map = $target.offset();
        offset_nav_map = jqueryMap.$container.offset();

        offset_target_map.top -= offset_nav_map.top;
        offset_target_map.left -= offset_nav_map.left;

        stateMap.drag_map = offset_target_map;
        stateMap.drag_bg_color = $target.css('background-color');

        $target.addClass('spa-x-is-drag')
            .css('background-color', '');
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
