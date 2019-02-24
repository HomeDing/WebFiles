// ding-ide javascript implementation

var filesObj = document.getElementById("files");
var contentObj = document.getElementById("content");
var progressObj = document.getElementById("progressBar2");

var activeFileObj = document.getElementById("activeFile");
var checkerObj = document.getElementById("checker");

var activeFile;
var activeFileName;

var icons = {
  "json": "json",
  "css": "css",
  "dir": "dir",
  "file": "file",
  "htm": "htm",
  "html": "htm",
  "ico": "ico",
  "js": "js",
  "svg": "svg",
  "txt": "txt"
};

// load file into editor from the server
function handleLoadFile(e) {
  var s = e.target.innerText;
  activeFileName = s.split(' ')[0];
  activeFileObj.innerText = activeFileName;

  fetch(activeFileName)
    .then(function (result) {
      return (result.text());
    }).then(function (txt) {
      contentObj.innerText = txt;
    });
} // handleLoadFile()


// delete file on the server
function handleDeleteFile(e) {
  var xhr = new XMLHttpRequest();
  e.stopPropagation();
  e.preventDefault();
  var s = e.target.parentElement.firstElementChild.nextElementSibling.innerText;
  s = s.split(' ')[0];
  var yn = window.confirm("Delete " + s + " ?");
  if (yn) {
    // sync call
    xhr.open("DELETE", s, true);
    xhr.send();
    window.setTimeout(handleReloadFS, 100);
  } // if
} // handleDeleteFile()


// add one file to the directory listing.
function addFileEntry(container, f) {
  var row = document.createElement("div");
  row.className = "row nogutter";
  container.appendChild(row);
  row.addEventListener("click", handleLoadFile);

  // add icon based on file-type
  var fType = f.name.split('.').reverse()[0];
  var entry = document.createElement("div");
  entry.className = "col file-icon";
  var icon = document.createElement("img");
  icon.title = fType;
  if (icons[fType] !== undefined) {
    icon.src = "/ft/" + icons[fType] + ".svg";
  } else {
    icon.src = "/ft/file.svg";
  }

  entry.appendChild(icon);
  row.appendChild(entry);

  // add file name and size
  var entry = document.createElement("div");
  entry.className = "col stretch file-entry";
  entry.innerText = entry.title = f.name + " (" + f.size + ")";
  row.appendChild(entry);

  var delx = document.createElement("div");
  delx.className = "col file-delete";
  delx.innerText = "[X]";
  delx.addEventListener("click", handleDeleteFile);
  row.appendChild(delx);
} // addFileEntry()

// create the directory listing from the fileList dataset.
function listFiles(fileList) {
  // remove all exiting entries
  filesObj.innerHTML = "";

  fileList.forEach(function (f) {
    addFileEntry(filesObj, f);
  })
} // listFiles()


function handleReloadFS() {
  fetch('/$list')
    .then(function (result) {
      return (result.json());
    }).then(function (x) {
      x.sort(function (a, b) {
        var an = a.name.toLowerCase();
        var bn = b.name.toLowerCase();
        if (an < bn) {
          return -1;
        }
        if (an > bn) {
          return 1;
        }
        return 0;
      });
      listFiles(x);
    });
} // handleReloadFS()


// some drag events need to call stopPropagation and preventDefault to allow custom interactions
function dragHelper(e) {
  e.stopPropagation();
  e.preventDefault();
} // dragHelper()


// start uploading file content
function startUpload(filename, contentType, content) {
  progressObj.classList.remove("fadeout");

  var formData = new FormData();
  var blob = new Blob([content], {
    type: contentType
  });
  formData.append(filename, blob, filename);

  var objHTTP = new XMLHttpRequest(); // new ActiveXObject("MSXML2.XMLHTTP");
  objHTTP.open('POST', '/');

  if (objHTTP.upload) {
    objHTTP.upload.addEventListener('progress', function (e) {
      progressObj.max = e.total;
      progressObj.value = e.loaded;
    });
  } // if 

  objHTTP.addEventListener("readystatechange", function (p) {
    if ((objHTTP.readyState == 4) && (objHTTP.status >= 200) && (objHTTP.status < 300)) {
      window.setTimeout(handleReloadFS, 200);
      progressObj.classList.add("fadeout");
    } // if
  });
  objHTTP.send(formData);
}


// save file from editor back to server.
function handleSave() {
  progressObj.value = 0;
  progressObj.max = 1;
  activeFileName = window.prompt("Upload File:", activeFileName);
  if (activeFileName !== undefined)
    startUpload(activeFileName, "text/html", contentObj.innerText);
} // handleSave()


// files was dropped on dropzone
function drop(e) {
  progressObj.classList.remove("fadeout");
  progressObj.value = 0;
  progressObj.max = 1;
  e.stopPropagation();
  e.preventDefault();

  var dtFiles = e.dataTransfer.files;

  var formData = new FormData();
  var root = '/' + (location.hash ? location.hash.substr(1) + '/' : '')
  for (var i = 0; i < dtFiles.length; i++) {
    formData.append('file', dtFiles[i], root + dtFiles[i].name);
  }

  var xmlHttp = new XMLHttpRequest();

  xmlHttp.upload.addEventListener('progress', function (e) {
    progressObj.max = e.total;
    progressObj.value = e.loaded;
  });

  xmlHttp.addEventListener("readystatechange", function (p) {
    if ((xmlHttp.readyState == 4) && (xmlHttp.status >= 200) && (xmlHttp.status < 300)) {
      window.setTimeout(handleReloadFS, 100);
      progressObj.classList.add("fadeout");
      // fade progress
    } // if
  });
  xmlHttp.open("POST", "/");
  xmlHttp.send(formData);
}

var box = document.getElementById("dropzone");
box.addEventListener("dragenter", dragHelper, false);
box.addEventListener("dragover", dragHelper, false);
box.addEventListener("drop", drop, false);

window.addEventListener("load", function () {
  window.setTimeout(handleReloadFS, 400)
});

function jsonCheck() {
  var fName = activeFileObj.innerText;
  if (!fName.toLowerCase().endsWith(".json")) {
    if (checkerObj.textContent != "--") {
      checkerObj.textContent = "--";
      checkerObj.className = "";
    }

  } else {
    var t = contentObj.innerText;
    var o = null;

    try {
      o = JSON.parse(t);
      if (o && typeof o === "object") {
        // ok
      } else {
        o = null;
      } // if
    } catch (e) {
      checkerObj.textContent = e.message;
      checkerObj.className = "invalid";
    }

    if (o !== null) {
      checkerObj.textContent = "valid";
      checkerObj.className = "valid";
    } else {
      // checkerObj.innerText = "invalid";
      checkerObj.className = "invalid";
    }
    window.status = t.length + "--" + (o !== null);
  } // if

} // jsonCheck()

window.setInterval(jsonCheck, 500);