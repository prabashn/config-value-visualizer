<#
.DESCRIPTION
    This script calls generateSelfSignedCert.js to create a self-signed certificate and imports it to LocalMachine\Trusted Root Certification Authorities\Certificates.
    Additionally checks if the hosts file entry for localhost.msn.com exists and adds it if necessary.

.PARAMETER elevated
    DO NOT SET THIS PARAMETER. This is internally set by the script itself. When the script attempts to open as an Admin, this parameter serves as the
    flag that elevation was attempted.

.PARAMETER localhostIp
    Specify alternate localhost IP other than default loopback address.
    This is used for setting up proper host inside docker so the host dev server can be called properly through localhost.msn.com.

.PARAMETER force
    True if force overwriting current self-signed cert and host mapping file
#>

param(
    [switch]$elevated,
    [string]$localhostIp = "127.0.0.1",
    [switch]$force = $false
)

function CheckAdmin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

function checkFileStatus($filePath)
{
    $fileInfo = New-Object System.IO.FileInfo $filePath

    try
    {
        $fileStream = $fileInfo.Open( [System.IO.FileMode]::Open, [System.IO.FileAccess]::Write, [System.IO.FileShare]::Read )
        $fileStream.Close()
        return $true
    }
    catch
    {
        Write-Warning $_
        return $false
    }
}

Write-Host "`n======================================"
Write-Host "Setup localhost.msn.com SSL cert and host mapping"
Write-Host "======================================`n"

Write-Host "localhostIp - $localhostIp"

# Detect if host mapping is there already
$hostFilePath = "$env:SystemRoot\system32\drivers\etc\hosts"
$localhostDomain = "localhost.msn.com"
$hostFileLineToAdd = "$localhostIp $localhostDomain"

$hostFileContent = Get-Content $hostFilePath
$hasHostMapping = $hostFileContent -contains $hostFileLineToAdd

# Detect if certificate is already installed
$scriptDir = Split-Path $myinvocation.MyCommand.Definition
$certFile = Join-Path -Path $scriptDir -ChildPath "localhost.crt"
$hasCertInstalled = $false
$hasCertFile = [bool](Test-Path $certFile)

# Check to see if existing cert file is installed or not
if ($hasCertFile) {
    $crt = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certFile)
    Write-Host "currentSSLCertThumbprint - $($crt.Thumbprint)"
    $hasCertInstalled = [bool](Get-ChildItem cert:\LocalMachine\Root -Recurse | Where-Object { $_.Thumbprint -eq $crt.Thumbprint })
}

Write-Host "hasHostMapping - $hasHostMapping"
Write-Host "hasCertFile - $hasCertFile"
Write-Host "hasCertInstalled - $hasCertInstalled"

if ($force) {
    Write-Host "`n======================================"
    Write-Host "Force new cert to be installed and host name mapped anyways due to -force"
    Write-Host "======================================`n"
    $hasHostMapping = $false
    $hasCertInstalled = $false
} elseif ($hasHostMapping -and $hasCertInstalled) {
    Write-Host "`n======================================"
    Write-Host "localhost.msn.com is already mapped in host file and cert installed. Exit early."
    Write-Host "======================================"
    return
}

# Check if the script is executed as an Admin, if not try to elevate only if
if ((CheckAdmin) -eq $false) {
    if ($elevated) {
        Write-Error "Unable to elevate. Parameter 'elevated' is true but user does not have Admin role. Please allow the script to be executed as and Admin when propmted."
    }
    else {

        Write-Host "`n======================================"
        Write-Host "Elevating to admin mode so cert can be installed and host file updated"
        Write-Host "======================================"

        $additionalParams = ""
        if ($force) {
            $additionalParams += " -force"
        }

        Start-Process powershell.exe -Verb RunAs -ArgumentList ('-noprofile -noexit -file "{0}" -elevated -localhostIp "{1}"{2}' -f ($myinvocation.MyCommand.Definition),$localhostIp,$additionalParams)
    }
    exit
}

if (!$hasHostMapping) {
    # Add localhost.msn.com to hosts file but remove any previous entries first
    $newFileContent = ""
    if ($hostFileContent) {
        Write-Host "`n======================================"
        Write-Host "Removing existing line with '$localhostDomain' and"
        Write-Host "adding new mapping for '$hostFilePath'"
        Write-Host "======================================"

        $newFileContent = $hostFileContent | Where-Object { $_ -notmatch $localhostDomain }
    }

    Write-Host "`nBefore:"
    $hostFileContent | Out-String | Write-Host

    $newFileContent += "`n$hostFileLineToAdd"

    Write-Host "`nAfter:"
    $newFileContent | Out-String | Write-Host

    $retry = 5
    while ($retry -gt 0) {
        try {
            if (checkFileStatus($hostFilePath)) {
                Write-Host "Writing to host file..."
                Set-Content -Path $hostFilePath -Value $newFileContent -Force -ErrorAction Stop
                Write-Host "Completed"
                break
            }
        } catch {
            Write-Warning $_
        }

        Write-Warning "Failed to write file. Retrying..."
        $retry--
        if ($retry -eq 0) {
            Write-Host "Exhausted all retries. Last try to write back old content"
            Start-Sleep -Seconds 2
            Set-Content -Path $hostFilePath -Value $hostFileContent -Force -ErrorAction Stop
            throw "Failed to write to $hostFilePath"
        }

        Start-Sleep -Seconds 2
    }

} else {
    Write-Host "======================================"
    Write-Host "'$hostFileLineToAdd' already mapped to $hostFilePath"
    Write-Host "======================================`n"
}

if (!$hasCertInstalled) {

    if (!$hasCertFile -or $force) {

        # cd into the location of this script before executing the node js script that generates the cert
        Set-Location $PSScriptRoot

        Write-Host "`n======================================"
        Write-Host "Creating new SSL cert"
        Write-Host "======================================"

        # Generate cert if it hasn't been created already
        node ./generateSelfSignedCert.js
    }

    # Import SSL cert to "LocalMachine\Trusted Root Certification Authorities\Certificates"
    Write-Host "`n======================================"
    Write-Host "Trusting self-signed localhost SSL cert"
    Write-Host "======================================"
    Import-Certificate -FilePath $certFile -CertStoreLocation "cert:\LocalMachine\Root"
} else {
    Write-Host "`n======================================"
    Write-Host "Localhost SSL cert already installed"
    Write-Host "======================================"
}

# Delete the pem file generated using "npm run gen-cert"
$pemFile = "../pem"
if (Test-Path $pemFile)
{
  Remove-Item $pemFile
}

Write-Host "`n======================================"
Write-Host "Setup localhost cert completed"
Write-Host "======================================"