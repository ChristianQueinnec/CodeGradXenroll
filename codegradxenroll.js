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
        
CodeGradX.State.prototype.userGetLink = function (login) {
    var state = this;
    state.debug('userGetLink1', login);
    return state.sendAXServer('x', {
        path: '/fromp/getlink',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        entity: {
            login: login
        }
    }).then(function (response) {
        //console.log(response);
        state.debug('userGetLink2', response);
        // This is a very incomplete user record:
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

CodeGradX.State.prototype.userWwhoAmI = function () {
    state.debug('userWhoAmI1');
    return state.sendAXServer('x', {
        path: '/fromp/whoami',
        method: 'GET',
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

CodeGradX.State.prototype.userModify = function (data) {
    var state = this;
    state.debug('userModify1', login);
    var entity = {};
    var allowedKeys = ['pseudo', 'email', 'lastname', 'firstname', 'password']; 
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
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        entity: entity
    }).then(function (response) {
        //console.log(response);
        state.debug('userModify2', response);
        state.currentUser = new CodeGradX.User(response.entity);
        return when(state.currentUser);
    });
};

CodeGradX.State.prototype.userDisconnect = function () {
    var state = this;
    state.debug('userDisconnect1', login);
    return state.sendAXServer('x', {
        path: '/fromp/disconnect',
        method: 'GET',
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
