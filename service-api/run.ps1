# 在 fastapi 启动的情况下运行 ./run.ps1 可以使用 node.js 测试后端接口是否正常

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$serviceApiDir = $PSScriptRoot
$venvPython = Join-Path $serviceApiDir ".venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $serviceApiDir -PathType Container)) {
    throw "service-api directory not found: $serviceApiDir"
}

if (Test-Path -LiteralPath $venvPython -PathType Leaf) {
    $pythonCommand = $venvPython
} else {
    $pythonCommand = "python"
}

Get-Command node -ErrorAction Stop | Out-Null

$testFiles = @(
    "get_launderingBack_config.js"
    "get_addInfo_config.js"
    "get_question_config.js"
    "get_chooseFutures_config.js"
    "post_launderingBack_answer.js"
    "post_addInfo_answer.js"
    "post_question_answer.js"
    "post_chooseFutures_answer.js"
    "get_province_code.js"
    "get_city_code.js"
    "get_jsinject_data.js"
)

Push-Location $serviceApiDir
try {
    Write-Host "Initializing database..."
    & $pythonCommand -m scripts.seed.seed_all
    if ($LASTEXITCODE -ne 0) {
        throw "Database initialization failed with exit code $LASTEXITCODE"
    }

    foreach ($testFile in $testFiles) {
        $testPath = Join-Path $serviceApiDir "test\$testFile"
        if (-not (Test-Path -LiteralPath $testPath -PathType Leaf)) {
            throw "Test file not found: $testPath"
        }

        Write-Host "Running: $testFile"
        & node $testPath
        if ($LASTEXITCODE -ne 0) {
            throw "Test command failed: $testFile (exit code $LASTEXITCODE)"
        }
    }

    Write-Host "All commands successfully completed."
} finally {
    Pop-Location
}
