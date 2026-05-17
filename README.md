# 絵文字の蔵 (Emoji Soko)

絵文字を押して所定の位置に並べる倉庫番パズル、100ステージ、HTML5

- GitHub: https://github.com/tabisurushosai/emoji-soko
- itch.io: https://tabisurushosai.itch.io/emoji-soko-tabisurushosai

## 公開完了

**EMOJI SOKO（絵文字の蔵）** を itch.io で公開しました。

| リンク | URL |
|---|---|
| プレイ | https://tabisurushosai.itch.io/emoji-soko-tabisurushosai |
| ソースコード | https://github.com/tabisurushosai/emoji-soko |

SNS 告知文は `SNS_ANNOUNCE.md` を参照してください。

## リリース前チェック

butler push の前に、以下で 8 項目を一括確認:

```bash
bash scripts/release_check.sh
```

すべて OK なら `✓ Release ready` と表示されます。

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
6. **リリース（ZIP 生成 + butler push）**:

```bash
bash scripts/release_to_itch.sh
```

初回のみ `butler login` が必要。詳細は [`docs/release.md`](docs/release.md)。

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
