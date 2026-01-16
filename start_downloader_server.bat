@echo off
echo ===================================================
echo   INICIANDO SISTEMA DE MIDIA NATIVO (ECOMFLOW)
echo ===================================================
echo.
echo [1/2] Verificando dependencias Python...
pip install -r backend/requirements.txt > nul 2>&1
echo       Dependencias verificadas.
echo.
echo [2/2] Iniciando Servidor Local...
echo.
echo   MANTENHA ESTA JANELA ABERTA PARA OS DOWNLOADS FUNCIONAREM.
echo   Voce pode minimizar esta janela.
echo.
python backend/server.py
pause
