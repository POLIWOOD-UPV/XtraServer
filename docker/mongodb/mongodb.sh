docker run -it --rm \
    -p 27017:27017 \
    --name db-mongo \
    -e MONGO_INITDB_ROOT_USERNAME: root \
    -e MONGO_INITDB_ROOT_PASSWORD: example \
    mongo:6.0

# docker run -it --rm -p 27017:27017 --name db-mongo -e MONGO_INITDB_ROOT_USERNAME: root -e MONGO_INITDB_ROOT_PASSWORD: example mongo:6.0

# mongosh --authenticationDatabase admin --host localhost -u mongoadmin -p mongopasswd app_db_name --eval "db.createUser({user: 'devUser', pwd: 'devUserPass', roles: [{role: 'readWrite', db: 'app_db_name'}]});"

# show dbs
# use <db>