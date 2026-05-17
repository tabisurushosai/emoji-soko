# 動作確認チェックリスト

社長・担当者による目視確認用。問題があれば項目にメモを追記してください。

## リリース前必須 (P0)

### プレイ確認

- [ ] `python3 -m http.server 8080` で起動し http://localhost:8080/ でプレイできる
- [ ] ステージ 1–10 が解ける
- [ ] Undo / Reset が効く
- [ ] localStorage 進捗が残る
- [ ] BGM / SE が鳴る
- [ ] タイトル → STAGE SELECT 遷移
- [ ] エンディングが表示される（下記ダミー進捗で確認）

#### エンディング確認手順（ダミー進捗）

DevTools → Console:

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

ステージ 100 をクリアするとエンディング画面が表示されること。

### リリース作業

- [ ] **git push** — 051 で実施済みか確認 (`git status` で `origin/main` と同期)
- [ ] **butler push** — 056 のスクリプト / README 手順で `emoji-soko_store.zip` をアップロード
- [ ] **itch.io ページ Public 化** — カバー・SS・Description・価格 $0（社長作業）
- [ ] **X 告知** — `SNS_ANNOUNCE.md` の文面で投稿（社長作業）

---

## リリース後品質向上 (P1-P3)

実装後に順次チェック。一覧は **`TODO.md` の「🚧 未実装」**（タスク 058–059, 061–068）を参照。

| タスク | 内容 |
|--------|------|
| 058 | legal/*.html |
| 059 | OGP meta |
| 061 | レスポンシブ |
| 062 | タッチ / スワイプ |
| 063 | タイマー |
| 064 | ポーズ |
| 065 | ダークモード切替 |
| 066 | ARIA |
| 067 | PWA manifest |
| 068 | Service Worker |
