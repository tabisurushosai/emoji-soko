# TODO

## ✅ 実装済 (001-050)

コアゲーム・音声・演出・リリース準備まで完了。詳細は `HANDOFF_FOR_CLAUDE.md` セクション2参照。

### 001-027 コアゲーム

- [x] 001: git init + ディレクトリ構造
- [x] 002: index.html + style.css
- [x] 003: game.js ループ雛形
- [x] 004: ステージデータ形式 + `stages/*.txt`
- [x] 005: グリッド描画
- [x] 006: 絵文字描画
- [x] 007: EMOJI_MAP / renderStage
- [x] 008: ステージローダー (fetch)
- [x] 009: キーボード入力 (矢印 / WASD / IJKL)
- [x] 010: 移動 + 壁判定
- [x] 011: 箱押し
- [x] 012: ゴール判定
- [x] 013: Undo
- [x] 014: Reset
- [x] 015: 進捗 localStorage
- [x] 016: クリア後次ステージ遷移
- [x] 017: ステージ選択 10×10
- [x] 018-020: ステージ 01-100
- [x] 021: タイトル画面
- [x] 022: クリア演出
- [x] 023: ヘルプ
- [x] 024: 設定 (BGM/SE/難易度/音量)
- [x] 025: 手数カウンター
- [x] 026: ベストレコード + NEW BEST
- [x] 027: プログレス表示 (X / 100)

### 028-035 音声・演出

- [x] 028: BGM (Web Audio API)
- [x] 029: SE (move/push/goal/clear/error/undo)
- [x] 030: クリアジングル + BGM ダッキング
- [x] 031: BGM/SE 音量スライダー
- [x] 032: プレイヤー歩行アニメ 150ms
- [x] 033: 箱押しシェイク
- [x] 034: ゴール星パーティクル
- [x] 035: 全画面クリア演出

### 036-050 コンテンツ・リリース

- [x] 036: エンディング画面
- [x] 037: legal/PRIVACY.md
- [x] 038: legal/TERMS.md
- [x] 039: legal/LICENSES.md
- [x] 040: icon.png
- [x] 041: cover.png
- [x] 042: screenshots ×4
- [x] 043: STORE_DESCRIPTION.md
- [x] 044: build_zip.sh
- [x] 045: CHECKLIST.md
- [x] 046: GitHub リポジトリ
- [x] 047-049: itch.io 手順・ページ設定チェックリスト
- [x] 050: 公開完了 + SNS_ANNOUNCE.md

### 051-060 リリース運用 (一部完了)

- [x] 051: git push (origin 同期)
- [x] 052: scripts/stage_tools.js, generate_hard.js + scripts/README.md
- [x] 053: 本ファイル + CHECKLIST.md 再構成
- [ ] 054-060: `TODO_P0.md` 参照 (検証・butler・legal HTML・OGP 等)

---

## 🚧 未実装 (P1-P3 で対応)

当初 TODO の [x] 表記と実装が乖離している項目。タスク番号で追跡する。

| タスク | 内容 | 優先度 |
|--------|------|--------|
| 058 | legal/*.html (現状 .md のみ) | P2 |
| 059 | OGP / Twitter Card meta | P2 |
| 061 | レスポンシブ Canvas (viewport スケール) | P1 |
| 062 | ゲーム中タッチ / スワイプ | P1 |
| 063 | タイマー表示 | P3 |
| 064 | ポーズ / メニュー (プレイ中) | P3 |
| 065 | ダーク / ライト切替 | P3 |
| 066 | ARIA / キーボードフォーカス | P3 |
| 067 | PWA manifest | P2 |
| 068 | Service Worker (オフライン) | P2 |

### 補足 (旧 TODO 番号との対応)

- 旧 008 タッチ/スワイプ → **062**
- 旧 019 タイマー → **063**
- 旧 036 ポーズ → **064**
- 旧 038 レスポンシブ → **061**
- 旧 039 ダークモード → **065**
- 旧 041 ARIA → **066**
- 旧 042 PWA → **067**
- 旧 043 Service Worker → **068**
- 旧 044-045 legal HTML → **058**
- 旧 046 OGP → **059**

---

## 📋 仕様変更履歴

| 日付 | 変更 |
|------|------|
| 050 | ステージ形式は **JSON ではなく `.txt`** (`# . $ @ *` 等) で凍結。**`.txt` → `.json` への変更は禁止。** |
| 050 | ゲーム起動は `fetch(stages/*.txt)` のため **`file://` 非推奨**。`python3 -m http.server` または itch.io 配布を想定。 |
| 052 | `scripts/` は git 管理するが `build_zip.sh` で zip から除外。 |

---

## 将来 (P3 以降・番号未割当)

- ステージエディタ
- オンラインリーダーボード
- UI 多言語切替 (en/ja)
- GitHub Actions: zip ビルド + stage validate
- ステージ JS インライン化 (`file://` 完結)
