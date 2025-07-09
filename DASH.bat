mkdir server\public\directos\%1
cd server\public\directos\%1
ffmpeg ^
-f flv ^
-i rtmp://localhost/live ^
-f dash ^
live.mpd
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