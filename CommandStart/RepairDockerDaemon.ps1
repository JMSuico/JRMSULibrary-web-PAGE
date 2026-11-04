# Self-Healing: Repair corrupted Docker daemon configuration files (null bytes from sudden power cut)
$paths = @(
    "$env:USERPROFILE\.docker\daemon.json",
    "$env:USERPROFILE\.docker\windows-daemon.json"
)
foreach ($p in $paths) {
    if (-not (Test-Path $p) -or ((Get-Item $p).Length -eq 0)) {
        Set-Content -Path $p -Value '{}' -Encoding UTF8
    } else {
        try {
            $raw = [System.IO.File]::ReadAllText($p)
            if ($raw.Contains("`0") -or -not ($raw.Trim().StartsWith('{'))) {
                Set-Content -Path $p -Value '{}' -Encoding UTF8
            }
        } catch {
            Set-Content -Path $p -Value '{}' -Encoding UTF8
        }
    }
}
