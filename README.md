# Sandbox Onboarding Self-Service


This service allows for creation and management of sandbox users for suse sandboxes.

Each route is authenticated by a token or basic auth.



## API Routes:

### POST /user/:email/:userName

Will create a new user with the userName and email provided in the route and the names and password from the body. 

Body is either urlencoded or json with the following field:

 - firstName: String 
 - lastName: String
 - password: String


### GET /user/:email

Will list users associated with email provided in route.

Returns:

[{
  "userName": String,
  "lastLogonTime": Unix Time,
  "passwordLastModified": ISO 8601 date,
  "active": Boolean
]}


### PUT /user/:email/:userName/password

Will change the password for the user with the userName and email provided in the route to the password from the body. 

Body is either urlencoded or json with the following field:

 - password: String



### DELETE /user/:email/:userName

Will delete the user with the userName and email provided in the route.
