# CodeGradX enrolment API

This document describes the enrolment process. The server that
handles the enrolment process is an `x.paracamplus.com` server or its
redunded clones. The API uses a REST style, responses are JSON record
describing a user. X servers are reachable in https only.

## Enrolment process

To be enrolled, a user must first provide an email and ask for
enrolment. A mail is then sent so the user can confirm its email after
clicking on the temporary link contained in the mail. The third and
last step is to sign the User Agreement after that the user receives a
cookie that makes available the various sites offering exercises.

## User description record

The JSON user record is an object looking like (not all fields are
necessarily present):

```javascript
{ kind: 'authenticationAnswer',
  login: 'john.doe@example.org',
  email: 'john.doe@example.org',
  confirmedemail: true,

  uaversion: 1,
  token: '',
  confirmedua: 0,
  cookie: 'u=U....',

  isauthor: false,
  isadmin: false,
  authorprefixes: [
    'fr.upmc.',
    'net.programmation-recursive.' ],

  personid: 123,
  firstname: 'John',
  lastname: 'Doe',
  pseudo: 'theBest',
  gravatar: 'http://.....',
  
  campaigns: [
     ...
  ]
};
```

Fields `login` and `email` are initially similar though only `email`
is used to communicate with the user (to send lost password for
instance). The `email` value may be freely modified by the user but
must be confirmed vhenever it changes. The `login` is immutable. The
field `confirmedemail` tells whether the email was successfully
verified.

The field `uaversion` is the current version of the User Agreement and
`confirmedua` is the highest version of the User Agreement agreed by
the user. When the user had agreed to the last version of the User
Agreement and confirmed its email, then an authentication token is
given back that can be used as a `cookie` for further interactions with
the CodeGradX constellation. This cookie is also received as a regular
http cookie.

The fields `isauthor` and `isadmin` tells whether the user is an
author (and can submit new exercises) or an admin (with great powers).
When a user is an author, the `authorprefixes` field is the array
of prefixes that can be used to name exercises authored by this user.

The field `personid` is an internal identifier, `firstname`,
`lastname` and `pseudo` (as well as `email`) can be set by the user in
its profile. The first two are used when producing badges or
certificates. The last one, `pseudo` is used when citing a person to
other persons. 

The `campaigns` field is an array of Campaign objects (see
`codegradxlib`) the user belong to. A campaign corresponds to a set of
exercises offered to a set of users for a given period of time. There
should be at least one campaign, named `free` that proposes a set of
exercises in various programming languages.

Some requests return a partial user description record reduced to a
very restricted set of fields. This is the case for requests that may
be forged by anybody.

## Underlying HTTP API 

### `/fromp/enroll`

This request expects an `email` parameter, it creates a user with a
login and an email set to this `email` parameter. If successfully
created, this request returns a user description record and a 201 http
code.

The given email should be correct, the user should not be already
existent in the database and the email should not be an email already
used by someone.

Additionally to the `email` parameter there must be a
`g-recaptcha-response` parameter (see https://www.google.com/recaptcha).

When the user is created, an mail is sent with a confirmation
link, see next request. If that request is sent another time, an email
confirmation will be sent again if the email was not yet confirmed.
The response is always a partial user description record.

### `/fromp/confirm/:link`

This request is used to confirm an email. It contains a `link`
argument. If the link is valid and not already used (it can only be
used once and for a limited duration), then the user's email is
confirmed and a reduced user description record is returned with a new
field named `token` containing a token required to sign the User
Agreement if need be.

### `/fromp/sign/:token`

This request is used to sign the current version of the User Agreement.
In order to sign, you need to give back the token previously received.

The first time the email is confirmed and the User Agreement is signed
then a welcome mail is sent.

### `/fromp/getua`

This request redirects to the User Agreement.

### `/fromp/resume/:token`

Resume the enrolment process. This request is normally done from a
browser. Depending on the state of the enrolment, it brings back a
partial or full user description record.

### `/fromp/connect`

This is a POST request with `login` and `password` parameters. If
authenticated successfully then a user description record is sent
back.

### `/fromp/getlink`

This is a POST request with `login` parameter. It allows the
user to request a temporary link which will be sent by email. The
temporary link will allow the user to resume the enrolment process
with the next request.

### `/fromp/reconnect/:token`

This request allows the user to get authenticated anew and resume the
enrolment process. This request is normally done from an email.

### `/fromp/whoami`

This request returns a user description record if the user is
authenticated otherwise it returns a 400 http code.

### `/fromp/selfmodify`

This POST request allows the user to modify its firstname, lastname,
pseudo, email and password. Passwords for now may only consist of
ASCII characters A-Z, a-z and 0-9. The request returns a user
description record if the modifications are successful.

### `/fromp/disconnect`

Invalid the cookie (named `u`) so the user will need to reauthenticate.

## Javascript API

The `codegradxenroll` library enriches the `codegradxlib` library and
brings new methods (their names are prefixed by `user`) on the
`CodeGradX.State` class.

```javascript
userConnect(login, password)
userGetLink(email)
userResume(token)
userSignUA(token)
userWhoAmI()
userCurrent()
userEnroll(login, captcha)
userGetAgreement()
userSelfModify(data)
userDisconnect()
```







# Future work

This API should use a captcha (or equivalent) to avoid robots.
It should also provide the Javascript code along the lines of the
other CodeGradX modules.




