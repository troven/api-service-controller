export JWT=`./bin/get-jwt.sh`
curl http://localhost:5003/healthz -H "Authorization: Bearer $JWT"
