[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$PatchersDir = Join-Path $Root "patchers"
$DevtoolsMaxDir = Join-Path $Root "devtools/max"
$TestdataDir = Join-Path $Root "devtools/testdata"
$SchemasDir = Join-Path $Root "schemas"
$MaxSourceDirs = @($PatchersDir, $DevtoolsMaxDir)

$Failures = New-Object System.Collections.Generic.List[string]
$Warnings = New-Object System.Collections.Generic.List[string]

function Add-Failure {
    param([string]$Message)
    $Failures.Add($Message) | Out-Null
}

function Add-Warning {
    param([string]$Message)
    $Warnings.Add($Message) | Out-Null
}

function Get-ProjectRelativePath {
    param([string]$Path)
    return [System.IO.Path]::GetRelativePath($Root, $Path)
}

function Test-ProjectReference {
    param(
        [string]$Reference,
        [string]$FromFile
    )

    if ([System.IO.Path]::IsPathRooted($Reference)) {
        return Test-Path -LiteralPath $Reference -PathType Leaf
    }

    $Candidates = @(
        (Join-Path $Root $Reference),
        (Join-Path $PatchersDir $Reference),
        (Join-Path (Split-Path -Parent $FromFile) $Reference)
    )

    foreach ($Candidate in $Candidates) {
        if (Test-Path -LiteralPath $Candidate -PathType Leaf) {
            return $true
        }
    }

    return $false
}

function Read-JsonFile {
    param([System.IO.FileInfo]$File)

    try {
        return Get-Content -Raw -LiteralPath $File.FullName | ConvertFrom-Json
    } catch {
        Add-Failure "Invalid JSON: $(Get-ProjectRelativePath $File.FullName) :: $($_.Exception.Message)"
        return $null
    }
}

Write-Host "Silent Film Sonific project validation"
Write-Host "Root: $Root"
Write-Host ""

$RequiredDirs = @(
    "docs",
    "patchers",
    "devtools/max",
    "devtools/testdata",
    "schemas",
    "logs/max",
    "logs/tests",
    "logs/snapshots"
)

foreach ($Dir in $RequiredDirs) {
    $FullPath = Join-Path $Root $Dir
    if (-not (Test-Path -LiteralPath $FullPath -PathType Container)) {
        Add-Failure "Missing required directory: $Dir"
    }
}

$MaxpatFiles = @()
foreach ($Dir in $MaxSourceDirs) {
    if (Test-Path -LiteralPath $Dir -PathType Container) {
        $MaxpatFiles += @(Get-ChildItem -LiteralPath $Dir -Recurse -Filter *.maxpat -File)
    }
}

foreach ($File in $MaxpatFiles) {
    $Patch = Read-JsonFile $File
    if ($null -eq $Patch) {
        continue
    }

    if ($null -eq $Patch.patcher) {
        Add-Failure "Missing patcher root: $(Get-ProjectRelativePath $File.FullName)"
        continue
    }

    $Boxes = @($Patch.patcher.boxes)
    foreach ($BoxWrapper in $Boxes) {
        if ($null -eq $BoxWrapper.box -or $null -eq $BoxWrapper.box.text) {
            continue
        }

        $Text = [string]$BoxWrapper.box.text
        $Trimmed = $Text.Trim()
        if ($Trimmed.Length -eq 0) {
            continue
        }

        if ($Trimmed -match '^js\s+(?:"([^"]+)"|([^\s]+))') {
            $ScriptName = if ($Matches[1]) { $Matches[1] } else { $Matches[2] }
            if ($ScriptName -notmatch '^#') {
                if (-not (Test-ProjectReference -Reference $ScriptName -FromFile $File.FullName)) {
                    Add-Failure "Missing JS file referenced by $(Get-ProjectRelativePath $File.FullName): $ScriptName"
                }
            }
        }

        if ($Trimmed -match '^bpatcher\s+.*@name\s+([^\s]+\.maxpat)') {
            $PatcherName = $Matches[1]
            if (-not (Test-ProjectReference -Reference $PatcherName -FromFile $File.FullName)) {
                Add-Failure "Missing bpatcher file referenced by $(Get-ProjectRelativePath $File.FullName): $PatcherName"
            }
        }

        $FirstToken = ($Trimmed -split '\s+')[0]
        if ($FirstToken -match '\.maxpat$') {
            if (-not (Test-ProjectReference -Reference $FirstToken -FromFile $File.FullName)) {
                Add-Failure "Missing patcher file referenced by $(Get-ProjectRelativePath $File.FullName): $FirstToken"
            }
        } elseif ($FirstToken -match '^sfs\.') {
            $AbstractionFile = "$FirstToken.maxpat"
            $AbstractionPath = Join-Path $PatchersDir $AbstractionFile
            if (-not (Test-Path -LiteralPath $AbstractionPath -PathType Leaf)) {
                Add-Failure "Missing local abstraction referenced by $(Get-ProjectRelativePath $File.FullName): $AbstractionFile"
            }
        }
    }
}

$SchemaFiles = @()
if (Test-Path -LiteralPath $SchemasDir -PathType Container) {
    $SchemaFiles = @(Get-ChildItem -LiteralPath $SchemasDir -Recurse -Filter *.json -File)
}

foreach ($File in $SchemaFiles) {
    [void](Read-JsonFile $File)
}

$TestdataJsonFiles = @()
if (Test-Path -LiteralPath $TestdataDir -PathType Container) {
    $TestdataJsonFiles = @(Get-ChildItem -LiteralPath $TestdataDir -Recurse -Filter *.json -File)
}

foreach ($File in $TestdataJsonFiles) {
    [void](Read-JsonFile $File)
}

$JsFiles = @()
foreach ($Dir in $MaxSourceDirs) {
    if (Test-Path -LiteralPath $Dir -PathType Container) {
        $JsFiles += @(Get-ChildItem -LiteralPath $Dir -Recurse -Filter *.js -File)
    }
}

foreach ($File in $JsFiles) {
    $Lines = Get-Content -LiteralPath $File.FullName
    for ($Index = 0; $Index -lt $Lines.Count; $Index++) {
        if ($Lines[$Index] -match '\.set\s*\(\s*["''][^"'']*::') {
            Add-Failure "Nested Dict path uses set() instead of replace(): $(Get-ProjectRelativePath $File.FullName):$($Index + 1)"
        }
    }
}

$Node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $Node) {
    Add-Warning "Node.js not found; skipped JavaScript syntax checks."
} else {
    foreach ($File in $JsFiles) {
        & $Node.Source --check $File.FullName 2>&1 | ForEach-Object {
            if ($_ -and $_.ToString().Trim().Length -gt 0) {
                Write-Host $_
            }
        }
        if ($LASTEXITCODE -ne 0) {
            Add-Failure "JavaScript syntax check failed: $(Get-ProjectRelativePath $File.FullName)"
        }
    }
}

Write-Host "Patchers: $($MaxpatFiles.Count)"
Write-Host "Schemas:  $($SchemaFiles.Count)"
Write-Host "Scripts:  $($JsFiles.Count)"
Write-Host "Test data JSON: $($TestdataJsonFiles.Count)"
Write-Host ""

if ($Warnings.Count -gt 0) {
    Write-Host "Warnings:"
    foreach ($Warning in $Warnings) {
        Write-Host "  - $Warning"
    }
    Write-Host ""
}

if ($Failures.Count -gt 0) {
    Write-Host "Failures:"
    foreach ($Failure in $Failures) {
        Write-Host "  - $Failure"
    }
    exit 1
}

Write-Host "Validation passed."
