#!/bin/bash

set -e

echo "🛠️ 1. Docker起動確認（必要なら手動で起動してね）"

echo "🚀 2. minikube 起動（Docker driver）"
minikube start --driver=docker

echo "🔧 3. Docker環境変数をminikubeに切り替え"
eval $(minikube docker-env)

echo "🧾 4. Docker info（確認）"
docker info | grep Name

echo "📦 5. Skaffold 開始（開発モード）"
skaffold dev &
skaffold_pid=$!

echo "🌐 6. Ingress用にminikube tunnelを起動（要sudo）"
minikube tunnel &
tunnel_pid=$!

echo "✅ 起動完了！myapp.local にアクセスできます"
echo "📌 Skaffold PID: $skaffold_pid"
echo "📌 Tunnel PID:   $tunnel_pid"
echo ""
echo "終了するには 'kill $skaffold_pid $tunnel_pid' を実行してください"

echo "minikube tunnelを実行してください"
