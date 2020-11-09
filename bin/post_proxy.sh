export JWT=`./bin/get-jwt.sh`
curl http://localhost:5008/proxy/example/ -H "Authorization: Bearer $JWT" -X POST -d@./examples/data00.json -H "content-type: application/json"
curl -v -H "Authorization: Bearer $JWT" http://localhost:5008/proxy/example/
