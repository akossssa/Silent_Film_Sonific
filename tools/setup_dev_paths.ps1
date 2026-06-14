[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Link = "D:\tmp\sfs_project"

if (Test-Path -LiteralPath $Link) {
    $Item = Get-Item -LiteralPath $Link
    $Target = if ($Item.Target -is [array]) { $Item.Target[0] } else { $Item.Target }

    if ($Item.LinkType -eq "Junction" -and $Target -eq $Root) {
        Write-Host "Dev path alias already configured:"
        Write-Host "  $Link -> $Root"
        exit 0
    }

    throw "$Link already exists and does not point to this project. Remove or rename it before running this script."
}

New-Item -ItemType Directory -Path (Split-Path -Parent $Link) -Force | Out-Null
New-Item -ItemType Junction -Path $Link -Target $Root | Out-Null

Write-Host "Created dev path alias:"
Write-Host "  $Link -> $Root"
