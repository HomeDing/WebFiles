// file: upload.h
// contains the minimal html for uploading files

// minimized from setup.htm: configure the network
static const char setupContent[] PROGMEM =
R"==(<!doctype html><html lang="en"><head><meta http-equiv="X-UA-Compatible"content="IE=edge"><meta charset="utf-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>Setup WiFi</title></head><body style="width:300px"><h1>Setup WiFi</h1><table style="width:300px"><tr><td>Devicename:</td><td id="dname">xyz</td></tr><tr><td>Network:</td><td><select id="conNet"style="width:12em"><option selected="selected"disabled="disabled">scanning...</option></select></td></tr><tr><td>Passphrase:</td><td><input id="pass"type="password"style="width:12em"></td></tr><tr><td colspan="2"align="right"><button id="bCon">Connect</button></td></tr></table><hr><p style="text-align:right"><a id="nextLink"title="next step"href="/$update.htm"style="text-decoration:none">&gt;&gt;&gt;</a></p><script>var timer,state=0,oSel=document.getElementById("conNet");function check(){0==state?(state=1,fetch("/$sysinfo").then(function(e){return e.text()}).then(function(e){if(0<e.length){var t=JSON.parse(e).devicename;document.getElementById("dname").textContent=t;var n=document.getElementById("nextLink");n.href=n.href.replace(/\/\/[^\/]+\//,"//"+t+"/"),state=2}})):2==state?(state=3,fetch("/$scan").then(function(e){return e.text()}).then(function(e){0==e.length?state=2:(state=4,scanned(JSON.parse(e)))})):4==state&&(window.clearInterval(timer),timer=0)}function scanned(e){oSel.innerHTML="";var t=document.createElement("option");t.value=0,t.text="select...",t.disabled=!0,oSel.options.add(t),e.forEach(function(e){var t=document.createElement("option");t.value=t.text=e.id,oSel.options.add(t)})}document.getElementById("bCon").addEventListener("click",function(){fetch("/$connect?n="+oSel.value+"&p="+document.getElementById("pass").value)}),timer=window.setInterval(check,800)</script></body></html>)==";

// minimized from upload.htm
static const char uploadContent[] PROGMEM =
R"==(<!doctype html><html lang="en"><head><meta http-equiv="X-UA-Compatible"content="IE=edge"><meta charset="utf-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>Upload</title></head><body style="width:300px"><h1>Upload</h1><div id="zone"style="width:260px;height:5em;padding:20px;background-color:#ddd">Drop here</div><a href="#i">I-Upload</a><hr><p style="text-align:right"><a href="/microide.htm">&gt;&gt;&gt;</a></p><script>function dragHelper(e){e.stopPropagation(),e.preventDefault()}function dropped(e){dragHelper(e);for(var n=e.dataTransfer.files,r=new FormData,t="/"+(location.hash?location.hash.substr(1)+"/":""),a=0;a<n.length;a++)r.append("file",n[a],t+n[a].name);fetch("/",{method:"POST",body:r}).then(function(){window.alert("done.")})}var zoneObj=document.getElementById("zone");zoneObj.addEventListener("dragenter",dragHelper,!1),zoneObj.addEventListener("dragover",dragHelper,!1),zoneObj.addEventListener("drop",dropped,!1)</script></body></html>)==";

// minimized from boot.htm
static const char updateContent[] PROGMEM =
R"==(<!doctype html><html lang="en"><head><meta http-equiv="X-UA-Compatible"content="IE=edge"><meta charset="utf-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>Web Update</title></head><body style="width:300px"><h1>Web Update</h1><table style="width:300px"><tr><td><progress value="0"max="1"></progress></td></tr><tr><td id="info">.</td></tr><tr><td align="right"><button>Start</button></td></tr></table><hr><p style="text-align:right"><a href="/updateicons.htm"title="next step"style="text-decoration:none">&gt;&gt;&gt;</a></p><script>var repo="https://homeding.github.io/",eStart=document.querySelector("button"),eBar=document.querySelector("progress"),eInfo=document.querySelector("#info"),work={status:"0",list:null,files:0,done:0},timer=0,seed="?"+(new Date).valueOf();function log(e){eInfo.innerText=e}function next(){work.status="r"}function doS(){work.status="w",fetch(repo+"list.txt"+seed).then(function(e){return e.text()}).then(function(e){var t=e.replace(/\r?\n/g,";");t=t.replace(/;$/,""),work.list=t.split(";"),work.files=work.list.length,next()})}function doF(){work.status="w";var o=work.list.shift();work.done++,eBar.max=work.files,eBar.value=work.done,"-"==(eInfo.innerText=o)[0]?fetch("/"+o.substr(1),{method:"DELETE"}).then(next).catch(next):fetch(repo+o+seed).catch(next).then(function(e){return e.arrayBuffer()}).then(function(e){var t=new FormData;t.append("file",new Blob([e]),"/"+o),fetch("/",{method:"POST",body:t}).then(next)})}location.hash?repo+=location.hash.substr(1)+"/":repo+="v02/",log("loading from:\n"+repo),eStart.addEventListener("click",function(){timer=window.setInterval(function(){"0"==work.status?doS():"r"==work.status?0==work.list.length?work.status="e":doF():"e"==work.status&&(window.clearInterval(timer),log("done"))},330)})</script></body></html>)==";
