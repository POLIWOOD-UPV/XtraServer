docker run -it --rm \
    -p 3306:3306 \
    --name mariadb \
    -e MARIADB_USER=mysql \
    -e MARIADB_PASSWORD=password \
    -e MARIADB_DATABASE=xtrachallenge25 \
    -e MARIADB_ROOT_PASSWORD=password \
    --mount type=bind,src="$(pwd)/mysql",dst=/var/lib/mysql,readonly=false \
    mariadb

#    MYSQL_DATABASE: xtrachallenge25
#    MYSQL_USER: mysql
#    MYSQL_PASSWORD: password
#    MYSQL_ROOT_PASSWORD: password

#    mariadb \
#    -u mariadb \
#    --database example \
#     -h 127.0.0.1 \
#     -p 3306 \ 