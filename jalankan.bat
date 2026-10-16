@echo off
title BerkahBooth - Local Server
echo ========================================================
echo         MENJALANKAN BERKAHBOOTH LOCAL SERVER
echo ========================================================
echo.
echo Server aktif di: http://localhost:5173
echo.
echo Membuka browser otomatis...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo JANGAN TUTUP JENDELA INI SELAMA MENGGUNAKAN PHOTOBOOTH!
echo (Tutup jendela ini jika sudah selesai)
echo ========================================================
echo.
python -m http.server 5173
pause
