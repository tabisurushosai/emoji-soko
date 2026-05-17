# scripts/

開発時専用のツール群。**配布 zip には含まれない** (`build_zip.sh` で `scripts/*` を除外済み)。

## ファイル一覧

| ファイル | 種別 | 用途 |
|---|---|---|
| `build_zip.sh` | リリース | `emoji-soko_store.zip` を生成 (itch.io アップロード用) |
| `stage_tools.js` | 開発 | ステージ 21-60 を逆生成 (Reverse Solver, BFS で解可能性検証) |
| `generate_hard.js` | 開発 | ステージ 61-100 を逆生成 (難易度高め、`stage_tools.js` の `parseStage`/`solve` を再利用) |

## 実行方法

### リリース zip 作成

```sh
bash scripts/build_zip.sh
# → emoji-soko_store.zip
```

### ステージ自動生成 (Node.js のみ、外部依存なし)

```sh
node scripts/stage_tools.js     # stages/21.txt ~ 60.txt を上書き生成
node scripts/generate_hard.js   # stages/61.txt ~ 100.txt を上書き生成
```

**注意**: 既存のステージファイルを上書きするため、実行前に `git status` でクリーンな状態を確認すること。
生成は乱数 (LCG, seed = stageNum * 1000 + attempt) ベースで決定的。

## 配布物との関係

`scripts/` は git 管理されるが、`build_zip.sh` の zip 除外パターン `"scripts/*"` により、
itch.io にアップロードされる zip には含まれない。
