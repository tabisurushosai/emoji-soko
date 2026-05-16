# 絵文字の蔵 (Emoji Soko)

絵文字を押して所定の位置に並べる倉庫番パズル、100ステージ、HTML5

- GitHub: https://github.com/tabisurushosai/emoji-soko

## 公開手順

### itch.io プロジェクト作成

1. [itch.io Dashboard](https://itch.io/dashboard) を開く
2. **「Create new project」** 赤ボタンをクリック
3. 以下を入力:

| 項目 | 値 |
|---|---|
| Title | 絵文字の蔵 - 旅する書斎の倉庫番パズル |
| URL (slug) | `emoji-soko-tabisurushosai` |
| Genre | Puzzle |
| Kind of project | HTML |
| AI Disclosure | **Yes** |

4. AI Disclosure で以下 **4 項目すべて** にチェック:
   - Graphics
   - Sounds
   - Text & Dialog
   - Code

5. 説明文は `STORE_DESCRIPTION.md` を参照
6. 配布 ZIP を生成:

```bash
bash scripts/build_zip.sh
```

7. butler でアップロード（社長がローカルターミナルで実行）:

```bash
BUTLER_API_KEY=$(python3 -c "import json; print(json.load(open('$HOME/.config/itch/butler_creds'))['key'])") \
  ~/bin/butler push emoji-soko_store.zip tabisurushosai/emoji-soko-tabisurushosai:html
```

> itch.io でプロジェクトページ（slug: `emoji-soko-tabisurushosai`）を作成してから実行してください。

### itch.io ページ設定チェックリスト

butler push 後、Dashboard で以下を確認・設定:

- [ ] Cover image アップロード（`assets/cover.png`）
- [ ] Screenshots 4枚アップロード（`assets/screenshot_1.png` 〜 `screenshot_4.png`）
- [ ] Description 貼り付け（`STORE_DESCRIPTION.md` から）
- [ ] Genre: Puzzle
- [ ] Tags: puzzle, sokoban, emoji, free
- [ ] AI Disclosure: Yes + 4チェック（Graphics / Sounds / Text & Dialog / Code）
- [ ] Pricing: $0（または PWYW、Suggested price $1）
- [ ] Visibility: Public（Save 後）
