mkdir server\public\directos\%1
cd server\public\directos\%1
ffmpeg ^
-f flv ^
-i rtmp://localhost/live ^
-f hls ^
-hls_list_size 0 ^
live.m3u8
cd ..\..\..\..