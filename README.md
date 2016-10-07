# CodeGradX enrollment API

This document describes the enrollment process. The server that
handles the enrollment process is an `x.paracamplus.com` server or its
redunded clones. The API uses a REST style, responses are JSON record
describing a user. X servers are reachable in https only.

## User description record

The JSON user record is an object looking like (we use a Javascript
syntax rather than a pure more bloated JSON syntax)(not all fields
are necessarily present):

```javascript
{ kind: 'authenticationAnswer',
  login => 'john.doe@example.org',
  email => 'john.doe@example.org',
  confirmedemail => true,

  uaversion => 1,
  token => '',
  confirmedua => 0,
  cookie => 'u=U....',

  isauthor => false,
  isadmin => false,
  authorprefixes => [
    'fr.upmc.',
    'net.programmation-recursive.' ],

  personid: 123,
  firstname => 'John',
  lastname => 'Doe',
  pseudo => 'theBest',
  gravatar => 'http://.....'
};
```

Fields `login` and `email` are initially similar though only `email`
is used to communicate with the user (to send lost password for
instance). The `email` value may be modified by the user. The `login`
is immutable. The field `confirmedemail` tells whether the email was
successfully verified.

The field `uaversion` is the current version of the User Agreement and
`confirmedua` is the highest version of the User Agreement agreed by
the user. When the user had agreed to the last version of the User
Agreement and confirmed its email, then an authentication token is
given back that can be used as a cookie for further interactions with
the CodeGradX constellation. This cookie is also received as a regular
http cookie.

The fields `isauthor` and `isadmin` tells whether the user is an
author (and can submit new exercises) or an admin (with great powers).
When a user is an author, the `authorprefixes` field is the array
of prefixes that can be used to name exercises authored by this user.

The field `personid` is an internal identifier, `firstname`,
`lastname` and `pseudo` are set by the user in its profile. The first
two are used when producing badges or certificates. The last one,
`pseudo` is used when citing a person to other persons.

## `/fromp/enroll`

This request expects an `email` parameter, it creates a user with a
login and an email set to this `email` parameter. If successfully
created, this request returns a user description record and a 201 http
code.

The given email should be correct, the user should not be already
existent in the database and the email should not be an existing
email.

When the user is created, an mail is sent with an email confirmation
link. See next request. 

## `/fromp/confirm/:link`

This request is used to confirm an email. It contains a `link` argument.
If the link is valid and not already used, then the user's email is
confirmed and a user description record is returned with a new field
named `token` containing a token required to sign the User Agreement
if need be.

## `/fromp/sign/:token`

This request is used to sign the current version of the User Agreement.
In order to sign, you need to give back the token previously received.

The first time the email is confirmed and the User Agreement is
signed then a welcome mail is sent.

## `/fromp/getua`

This request redirects to the User Agreement.

## `/fromp/resume/:token`

Resume the enrolment process. This request is normally done from a
browser.

## `/fromp/connect`

This is a POST request with `login` and `password` parameters. If
authenticated successfully then a user description record is sent
back.

## `/fromp/getlink`

This request allows the user to request a temporary link which will be
sent by email. The temporary link will allow the user to resume the
enrolment process with the next request.

## `/fromp/reconnect/:token`

This request allows the user to get authenticated anew and resume the
enrolment process. This request is normally done from an email.

## `/fromp/whoami`

This request returns a user description record if the user is
authenticated otherwise it returns a 400 http code.

## `/fromp/selfmodify`

This POST request allows the user to modify its firstname, lastname,
pseudo, email and password. Passwords for now may only consist of
ASCII characters A-Z, a-z and 0-9. The request returns a user
description record if the modifications are successful.

## `/fromp/disconnect`

Invalid the cookie (named `u`) so the user will need to reauthenticate.







