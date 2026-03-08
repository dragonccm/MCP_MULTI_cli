$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

Write-Host 'Starting daemon + Next.js dashboard...'
Write-Host 'Dashboard URL: http://localhost:3000'

$mcpDist = Join-Path $root 'mcp-server/dist/index.js'
if (-not (Test-Path $mcpDist)) {
    Write-Host 'MCP server chưa build, đang build...'
    & npm run build:mcp
    if ($LASTEXITCODE -ne 0) { throw "MCP build failed" }
}

$daemon = Start-Process -FilePath node -ArgumentList @('orchestrator.js', '--daemon') -WorkingDirectory $root -PassThru
$daemonPort = 8080
$portFile = Join-Path $root 'docs/daemon-port.json'
$daemonReady = $false
for ($i = 0; $i -lt 20; $i++) {
    $ownPortFound = $false
    if (Test-Path $portFile) {
        try {
            $portData = Get-Content $portFile -Raw | ConvertFrom-Json
            if ($portData.port -and $portData.pid -eq $daemon.Id) {
                $daemonPort = [int]$portData.port
                $ownPortFound = $true
            }
        } catch { }
    }
    try {
        $status = Invoke-RestMethod -Method Get -Uri "http://localhost:$daemonPort/status" -TimeoutSec 1
        if ($status.daemon -eq 'ok' -and $ownPortFound) {
            $daemonReady = $true
            break
        }
    } catch { }
    Start-Sleep -Milliseconds 500
}
Write-Host "Daemon API:   http://localhost:$daemonPort/status"
if (-not $daemonReady) {
    Write-Warning 'Daemon chưa phản hồi status, dashboard vẫn khởi chạy nhưng có thể tạm offline.'
}

try {
    if (-not (Test-Path (Join-Path $root '.next/BUILD_ID'))) {
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw "next build failed" }
    }
    & npm run next:start
}
finally {
    if ($daemon -and -not $daemon.HasExited) {
        Stop-Process -Id $daemon.Id -Force -ErrorAction SilentlyContinue
    }
}
