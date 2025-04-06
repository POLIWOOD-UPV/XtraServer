ffmpeg ^
-f gdigrab ^
-i desktop ^
-vf crop=1920:1080:0:0 ^
-r 30 ^
-b 10000000 ^
-f rtp ^
-sdp_file ^
stream.sdp ^
rtp://192.168.1.255:6000