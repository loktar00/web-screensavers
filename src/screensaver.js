var ngui            = require('nw.gui'),
    nwin            = ngui.Window.get();

// go through the arguments check for config or preview
ngui.App.argv.forEach(function(elm){
    var argVal = elm.toLowerCase();
    if(argVal.indexOf('/c') > -1 || argVal.indexOf('/p') > -1){
        // right now just dont run the screensaver
        ngui.App.closeAllWindows();
    }
});


ngui.Screen.Init();

var screens         = ngui.Screen.screens,
    screenWidth     = 0,
    screenHeight    = 0;

// iterate through the screens get the dimensions
for(var i = 0; i < screens.length; i++) {
  screenWidth += screens[i].bounds.width;
  screenHeight = Math.max(screenHeight, screens[i].bounds.height);
}

// add event listeners to kill the screensaver on user input
document.body.addEventListener('keyup', function(){
    ngui.App.closeAllWindows();
});

document.body.addEventListener('click', function(){
    ngui.App.closeAllWindows();
});

document.body.addEventListener('mousemove', function(e){
    if(mouseX && mouseY){
        if(Math.abs((mouseX+mouseY) - (e.screenX+e.screenY)) > 10 ){
          ngui.App.closeAllWindows();
        }
    }else{
        mouseX = e.screenX;
        mouseY = e.screenY;
    }

});


// The following code is only needed if you plan to have your screensaver over, or interact with a screenshot of the desktop
// Should probably break this out into a function.
// Note: this doesn't matter in Windows 8 because MS in all their infinite wisdom makes the screen turn blue when the screensaver is activated

// Hide the window so we can take a screenshot
nwin.hide();

var desktopCanvas = document.querySelector('#desktopCanvas'),
    desktopCtx    = desktopCanvas.getContext("2d"),
    video         = document.querySelector('video'),
    mediaStream   = null,
    mouseX        = 0,
    mouseY        = 0;

// has a bit of a timeout so our screenshot doesnt include our window before its hidden.
setTimeout(function(){
    // set our canvas to the size of the screens
    desktopCanvas.width    = screenWidth;
    desktopCanvas.height   = screenHeight;

    // This is used to take a screenshot of the users desktop
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
    navigator.getUserMedia({
           audio: false,
           video: {
               mandatory: {
                   chromeMediaSource: 'screen',
                   maxWidth: screenWidth,
                   maxHeight: screenHeight
               },
               optional: []
           }
        }, function(stream) {
           video.src = window.URL.createObjectURL(stream);
           mediaStream = stream;
        }, function(){
            // error
        }
    );
}, 100);


video.addEventListener("play", function() {
    nwin.show();
    nwin.resizeTo(screenWidth, screenHeight);
    nwin.moveTo(0, 0);
    ngui.Window.get().enterKioskMode();
    desktopCtx.drawImage(video,0,0);
    // We just need the first frame for a screenshot so stop streaming
    mediaStream.stop();
}, false);
