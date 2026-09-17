# 在 fastapi 启动的情况下运行 ./run.ps1 可以使用 node.js 测试后端接口是否正常

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$testDir = $PSScriptRoot
$serviceApiDir = Split-Path -Parent $testDir
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
    "launderingBack_test\get_launderingBack_config.js"
    "addInfo_test\get_addInfo_config.js"
    "question_test\get_question_config.js"
    "chooseFutures_test\get_chooseFutures_config.js"
    "code_test\get_province_code.js"
    "code_test\get_city_code.js"
    "code_test\get_occupation_code.js"
    "code_test\get_educationalqualification_code.js"

    "auth_test\register.js"
    "auth_test\login.js"
    "auth_test\refresh.js"

    "launderingBack_test\post_launderingBack_answer.js"
    "addInfo_test\post_addInfo_answer.js"
    "question_test\post_question_answer.js"
    "chooseFutures_test\post_chooseFutures_answer.js"

    "jsinject_test\get_jsinject_data.js"
)

Push-Location $serviceApiDir
try {
    Write-Host "Initializing database..."
    & $pythonCommand -m scripts.seed.seed_all
    if ($LASTEXITCODE -ne 0) {
        throw "Database initialization failed with exit code $LASTEXITCODE"
    }

    foreach ($testFile in $testFiles) {
        $testPath = Join-Path $testDir $testFile
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
