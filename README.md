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
6. 配布 ZIP は `bash scripts/build_zip.sh` で生成した `emoji-soko_store.zip` をアップロード
