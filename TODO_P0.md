# emoji-soko P0 リリース完了タスク (051-060)

各タスクは作業ディレクトリ /Users/yukikotaki/Documents/emoji-soko/ で実行。
完了したら git commit + push。

## 051: git push (3 commits ahead 解消)
- [x] git status / git log origin/main..main 確認
- [x] git push origin main
- [x] 完了

## 052: 未追跡 scripts/ を git に追加
- [x] scripts/stage_tools.js と scripts/generate_hard.js を git に追加
- [x] 冒頭にコメント追加 (Development-only)
- [x] scripts/README.md を新規作成
- [x] git commit + push

## 053: TODO.md と CHECKLIST.md を実態に合わせて更新
- [x] TODO.md を「実装済」「未実装」「将来 (P1-P3)」に再構成
- [x] CHECKLIST.md を「P0 必須」「P1-P3 任意」に再構成
- [x] 既知乖離項目を 062/063/064/061/065/066/067/068 にマッピング
- [x] git commit + push

## 054: ステージ 61-100 solvability 自動検証
- [x] scripts/verify_stages.py を新規作成 (BFS、ノード上限 200K、timeout 30s)
- [x] scripts/verify_stages.sh で実行 → verification_report.md 生成
- [x] 未解決ステージのリスト抽出 (61-100 全 40 件が node cap 到達で unverified → 055 へ)
- [x] git commit + push

## 055: 未解決ステージ修正
- [x] 054 で特定された未解決ステージを修正 (手動 or generate_hard.js で再生成)
- [x] verify_stages.sh 再実行で 100/100 解可能
- [x] git commit + push

## 056: butler push スクリプト整備
- [ ] scripts/release_to_itch.sh 新規 (build_zip.sh → butler push)
- [ ] chmod +x
- [ ] docs/release.md 新規 (butler install / login 手順)
- [ ] git commit + push

## 057: itch.io 用 cover/screenshots 配置
- [ ] assets/store/cover_630x500.png (sips でリサイズ)
- [ ] assets/store/screenshots/*.png (1280x720、3-5枚)
- [ ] assets/store/README.md
- [ ] git commit + push

## 058: legal/*.html 生成
- [ ] scripts/md_to_html.py (Python 標準ライブラリのみ)
- [ ] legal/*.html を 6ファイル生成 (PRIVACY/TERMS/LICENSES 日英)
- [ ] legal/style.css
- [ ] index.html フッターに legal/*.html リンク追加
- [ ] git commit + push

## 059: OGP meta + Twitter Card
- [ ] assets/ogp_1200x630.png
- [ ] index.html <head> に og: / twitter: meta 追加
- [ ] git commit + push

## 060: リリース判定スクリプト
- [ ] scripts/release_check.sh (8 項目チェック)
- [ ] bash scripts/release_check.sh で ✓ Release ready 出る
- [ ] git commit + push
- [ ] 完了後: bash scripts/release_to_itch.sh で butler push (これは社長確認後)

