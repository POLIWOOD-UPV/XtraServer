docker run -it --rm \
    -p 3306:3306 \
    --name mariadb \
    -e MARIADB_USER=mariadb \
    -e MARIADB_PASSWORD=password \
    -e MARIADB_DATABASE=exmple \
    -e MARIADB_ROOT_PASSWORD=password \
    --mount type=bind,src="$(pwd)/mysql",dst=/var/lib/mysql,readonly=false \
    mariadb
#    mariadb \
#    -u mariadb \
#    --database example \
#     -h 127.0.0.1 \
#     -p 3306 \ 