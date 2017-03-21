/**

Javascript Library to register users with the CodeGradX infrastructure.

## Installation

```bash
npm install codegradxenroll
```

@module codegradxenroll
@author Christian Queinnec <Christian.Queinnec@codegradx.org>
@license MIT
@see {@link http://codegradx.org/|CodeGradX} site.
*/

var CodeGradX = require('codegradxlib');

/** re-export the `CodeGradX` object */
module.exports = CodeGradX;

var _    = require('lodash');
var when = require('when');
var nodefn = require('when/node');
var rest = require('rest');

/** Determine the original site.

    @returns {URLprefix}

*/

CodeGradX.State.prototype.guessDomain = function () {
    var uri = window.document.documentURI;
    var re = new RegExp('^(https?://[^/]+).*$');
    uri = uri.replace(re, "$1");
    return uri;
};

/** Connect the user. This will return a Promise leading to
    some User.

    @param {string} login - real login or email address
    @param {string} password
    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userConnect = function (login, password) {
    var state = this;
    state.debug('userConnect1', login);
    return state.sendAXServer('x', {
        path: '/fromp/connect',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        entity: {
            login: login,
            password: password
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userConnect2', response);
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

/** Ask for a temporary link to be received by email.

    @param {string} email - real login or email address
    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userGetLink = function (email) {
    var state = this;
    state.debug('userGetLink1', email);
    return state.sendAXServer('x', {
        path: '/fromp/getlink',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        entity: {
            email: email
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userGetLink2', response);
        // This is a very incomplete user record:
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

/** Resume the enrolment process.

    @param {string} token - resumption token
    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userResume = function (token) {
    var state = this;
    state.debug('userResume1', token);
    if ( ! token ) {
        return Promise.reject("empty token");
    }
    return state.sendAXServer('x', {
        path: '/fromp/resume/' + token,
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userResume2', response);
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

/** Sign the current version of the User Agreement.

    @param {string} token - signing token
    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userSignUA = function (token) {
    var state = this;
    state.debug('userSignUA1', token);
    return state.sendAXServer('x', {
        path: '/fromp/sign/' + token,
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userSignUA2', response);
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

/** Determine who the user is. The X server is invoked to check the
    user if authenticated. The `/fromp/whoami` is more detailed thant
    the `/whoami` request.

    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userWhoAmI = function () {
    var state = this;
    state.debug('userWhoAmI1');
    return state.sendAXServer('x', {
        path: '/fromp/whoami',
        method: 'GET',
        params: { site: state.guessDomain() },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userWhoAmI2', response);
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

/** Get the current User if known otherwise ask the X server.

    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userCurrent = function () {
    var state = this;
    state.debug('userCurrent1');
    if ( state.currentUser ) {
        return when(state.currentUser);
    }
    return state.userWhoAmI();
};

/** Enroll a new user. 

    @param {string} login - email
    @param {string} captcha - g-captcha-response
    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userEnroll = function (login, captcha) {
    var state = this;
    state.debug('userEnroll1', login);
    return state.sendAXServer('x', {
        path: '/fromp/enroll',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        entity: {
            email: login,
            'g-recaptcha-response': captcha
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userEnroll2', response);
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

/** Get the current version of the User Agreement.

    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userGetAgreement = function () {
    var state = this;
    state.debug('userUA1', login);
    return state.sendAXServer('x', {
        path: '/fromp/getua',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (uatext) {
        //console.log(response);
        state.debug('userUA2', response);
        return when(uatext);
    });
};

/** Modify the profile of the current user. Data is an object with
    fields among the allowedKeys.

    @param {object} data - fields of the profile to be modified
    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userSelfModify = function (data) {
    var state = this;
    state.debug('userSelfModify1', login);
    var entity = {};
    var allowedKeys = CodeGradX.State.prototype.userSelfModify.allowedKeys;
    for ( var i=0 ; i<allowedKeys.length ; i++ ) {
        var key = allowedKeys[i];
        var value = data[key];
        if ( value ) {
            entity[key] = value;
        }
    }
    return state.sendAXServer('x', {
        path: '/fromp/selfmodify',
        method: 'POST',
        params: { site: state.guessDomain() },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        entity: entity
    }).then(function (response) {
        //console.log(response);
        state.debug('userSelfModify2', response);
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};
CodeGradX.State.prototype.userSelfModify.allowedKeys =
    ['pseudo', 'email', 'lastname', 'firstname', 'password'];

/** Disconnect the user.

    @returns {Promise<User>} yields {User}

*/

CodeGradX.State.prototype.userDisconnect = function () {
    var state = this;
    state.debug('userDisconnect1', login);
    return state.sendAXServer('x', {
        path: '/fromp/disconnect',
        method: 'GET',
        params: { site: state.guessDomain() },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userDisconnect2', response);
        state.currentUser = undefined;
        return when(state.currentUser);
    });
};

// end of codegradxenroll.js
