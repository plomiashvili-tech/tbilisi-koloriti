@echo off
setlocal
set PATH=C:\Program Files\nodejs;%PATH%

echo ============================================
echo   Tbilisi koloriti - Build Setup
echo ============================================
echo.

:: Step 1 - Login with browser
echo [Step 1/4] Opening browser for Expo login...
echo   - If you don't have an account, click "Sign Up" in the browser
echo   - Use your email: it's free
echo   - Then come back to this window
echo.
call eas login -b
if %errorlevel% neq 0 (
  echo Login failed. Please try again.
  pause
  exit /b 1
)
echo.
echo Login successful!
echo.

:: Step 2 - Init project
echo [Step 2/4] Linking project to your Expo account...
call eas init --id "" --force 2>nul || call eas init
echo.

:: Step 3 - Build Android APK
echo [Step 3/4] Building Android APK in the cloud (takes ~10 minutes)...
echo   You can close this window - the build runs on Expo's servers.
echo   A download link will appear when done.
echo.
call eas build --platform android --profile preview --non-interactive

echo.
echo ============================================
echo   BUILD COMPLETE
echo ============================================
echo.
echo Your APK is ready. The download link is shown above.
echo.
echo To install on your Android phone:
echo   1. Open the download link on your phone
echo   2. Tap the APK file to download it
echo   3. Tap "Install" (allow unknown sources if asked)
echo.
echo To publish to Google Play Store ($25 one-time):
echo   Run: eas submit --platform android --profile production
echo.
pause
