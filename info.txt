An "uptime monitor" allows users to enter URLs they want monitored, and receive alerts when thhose resources "go down" or "come back up".

The app should be usable, so we'll include features such as user sign-up and sign-in.

We'll also include functionality for sending an SMS alert to a user, rather than email.

API Tasks

The API listens on a PORT and accepts incoming requests for POST, GET, PUT, DELETE, and HEAD.

The API allows a client to connect, then create a new user, then edit and delete that user.

The API allows a user to "sign in" which token that they can use for subsequent authenticated requests.

The API allows the user to "sign out" which invalidates their token.

The API allows a signed-in user to use their token to create a new "check".

The API allows a signed-in user to edit od delete any of their checks.

In the background, workers perform all the "checks" at the appropriate time, and send alerts to the users when a check changes its state from "up" to "down", or visa versa.