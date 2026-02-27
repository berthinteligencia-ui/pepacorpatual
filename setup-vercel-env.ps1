# Script para adicionar variáveis de ambiente na Vercel
# Certifique-se de estar logado na Vercel (npx vercel login) antes de rodar.

$envVars = @{
    "DATABASE_URL"                = "postgresql://postgres:lo1Tlz0*xy_so@db.wbfchuvzwnzajjjrzjym.supabase.co:5432/postgres"
    "AUTH_SECRET"                 = "MRFTTJmXfMTfAjiqDtCuO5Vj3Z+coXbX7ytDeJbj538="
    "NEXTAUTH_SECRET"             = "MRFTTJmXfMTfAjiqDtCuO5Vj3Z+coXbX7ytDeJbj538="
    "AUTH_TRUST_HOST"             = "true"
    NEXT_PUBLIC_SUPABASE_URL      = https://wbfchuvzwnzajjjrzjym.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_OV4gDmQCx-1G-eXjcZiYuA_MZLZyiO3

}

Write-Host "Iniciando configuração de variáveis na Vercel..." -ForegroundColor Cyan

foreach ($name in $envVars.Keys) {
    $value = $envVars[$name]
    Write-Host "Adicionando $name..."
    echo $value | npx vercel env add $name production
}

Write-Host "Concluído! Agora você pode rodar 'npx vercel deploy' ou fazer um push para o GitHub." -ForegroundColor Green
