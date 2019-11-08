// file: upload.h
// contains the minimal html for uploading files

// minimized from setup.htm: configure the network
static const char setupContent[] PROGMEM =
R"==(<!doctype html><html lang="en"><head><meta http-equiv="X-UA-Compatible"content="IE=edge"><meta charset="utf-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>WiFi Setup</title></head><body><h1>WiFi Setup</h1><h2>Connect to network</h2><table><tr><td>Devicename:</td><td id="devname">xyz</td></tr><tr><td>Network:</td><td><select id="conNet"style="width:18em"><option selected="selected"disabled="disabled">scanning...</option></select></td></tr><tr><td>Passphrase:</td><td><input id="pass"style="width:18em"></td></tr></table><button id="bCon">Connect</button><script>var timer,devname,state=0,oSel=document.getElementById("conNet");function load(e,t){var n=new XMLHttpRequest;n.open("GET",e,!0),n.addEventListener("readystatechange",function(e){4==n.readyState&&200<=n.status&&n.status<300&&t(n.responseText)}),n.send()}function check(){0==state?(state=1,load("/$sysinfo",function(e){0<e.length&&(document.getElementById("devname").textContent=devname=JSON.parse(e).devicename,state=2)})):2==state?(state=3,load("/$scan",function(e){0==e.length?state=2:(state=4,scanned(JSON.parse(e)))})):4==state&&(window.clearInterval(timer),timer=0)}function scanned(e){oSel.innerHTML="";var t=document.createElement("option");t.value=0,t.text="select...",t.disabled=!0,oSel.options.add(t),e.forEach(function(e){var t=document.createElement("option");t.value=t.text=e.id,oSel.options.add(t)})}document.getElementById("bCon").addEventListener("click",function(){load("/$connect?n="+oSel.value+"&p="+document.getElementById("pass").value,function(){})}),timer=window.setInterval(check,800)</script></body></html>)==";

// minimized from upload.htm
static const char uploadContent[] PROGMEM =
R"==(<!doctype html><html lang="en"><head><meta http-equiv="X-UA-Compatible"content="IE=edge"><meta charset="utf-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>File Upload</title></head><body><h1>File Upload</h1><div id="zone"style="width:9em;height:6em;padding:1em;background-color:#ddd">Drop here</div><a href="#ft">FT-Upload</a> - <a href="#i">I-Upload</a><script>function dragHelper(e){e.stopPropagation(),e.preventDefault()}function dropped(e){dragHelper(e);for(var n=e.dataTransfer.files,t=new FormData,a="/"+(location.hash?location.hash.substr(1)+"/":""),r=0;r<n.length;r++)t.append("file",n[r],a+n[r].name);var d=new XMLHttpRequest;d.addEventListener("readystatechange",function(e){4==d.readyState&&200<=d.status&&d.status<300&&window.alert("done.")}),d.open("POST","/"),d.send(t)}var zoneObj=document.getElementById("zone");zoneObj.addEventListener("dragenter",dragHelper,!1),zoneObj.addEventListener("dragover",dragHelper,!1),zoneObj.addEventListener("drop",dropped,!1)</script></body></html>)==";

// minimized from boot.htm
static const char bootContent [] PROGMEM =
R"==(<!doctype html><html lang="en"><head><meta http-equiv="X-UA-Compatible"content="IE=edge"><meta charset="utf-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>Web Update</title></head><body><h1>Web Update</h1><table><tr><td><progress value="0"max="1"></progress></td></tr><tr><td id="info">.</td></tr><tr><td><button>start</button></td></tr></table><script>var repo="https://homeding.github.io/",eStart=document.querySelector("button"),eBar=document.querySelector("progress"),eInfo=document.querySelector("#info"),work={status:"0",list:null,files:0,done:0},timer=0;function log(e){eInfo.innerText=e}function doStart(){work.status="w";var o=new XMLHttpRequest;o.open("GET",repo+"list.txt",!0),o.responseType="text",o.onload=function(e){var t=o.responseText.replace(/\r?\n/g,";");t=t.replace(/;$/,""),work.list=t.split(";"),work.files=work.list.length,work.status="r"},o.send(null)}function doFile(){work.status="w";var n=work.list.shift();work.done++,eBar.max=work.files,eBar.value=work.done;var s=new XMLHttpRequest;s.open("GET",repo+n,!0),s.responseType="arraybuffer",s.onerror=function(e){log(n+": error: failed."),work.status="r"},s.onload=function(e){if(200!=s.status)log(n+": error: "+s.status);else{var t=s.response;if(t){var o=new FormData;o.append("file",new Blob([t]),"/"+n);var r=new XMLHttpRequest;r.addEventListener("readystatechange",function(e){4==r.readyState&&200<=r.status&&r.status<300&&log(n)}),r.open("POST","/"),r.send(o)}}work.status=0==work.list.length?"e":"r"},s.send(null),0==work.list.length&&(work.status="e")}function step(){"0"==work.status?doStart():"r"==work.status?doFile():"e"==work.status&&(timer&&(window.clearInterval(timer),log("done"),window.location.href="/"),timer=0)}location.hash?repo+=location.hash.substr(1)+"/":repo+="v01/",log("loading web files from "+repo),eStart.addEventListener("click",function(){timer=window.setInterval(step,330)})</script></body></html>)==";
