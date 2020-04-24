export SERVER="https://login.perci-io.net/auth"
export REALM='a6s-dev'
export CLIENT_ID='a6s-dev-app-render'
export CLIENT_SECRET='35962849-9e55-4a81-a470-1b263e0e32d5'
export LOGIN_USER='lee@apigeeks.com'
export LOGIN_PASSWORD='test1234'

AUTH=`curl --silent -X POST "${SERVER}/realms/$REALM/protocol/openid-connect/token" \
-H "Content-Type: application/x-www-form-urlencoded" \
--data-urlencode "client_id=$CLIENT_ID" \
--data-urlencode "grant_type=password" \
--data-urlencode "client_secret=$CLIENT_SECRET" \
--data-urlencode "scope=openid" \
--data-urlencode "username=$LOGIN_USER" \
--data-urlencode "password=$LOGIN_PASSWORD" | jq -r '.access_token'`

echo $AUTH

