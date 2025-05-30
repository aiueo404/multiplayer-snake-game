# Multiplayer Snake Game

## 起動方法

### ローカル
```
npm install
npm run dev
```

### Docker
```
docker build -t multiplayer-snake-game .
docker run -p 3000:3000 multiplayer-snake-game
```

### Render等での自動デプロイ
- GitHubにpushすれば自動でデプロイされます

## アクセス
- http://localhost:3000

---

- プレイヤーは矢印キーで操作
- アイテムを取ると新しいアイテムが出現
- マップ端でループ
