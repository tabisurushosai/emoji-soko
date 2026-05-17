# 動作確認チェックリスト

社長による目視確認用。問題があれば項目にメモを追記してください。

## P0 必須 (リリース前必達)

### 基本動作

- [ ] ブラウザで http://localhost:8080/ で動く (`python3 -m http.server 8080`)
- [ ] ステージ 1-10 が解ける
- [ ] Undo / Reset が効く
- [ ] localStorage 進捗が残る

### 音声・画面遷移

- [ ] BGM / SE が鳴る
- [ ] タイトル → STAGE SELECT 遷移

### クリア・エンディング

- [ ] エンディングが表示される（ダミーで 100 クリア状態にして確認）

#### エンディング確認手順（ダミー進捗）

ブラウザの DevTools → Console で以下を実行し、ページをリロードまたはタイトルから PLAY 後に最終ステージ付近を確認:

```javascript
const p = {
  cleared: Array.from({ length: 100 }, (_, i) => i + 1),
  currentStage: 100,
  bestMoves: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [String(i + 1), 10])),
  totalClearMoves: 1000,
};
localStorage.setItem('emoji-soko-progress', JSON.stringify(p));
location.reload();
```

ステージ 100 をクリアするとエンディング画面が表示されることを確認。

## P1-P3 任意 (リリース後改善)

`TODO.md` 「未実装 / 乖離 (P1)」と対応。実装されたら順次チェック。

### モバイル / UI

- [ ] 061: スマホで縦横自動スケール（レスポンシブ Canvas）
- [ ] 062: スマホでスワイプでプレイヤー移動
- [ ] 064: プレイ中にポーズ可（Esc 以外の専用キー / ボタン）

### プレイ体験

- [ ] 063: ステージ画面に経過時間表示
- [ ] 065: タイトルからダーク / ライト切替
- [ ] 066: タブキーで UI フォーカス移動（アクセシビリティ）

### 配信品質

- [ ] 067: ホーム画面追加（PWA）+ 二回目以降オフライン起動
- [ ] 068: Chrome / Safari / Firefox いずれでも崩れず動く、60fps 維持
