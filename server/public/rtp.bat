ffmpeg ^
-f gdigrab ^
-i desktop ^
-an ^
-r 30 ^
-b 10000 ^
-f rtp ^
-sdp_file stream.sdp ^
rtp://192.168.0.5:6000
:: -vf crop=1920:1080:0:0 ^
:: -preset ultrafast ^
:: -tune zero_latency ^