@echo off
setlocal enabledelayedexpansion
title 2D Minecraft - Batch Edition
mode con: cols=42 lines=14

:: Define Block Types
set "sky= "
set "grass=▄"
set "dirt=░"
set "stone=█"
set "player=X"

:: Game Grid Dimensions
set "width=40"
set "height=10"

:: Initial Player Coordinates
set /a px=5
set /a py=3

:: Generate World Map Grid
for /l %%y in (1,1,%height%) do (
    for /l %%x in (1,1,%width%) do (
        if %%y lss 5 (
            set "map_%%x_%%y=%sky%"
        ) else if %%y equ 5 (
            set "map_%%x_%%y=%grass%"
        ) else if %%y lss 8 (
            set "map_%%x_%%y=%dirt%"
        ) else (
            set "map_%%x_%%y=%stone%"
        )
    )
)

:game_loop
cls
:: Render Screen Frame
for /l %%y in (1,1,%height%) do (
    set "line="
    for /l %%x in (1,1,%width%) do (
        if %%x equ %px% if %%y equ %py% (
            set "line=!line!%player%"
        ) else (
            set "line=!line!!map_%%x_%%y!"
        )
    )
    echo.!line!
)

echo.
echo Controls: [A] Left  [D] Right  [W] Jump
echo           [S] Break block below  [Q] Quit

:: Get Input Action
choice /c adwsq /n >nul
set "action=%errorlevel%"

:: Save original coordinates for collision checks
set /a old_px=%px%
set /a old_py=%py%

:: Process Movements
if %action% equ 1 set /a px-=1
if %action% equ 2 set /a px+=1
if %action% equ 3 set /a py-=1
if %action% equ 4 (
    :: Break block directly below player feet
    set /a target_y=%py% + 1
    set "map_%px%_!target_y!=%sky%"
)
if %action% equ 5 exit

:: Basic Boundary Checking
if %px% lss 1 set /a px=1
if %px% gtr %width% set /a px=%width%
if %py% lss 1 set /a py=1
if %py% gtr %height% set /a py=%height%

:: Map Collision & Environmental Gravity
set /a feet_y=%py% + 1
if %feet_y% gtr %height% goto game_loop

:: If player walks inside a hard block, push them back
set "current_tile=!map_%px%_%py%!"
if not "!current_tile!"=="%sky%" (
    set /a px=%old_px%
    set /a py=%old_py%
)

:: Simulate Gravity fall if standing on sky air
set "below_tile=!map_%px%_%feet_y%!"
if "!below_tile!"=="%sky%" (
    set /a py+=1
)

goto game_loop
