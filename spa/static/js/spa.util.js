spa.util = (function () {
    var makeError, setConfigMap;

    // Begin public contructor /makeError/
    // Purpose: a convenience wrapper to create an error object
    // Arguments:
    //   * name_text - the error name
    //   * msg_text - long error message
    //   * data -optional data attached to error object
    // Returns: newley constructed error object
    //
    makeError = function (name_text, msg_text, data) {
	var error = new Error();
	error.name = name_text;
	error.message = msg_text;
	if (data)
	    error.data = data;
	return error;
    };
    // End /makeError/

    // Begin public method /setConfigMap/
    // Purpose: Common code to set configs in feature modules
    // Arguments:
    //   * input_map - map of key-values to set in config
    //   * settable_map - map of allowable keys to set
    //   * config_map - map to apply settings to
    // Returns: true
    // Throws: Exception if input key not allowed
    //
    setConfigMap = function (arg_map) {
	var
	input_map = arg_map.input_map,
	settable_map = arg_map.settable_map,
	config_map = arg_map.config_map,
	keyname, error;

	for (keyname in input_map) {
	    if (input_map.hasOwnProperty(keyname)) {
		if (settable_map.hasOwnProperty(keyname)) {
		    config_map[keyname] = input_map[keyname];
		} else {
		    error = makeError('Bad input', 'Setting config key: ' + keyname + ' is not supported');
		    throw error;
		}
	    }
	}
    };
    // End /setConfigMap/

    return {
	makeError: makeError,
	setConfigMap: setConfigMap
    };
})();
