# itch.io ストア用画像

itch.io Dashboard → プロジェクト編集でアップロードするファイル一覧。

## Cover image（カバー画像）

| ファイル | サイズ | itch.io フィールド |
|----------|--------|-------------------|
| `cover_630x500.png` | **630 × 500 px** | **Cover image** |

元画像: `assets/cover.png`（1080×540）を `sips` でリサイズ。

## Screenshots（スクリーンショット）

| ファイル | サイズ | 内容 |
|----------|--------|------|
| `screenshots/screenshot_1_1280x720.png` | 1280 × 720 | タイトル画面 |
| `screenshots/screenshot_2_1280x720.png` | 1280 × 720 | ステージプレイ中 |
| `screenshots/screenshot_3_1280x720.png` | 1280 × 720 | クリア演出 |
| `screenshots/screenshot_4_1280x720.png` | 1280 × 720 | ステージ選択 |

itch.io フィールド: **Screenshots**（3〜5 枚推奨、最大 4 枚アップロード可）

元画像: `assets/screenshot_1.png` 〜 `screenshot_4.png`（1280×800）を `sips` でリサイズ。

## 再生成コマンド

```bash
# カバー
sips -z 500 630 assets/cover.png --out assets/store/cover_630x500.png

# スクリーンショット
for i in 1 2 3 4; do
  sips -z 720 1280 "assets/screenshot_${i}.png" \
    --out "assets/store/screenshots/screenshot_${i}_1280x720.png"
done
```

## 元画像の作り直し

Python でモック画像を再生成する場合:

```bash
python3 assets/cover.py
python3 assets/screenshots.py
```

その後、上記 `sips` コマンドで `assets/store/` を更新。

### ブラウザで実機スクショを撮る場合

1. `python3 -m http.server 8080` で起動
2. http://localhost:8080/ をブラウザで開く
3. 各画面（タイトル / プレイ / クリア / ステージ選択）でスクリーンショット
4. 1280×720 にトリミングまたは `sips -z 720 1280` でリサイズ
5. `assets/store/screenshots/` に保存

Puppeteer 等は不要。

## アップロード手順

1. [itch.io Dashboard](https://itch.io/dashboard) → プロジェクト編集
2. Cover image に `cover_630x500.png`
3. Screenshots に `screenshots/*.png` を 4 枚
4. Save → Public

詳細: [`docs/release.md`](../../docs/release.md)
