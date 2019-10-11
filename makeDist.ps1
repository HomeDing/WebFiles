# for ($i = 1; $i -le 100; $i++ ) {
#     Write-Log "Search in Progress" -Status "$i% Complete:" -PercentComplete $i;
#     Start-Sleep -m 50
# }

$global:perc = 0

function Write-Log {
    param ($msg)
    $global:perc = $global:perc + 5
    Write-Progress $msg -PercentComplete $global:perc
    Write-Output $msg
    Write-Output $msg >>make.log
    Start-Sleep -m 100
}

New-Item make.log -ItemType "file" -Force | out-null

Write-Log "Creating a new set of files for full HomeDing Web ..."


Write-Log "Preparing..."
Rename-Item dist dist-old
Remove-Item dist-old -Recurse -Force
New-Item dist -ItemType "directory"  | out-null


Write-Log "Compiling Typescript"
npm run build:ts >>make.log


Write-Log "Compiling CSS"
npm run build:css >>make.log


Write-Log "Copying CSS"
Copy-Item iotstyle.css dist


Write-Log "Copying JS"
Copy-Item *.js dist -Exclude *.min.js,server.js


Write-Log "Copying Images"
Copy-Item .\*.svg dist
Copy-Item .\favicon*.png dist


Write-Log "Copying Config files"
Copy-Item .\elements.json dist
Copy-Item .\browserconfig.xml dist
Copy-Item .\manifest.json dist


Write-Log "Copying pages"
Copy-Item .\index.htm .\dist
Copy-Item .\setup.htm .\dist
Copy-Item .\ding-*.htm .\dist
Copy-Item .\ding-ide.js .\dist
Copy-Item .\panel.htm .\dist
Copy-Item .\boot.htm .\dist


Write-Log "Creating File List"
Get-ChildItem -Path dist -Name > dist/list.txt


Write-Log "done."
Write-Log "See log in C:\Users\Matthias\Projects\HomeDingWebFiles\make.log"

# type make.log
