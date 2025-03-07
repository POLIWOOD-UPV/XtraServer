ffmpeg ^
-f gdigrab ^
-i desktop ^
-vf crop=1920:1080:1920:0 ^
-r 30 ^
-b 10000000 ^
-f rtp ^
-sdp_file ^
test.sdp ^
rtp://192.168.0.8:6000