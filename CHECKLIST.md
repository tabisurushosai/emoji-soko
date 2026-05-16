# 動作確認チェックリスト

社長による目視確認用。問題があれば項目にメモを追記してください。

## 基本動作

- [ ] ブラウザでローカル起動 (`file://`) で動く
- [ ] ステージ 1–10 が解ける
- [ ] Undo / Reset が効く
- [ ] localStorage 進捗が残る

## 音声・画面遷移

- [ ] BGM / SE が鳴る
- [ ] タイトル → STAGE SELECT 遷移

## クリア・エンディング

- [ ] エンディングが表示される（ダミーで 100 クリア状態にして確認）

### エンディング確認手順（ダミー進捗）

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
