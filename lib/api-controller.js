// Importing needed modules
import fetch from 'node-fetch';
import { FormData } from 'formdata-node';

// Activating strict mode
'use strict';

// Function for retrieving an access token
export async function retrieveAccessToken(serverAddress, user)
{
    let userCredentials = new FormData();
    let response;
    let responseText;
    userCredentials.append('grant_type', 'password');
    userCredentials.append('username', user.username);
    userCredentials.append('password', user.password);
    response = await fetch(serverAddress + '/oauth/token',
    {
        method: 'POST',
        headers:
        {
            'Authorization': 'Basic cG1kcnRtcjpwbWRydG1y'
        },
        body: userCredentials
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('access_token'))
        {
            return responseObject['access_token'];
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for revoking an access token
export async function revokeAccessToken(serverAddress, accessToken)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/oauth/revoke-token',
    {
        method: 'DELETE',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    responseText = await response.text();
    if (response.ok)
    {
        return true;
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for signing up a new user
export async function signUp(serverAddress, user)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/signup',
    {
        method: 'POST',
        headers:
        {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('id'))
        {
            return responseObject;
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for retrieving an user
export async function getUser(serverAddress, accessToken)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/user',
    {
        method: 'GET',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('id'))
        {
            return responseObject;
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for updating an user
export async function updateUser(serverAddress, accessToken, user)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/user',
    {
        method: 'PUT',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('id'))
        {
            return responseObject;
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for deleting an user
export async function deleteUser(serverAddress, accessToken)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/user',
    {
        method: 'DELETE',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('id'))
        {
            return responseObject;
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for retrieving todo and event descriptions of a remote CalDAV calendar
export async function getCaldavDescriptions(serverAddress, accessToken)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/caldav',
    {
        method: 'GET',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (Array.isArray(responseObject))
        {
            return responseObject;
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for retrieving all timers of an user
export async function getAllTimersOfUser(serverAddress, accessToken)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/timers',
    {
        method: 'GET',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (Array.isArray(responseObject))
        {
            return responseObject;
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for creating a new timer of an user
export async function createTimer(serverAddress, accessToken, timer)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/timers',
    {
        method: 'POST',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(timer)
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('id'))
        {
            return responseObject;
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for retrieving a timer of an user
export async function getTimer(serverAddress, accessToken, id)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/timers/' + id,
    {
        method: 'GET',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('id'))
        {
            return responseObject;
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}

// Function for deleting a timer of an user
export async function deleteTimer(serverAddress, accessToken, id)
{
    let response;
    let responseText;
    response = await fetch(serverAddress + '/timers/' + id,
    {
        method: 'DELETE',
        headers:
        {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    responseText = await response.text();
    if (response.ok)
    {
        let responseObject = JSON.parse(responseText);
        if (responseObject.hasOwnProperty('id'))
        {
            return responseObject;
        }
        else
        {
            throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
        }
    }
    else
    {
        throw new Error('\nStatus: ' + response.status + '\nMessage: ' + responseText);
    }
}
