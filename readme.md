Simple node/mongodb (via mongoose) jwt auth service supporting multiple login sessions.

You will need a .env file that would look something like the following:
PORT=3000
MONGODB_URL=mongodb+srv://<MYMONGOURL>?retryWrites=true&w=majority
JWT_SECRET=<YOUR_TOP_SECRET_KEY>
PASSWORD_REGEX=STRONG
MSG_UNAUTHORIZED=Unauthorized
MSG_SUCCESS_GENERIC=SUCCESS
MSG_LOGIN_CREATE_FAILED=Cannot create login based upon the credentials provided
MSG_AUTHENTICATION_FAILED=Unable to authenticate
MSG_LOGOUT_SUCCESS=You are now logged out. Come back soon!
MSG_LOGOUT_ALL_SUCCESS=You are now logged out everywhere. Come back soon!
MSG_LOGIN_DELETE_SUCCESS=Hasta la vista, baby!


If you are developing on a Windoze machine and bcrypt won't build. You can do the following:
1. Temorarily disable Real-time protection in Windoze Defender
2. npm i -g node-gyp
3. npm i -g --production windows-build-tools
4. npm i bcrypt --save
5. Remember to enable Real-time protection in Windoze Defender

If you want to switch to bcryptjs and lose the speed, that's fine too.