export JWT=`./bin/get-jwt.sh`
curl http://localhost:5008/healthz -H "Authorization: Bearer $JWT"
echo 
echo $JWT
