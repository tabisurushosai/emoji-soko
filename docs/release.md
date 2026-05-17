# itch.io リリース手順

## butler のインストール

macOS (Homebrew):

```bash
brew install butler
```

公式: https://itch.io/docs/butler/installation.html

インストール後、PATH に `butler` が通っていることを確認:

```bash
which butler
```

## 初回ログイン（社長作業・1回のみ）

API キーをスクリプトやリポジトリに **書かない**。ターミナルで:

```bash
butler login
```

itch.io の API キーを入力すると、`~/.config/itch/butler_creds` に保存されます。

## リリース（ZIP 生成 + push を 1 コマンド）

プロジェクトルートで:

```bash
bash scripts/release_to_itch.sh
```

内部の流れ:

1. `scripts/build_zip.sh` → `emoji-soko_store.zip` 生成
2. `butler push emoji-soko_store.zip tabisurushosai/emoji-soko-tabisurushosai:html`
3. `butler status tabisurushosai/emoji-soko-tabisurushosai`

## 前提

- itch.io でプロジェクトページを作成済み（slug: `emoji-soko-tabisurushosai`）
- Kind of project: **HTML**
- `butler login` 済み

## 手動で ZIP のみ作る場合

```bash
bash scripts/build_zip.sh
```

## トラブルシュート

| 症状 | 対処 |
|------|------|
| `butler: command not found` | `brew install butler` 後、シェルを再起動 |
| `not logged in` | `butler login` を実行 |
| push 先が無い | itch.io Dashboard でプロジェクトを先に作成 |
