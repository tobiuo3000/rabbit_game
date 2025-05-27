# rabbit_game

## プロジェクト概要

このプロジェクトは、PhaserとFlaskを使った2Dタワーディフェンスゲームの試作品。にゃんこ大戦争風のゲームを目指してて、ウサギのユニットが登場する。

- バックエンド: Python (Flask)
- フロントエンド: TypeScript + Phaser
- ビルド: Webpack
- 開発環境: Docker（dev.Dockerfile）

## ディレクトリ・ファイル構成と概要

```
├── app.py                  # Flaskアプリのエントリポイント。Webサーバ起動用
├── dev.Dockerfile          # 開発用Dockerfile。Python,Nodeの依存関係のセットアップ
├── package.json            # Node.js用パッケージ管理ファイル。PhaserやWebpack等の依存管理
├── pyproject.toml          # Python用パッケージ管理ファイル。Flask等の依存管理
├── tsconfig.json           # TypeScriptのコンパイラ設定
├── uv.lock                 # Python依存のロックファイル
├── webpack.config.js       # Webpackの設定ファイル
├── static/
│   ├── js/                 # TypeScript/JavaScriptのソースコード
│   │   ├── main.ts         # ゲームのエントリポイント
│   │   ├── config.ts       # ゲーム設定
│   │   └── core/           # ゲームのコアロジック（エンティティ、シーン、タワー、ユニット）
│   │   └── util/           # ユーティリティ関数
│   └── assets/             # 画像等のアセット
│       └── rabbit_unit/    # ウサギユニットの画像
├── templates/
│   └── rabbit_game.html    # ゲーム画面のHTMLテンプレート
└── README.md               # このファイル！
```

## 開発環境の構築方法

1. **Devcontainersを使う場合**

   VScodeでコマンドパレットを出して以下を実行

   ```
   Dev containers: Rebuild Container Without Cache
   ```

2. **Dockerを使う場合**

   ```bash
   docker build -f dev.Dockerfile -t rabbit_game_dev .
   docker run --rm -it -p 8000:8000 -v $(pwd):/app rabbit_game_dev
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
     tsc && npx webpack
     ```
   - その後、ブラウザをリロードして動作確認

2. **Python/Flask側を変更した場合**
   - サーバを再起動してな：
     ```bash
     uv run app.py
     ```
   - その後、ブラウザをリロード

3. **アセット（画像等）を変更した場合**
   - ブラウザのキャッシュをクリアしてリロード

## 注意事項・補足

- 依存関係の追加は、`package.json`（Node）や`pyproject.toml`（Python）を編集してから再インストール
