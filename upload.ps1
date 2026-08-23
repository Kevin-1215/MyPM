[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$lines = Get-Content -Path "js\data.js" -Encoding UTF8
$jsonLines = @()
$capture = $false

foreach ($line in $lines) {
    if ($line -match '^\s*const dashboardData =\s*(\{.*)$') {
        $jsonLines += $matches[1]
        $capture = $true
        continue
    }
    if ($capture) {
        if ($line -match '^\s*\};\s*$') {
            $jsonLines += "}"
            break
        }
        $jsonLines += $line
    }
}

$jsonText = $jsonLines -join "`n"

# 驗證 JSON
try {
    $parsed = $jsonText | ConvertFrom-Json
    Write-Host "JSON Validated Successfully. Keys: $($parsed.psobject.properties.Name -join ', ')"
} catch {
    Write-Host "JSON Parse Error: $_"
    exit 1
}

$url = "https://vb-apparel-design-startup-default-rtdb.asia-southeast1.firebasedatabase.app/dashboardAppData.json"
Write-Host "Uploading to Firebase: $url"

try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonText)
    $req = [System.Net.WebRequest]::CreateHttp($url)
    $req.Method = "PUT"
    $req.ContentType = "application/json; charset=utf-8"
    $req.ContentLength = $bytes.Length
    
    $stream = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    
    $res = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($res.GetResponseStream(), [System.Text.Encoding]::UTF8)
    $respBody = $reader.ReadToEnd()
    $reader.Close()
    $res.Close()
    
    Write-Host "=== SYNC_SUCCESSFUL ==="
    Write-Host "Preview of response: $($respBody.Substring(0, [System.Math]::Min(150, $respBody.Length)))"
} catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($resp) {
        $rStream = $resp.GetResponseStream()
        $rReader = New-Object System.IO.StreamReader($rStream)
        Write-Host "Firebase Error Details: $($rReader.ReadToEnd())"
    } else {
        Write-Host "WebException: $_"
    }
}
