# Script directo para desplegar en Netlify
Write-Host "Iniciando despliegue hacia Netlify..." -ForegroundColor Cyan

# Dejamos que Netlify se encargue del build y configure el entorno de Next.js
Write-Host "Iniciando sesión en Netlify y construyendo el proyecto..." -ForegroundColor Yellow
npx.cmd --yes netlify-cli deploy --build --prod

Write-Host "¡Proceso terminado!" -ForegroundColor Green
Write-Host "Si hubo un error de autorización, asegúrate de iniciar sesión usando: npx.cmd netlify-cli login" -ForegroundColor Yellow
