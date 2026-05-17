<#
.SYNOPSIS
    Pulls the ai-library repo at session start. Non-blocking.

.DESCRIPTION
    Wired in .claude/settings.json as a SessionStart hook. Runs on every Claude Code session
    start in this repo. Uses --ff-only so it can never auto-merge or rewrite local work.
#>

$repo = 'C:\Workspace\ai-library'
$name = Split-Path $repo -Leaf

if (-not (Test-Path "$repo\.git")) {
    Write-Output "session-start: $name (not a git repo, skipped)"
    exit 0
}

try {
    $out = & git -C $repo pull --ff-only 2>&1 | Out-String

    if ($LASTEXITCODE -ne 0) {
        $brief = ($out -split "`n" | Where-Object { $_ -match '\S' } | Select-Object -First 1).Trim()
        Write-Output "session-start: $name (pull failed - $brief)"
        exit 0
    }

    if ($out -match 'Already up to date') {
        Write-Output "session-start: $name (up to date)"
    } elseif ($out -match 'Updating ([0-9a-f]+)\.\.([0-9a-f]+)') {
        $from = $matches[1].Substring(0, 7)
        $to   = $matches[2].Substring(0, 7)
        $count = (& git -C $repo log --oneline "$from..$to" 2>$null | Measure-Object -Line).Lines
        Write-Output "session-start: $name (pulled $count new commit$(if ($count -ne 1) {'s'}): $from -> $to)"
    } else {
        $brief = ($out -split "`n" | Where-Object { $_ -match '\S' } | Select-Object -First 1).Trim()
        Write-Output "session-start: $name ($brief)"
    }
} catch {
    Write-Output "session-start: $name (error: $($_.Exception.Message))"
}

exit 0
