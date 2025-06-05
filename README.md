# rabbit_game

## プロジェクト概要

このプロジェクトは、PhaserとFlaskを使った2Dタワーディフェンスゲームの試作品。にゃんこ大戦争風のゲームを目指し、ウサギのユニットが登場する。

- バックエンド: Python (Flask)
- フロントエンド: TypeScript + Phaser
- ビルド: Webpack
- 開発環境: Docker（dev.Dockerfile）

## 開発環境の構築方法

1. **Devcontainersを使う場合**

   VScodeでコマンドパレットを出して以下を実行

   ```txt
   Dev containers: Rebuild Container Without Cache
   ```

2. **Dockerを使う場合**

   ```bash
   docker build -f dev.Dockerfile -t rabbit_game_dev .
   docker run --rm -it -d -p 5000:5000 -v $(pwd):/app rabbit_game_dev
   ```

3. **ローカルで直接構築する場合**

   - がんばって！

4. **アクセス方法**

   - ブラウザで `http://localhost:5000/` を開く

## テストの仕方

現状、テストスクリプトは未実装やけど、動作確認は以下の手順でできるで。

1. サーバを起動（Dockerまたはローカル）
2. ブラウザで `http://localhost:5000/` を開く
3. ゲーム画面が表示されて、ウサギユニットが動けばOK

## ファイルを変更した後のテスト方法

1. **TypeScript/JSファイルを変更した場合**

   - もう一度ビルドが必要：
     ```bash
     npm run build
     ```
   - その後、ブラウザをリロードして動作確認

2. **Python/Flask側を変更した場合**

   - サーバを再起動：
     ```bash
     npm run start
     ```
   - その後、ブラウザをリロード

3. **アセット（画像等）を変更した場合**

   - ブラウザのキャッシュをクリアしてリロード

## 注意事項・補足

- 依存関係の追加は、`package.json`（Node）や`pyproject.toml`（Python）を編集してから再インストール
