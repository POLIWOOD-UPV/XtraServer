ffmpeg ^
-f gdigrab ^
-i desktop ^
-an ^
-r 30 ^
-b 2000 ^
-f flv ^
rtmp://localhost/live/test