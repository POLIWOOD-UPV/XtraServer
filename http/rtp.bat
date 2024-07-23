ffmpeg ^
-f gdigrab ^
-i desktop ^
-vf crop=1920:1080:1920:0 ^
-r 30 ^
-f rtp ^
-sdp_file ^
test.sdp ^
rtp://192.168.1.32:6000
:: -offset_x 1920 ^