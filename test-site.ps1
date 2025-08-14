# Test script for SakaDeco Group website
$baseUrl = "https://sakadeco-group-ivt174imo-borelkamsus-projects.vercel.app"

Write-Host "🌐 Testing SakaDeco Group Website" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Test 1: Homepage
Write-Host "1. Testing homepage..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Homepage loads successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Homepage returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error loading homepage: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: API Products
Write-Host "2. Testing API products..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/products" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $products = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ API products endpoint works" -ForegroundColor Green
        Write-Host "   📦 Found $($products.Count) products" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ API products returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error testing API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Shop page
Write-Host "3. Testing shop page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/shop" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Shop page loads successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Shop page returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error loading shop page: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Testing completed!" -ForegroundColor Green
Write-Host "Visit your site at: $baseUrl" -ForegroundColor Cyan

