mkdir server\public\directos\drone
cd server\public\directos\drone
ffmpeg ^
-f flv ^
-i rtmp:/192.168.0.116/ ^
-f hls ^
live.m3u8
:: -listen 1 ^
:: init_seg_name
:: media_seg_name
::-c:v libx264 ^
::-b:v 6000 ^
::-an
::-preset fast ^
::-use_timeline 1 ^
::-use_template 1 ^
::-seg_duration 4 ^
::-init_seg_name init-$RepresentationID$-$Number%05d$.$ext$ ^
::-media_seg_name chunk-$RepresentationID$-$Number%05d$.$ext$ ^
::-window_size 5 ^
::-remove_at_exit 0 ^
::-extra_window_size 10 ^
cd ..\..\..\..