spa.model = (function () {
    'use strict';
    var
    configMap = { anon_id: 'a0' },
    stateMap = {
	anon_user: null,
	cid_serial: 0,
	people_cid_map: {},
	people_db: TAFFY(),
        is_connected: false,
	user: null
    },
    isFakeData = true,
    makeCid, clearPeopleDB, completeLogin, removePerson,
    personProto, makePerson, chat, people, initModule;

    personProto = {
	is_user: function () {
	    return this.cid === stateMap.user.cid;
	},
	is_anon: function () {
	    return this.cid === stateMap.anon_user.cid
	}
    };

    makeCid = function () {
	return 'c' + String(stateMap.cid_serial++);
    };

    clearPeopleDB = function () {
	var user = stateMap.user;
	stateMap.people_db = TAFFY();
	stateMap.people_cid_map = {};
	if (user) {
	    stateMap.people_db.insert(user);
	    stateMap.people_cid_map[user.cid] = user;
	}
    };

    completeLogin = function (user_list) {
	var user_map = user_list[0];
	delete stateMap.people_cid_map[user_map.cid];
	stateMap.user.cid = user_map._id;
	stateMap.user.id = user_map._id;
	stateMap.user.css_map = user_map.css_map;
	stateMap.people_cid_map[user_map._id] = stateMap.user;

        chat.join();

	$.gevent.publish('spa-login', [stateMap.user]);
    };

    makePerson = function (person_map) {
	var
	person,
	cid = person_map.cid,
	css_map = person_map.css_map,
	id = person_map.id,
	name = person_map.name;

	if (cid == undefined || !name)
	    throw 'client id and name required';

	person = Object.create(personProto);
	person.cid = cid;
	person.name = name;
	person.css_map = css_map;

	if (id)
	    person.id = id;

	stateMap.people_cid_map[cid] = person;
	stateMap.people_db.insert(person);

	return person;
    };

    removePerson = function (person) {
	if (!person || person.id == configMap.anon_id)
	    return false;

	stateMap.people_db({ cid: person.cid }).remove();
	if (person.cid)
	    delete stateMap.people_cid_map[person.cid];
	
	return true;
    };

    // People Model
    // Responsible for login, logout, publishing the relating events,
    // getting the current user and a list of online users.
    //
    people = (function (){
	var get_by_cid, get_db, get_user, login, logout;

	get_by_cid = function (cid) { return stateMap.people_cid_map[cid]; };
	get_db = function () { return stateMap.people_db; };
	get_user = function () { return stateMap.user; };

	login = function (name) {
	    var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

	    stateMap.user = makePerson({
		cid: makeCid(),
		css_map: { top: 25, left: 25, 'background-color': '#8f8' },
		name: name
	    });

	    sio.on('userupdate', completeLogin);

	    sio.emit('adduser', {
		cid: stateMap.user.cid,
		css_map: stateMap.user.css_map,
		name: stateMap.user.name
	    });
	};

	logout = function () {
	    var user = stateMap.user;

            chat.leave();
	    stateMap.user = stateMap.anon_user;
            clearPeopleDB();

	    $.gevent.publish('spa-logout', [user]);
	};

	return {
	    get_by_cid: get_by_cid,
	    get_db: get_db,
	    get_user: get_user,
	    login: login,
	    logout: logout
	};
    })();

    // Chat Model
    //
    chat = (function () {
        var _publish_listchange, _publish_updatechat,
            _update_list, join_chat, update_avatar,
            _leave_chat, get_chatee, send_msg, set_chatee, chatee = null;

        // Begin interl methods
        _update_list = function (arglist) {
            var i, person_map, make_person_map,
                people_list = arglist[0], person,
                is_chatee_online = false;

            clearPeopleDB();

            for (i = 0; i < people_list.length; i++) {
                person_map = people_list[i];

                if (!person_map.name)
                    continue;
                
                if (stateMap.user && stateMap.user.id === person_map._id) {
                    stateMap.user.css_map = person_map.css_map;
                    continue;
                }

                make_person_map = {
                    cid: person_map._id,
                    id: person_map._id,
                    css_map: person_map.css_map,
                    name: person_map.name
                };
                person = makePerson(make_person_map);

                if (chatee && chatee.id === make_person_map.id) {
                    is_chatee_online = true;
                    chatee = person;
                }
            }

            stateMap.people_db.sort('name');

            if (chatee && !is_chatee_online)
                set_chatee('');
        };

        _publish_listchange = function (arglist) {
            _update_list(arglist);
            $.gevent.publish('spa-listchange', [arglist]);
        };

        _publish_updatechat = function (arglist) {
            var msg_map = arglist[0];

            if (!chatee)
                set_chatee(msg_map.sender_id);
            else if (msg_map.sender_id !== stateMap.user.id &&
                    msg_map.sender_id !== chatee.id)
                set_chatee(msg_map.sender_id);

            $.gevent.publish('spa-updatechat', [msg_map]);
        };
        // End internal methods

        _leave_chat = function () {
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            
            chatee = null;
            stateMap.is_connected = false;
            if (sio)
                so.emit('leavechat');
        };

        get_chatee = function () {
            return chatee;
        };

        join_chat = function () {
            var sio;

            if (stateMap.is_connected)
                return false;

            if (stateMap.user.is_anon()) {
                console.warn('User has not logged in');
                return false;
            }

            sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            sio.on('listchange', _publish_listchange);
            sio.on('updatechat', _publish_updatechat);
            stateMap.is_connected = true;
            return true;
        };

        send_msg = function (msg_text) {
            var msg_map, sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

            if (!sio)
                return false;
            if (!(stateMap.user && chatee))
                return false;

            msg_map = {
                dest_id: chatee.id,
                dest_name: chatee.name,
                sender_id: stateMap.user.id,
                msg_text: msg_text
            };

            // publish updatechat to update the content in message box
            _publish_updatechat([msg_map]);
            sio.emit('updatechat', msg_map);
            return true;
        };

        set_chatee = function (person_id) {
            var new_chatee;
            
            new_chatee = stateMap.people_cid_map[person_id];
            if (new_chatee) {
                if (chatee && chatee.id === new_chatee.id)
                    return false;
            } else {
                new_chatee = null;
            }

            $.gevent.publish('spa-setchatee', { old_chatee: chatee, new_chatee: new_chatee });
            chatee = new_chatee;
            return true;
        };

        update_avatar = function (avatar_update_map) {
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            if (sio)
                sio.emit('updateavatar', avatar_update_map);
        };

        return {
            _leave: _leave_chat,
            get_chatee: get_chatee,
            send_msg: send_msg,
            set_chatee: set_chatee,
            update_avatar: update_avatar,
            join: join_chat
        };
    })();

    initModule = function () {
	var i, people_list, person_map;

	stateMap.anon_user = makePerson({
	    cid: configMap.anon_id,
	    id: configMap.anon_id,
	    name: 'anonymous'
	});
	stateMap.user = stateMap.anon_user;
    };

    return {
	initModule: initModule,
	people: people,
        chat: chat
    };
})();
