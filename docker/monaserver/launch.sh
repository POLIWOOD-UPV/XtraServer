docker run --rm -it \
    --name Mona \
    -p 80:80 \
    -p 1935:1935 \
    -p 554:554 \
    -p 1935:1935/udp \
    -v /path/on/your/host:/usr/local/bin/www \
    monaserver/monaserver