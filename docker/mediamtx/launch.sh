docker run --rm -it \
    --name mediamtx \
    -p 1935:1935 \
    -p 8554:8554 \
    -p 8888:8888 \
    -p 8889:8889 \
    -p 8189:8189/udp \
    -p 9997:9997 \
    -v /path/on/your/host:/mediamtx.yml \
    bluenviron/mediamtx:latest