# CONFIG SERVER API IN INDEX.HTML
1. FOR EIGOX API TEST CONFIG:
- URL_LESSON_ROOM = "https://api-test.eigox.jp";
- URL_SOCKET_SERVER = 'https://note-test.eigox.jp';
2. FOR TGL API TEST CONFIG:
- URL_LESSON_ROOM = "https://lesson-room-stag.tgl-cloud.com";
- URL_SOCKET_SERVER = 'https://simpson-stg-note.tgl-cloud.com';
3. NEED CHECK BOTH API WORK OR NOT

# CALL SESSION
1. IF USING VSCODE, INSTALL LIVE SERVER EXTENSION FOR RUN STATIC HTML FILE
2. USING THIS SESSION FOR CALL:
- TEACHER: session=cm9vbV9pZD05MTY3M2NiMjk2ZDQxYmRhZDc3ZWE5Yzc0MmVmNDQyNGE2MDJmMzY3MGQ3ZTkyMWEzNWJjOWUxODdkZTBlMjI1JnVzZXJuYW1lPVRyaWVuJnVzZXJ0eXBlPXRlYWNoZXI=
- STUDENT: session=cm9vbV9pZD05MTY3M2NiMjk2ZDQxYmRhZDc3ZWE5Yzc0MmVmNDQyNGE2MDJmMzY3MGQ3ZTkyMWEzNWJjOWUxODdkZTBlMjI1JnVzZXJuYW1lPUN1b25nJnVzZXJ0eXBlPXN0dWRlbnQ=
3. EXAMPLE FOR LIVE SERVER URL:
- TEACHER: http://127.0.0.1:5503/source/videoconnect3/start/index.html?session=cm9vbV9pZD05MTY3M2NiMjk2ZDQxYmRhZDc3ZWE5Yzc0MmVmNDQyNGE2MDJmMzY3MGQ3ZTkyMWEzNWJjOWUxODdkZTBlMjI1JnVzZXJuYW1lPVRyaWVuJnVzZXJ0eXBlPXRlYWNoZXI=
- STUDENT: http://127.0.0.1:5503/source/videoconnect3/start/index.html?session=cm9vbV9pZD05MTY3M2NiMjk2ZDQxYmRhZDc3ZWE5Yzc0MmVmNDQyNGE2MDJmMzY3MGQ3ZTkyMWEzNWJjOWUxODdkZTBlMjI1JnVzZXJuYW1lPUN1b25nJnVzZXJ0eXBlPXN0dWRlbnQ=

# SKY-WAY SDK
1. https://webrtc.ecl.ntt.com/en/
- Register account
- Create application, create new API-KEY and do important setting for dev
- Find and replace API-KEY in this source code (in skyway-4.4.5_client.min.js)
2. WEB-RTC ARCHITECTURE : P2P, SFU, MCU, and XDN
- Refer to use SFU Mode
- Using SFURoom in this source code
3. SERVER: SKY-WAY HAS INCLUDED 4 SERVERS
- Signaling Server
- STUN Server
- TURN Server
- SFU Server

# FLOW SKY-WAY SWITCHING
1. CREATE FILE skyway-4.4.5_client.min.js AND CODE SOMETHING SAME WITH vswebrtc_client.min.js
2. EDIT loadScript FROM client.js
- FROM -> loadScript('./client/vswebrtc_client.min.js', Converter.start)
- TO -> loadScript('./client/skyway-4.4.5_client.min.js', Converter.start)
3. EDIT configure FROM client.js INSTEAD OF BELLOW
- FROM -> vsWebRTCClient.configure('https://sig-test.eigox.jp', [
    new IceServer('stun:turn-test.eigox.jp'),
    new IceServer('turn:turn-test.eigox.jp', 'simpson', 'simpson5aver')
  ])
- TO -> vsWebRTCClient.configure(null, null) because # SKY-WAY SDK (3)
4. client2.js SAME WITH client.js AFTER STEP 2, 3 
