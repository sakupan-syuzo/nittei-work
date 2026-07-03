# イベント日程調整ツール

社内外からアクセス可能なブラウザベースのイベント日程調整アプリケーションです。

![イベント日程調整ツール](https://img.shields.io/badge/JavaScript-Vanilla-yellow) ![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue) ![JSONBin](https://img.shields.io/badge/Storage-JSONBin.io-green)

## 🌟 デモサイト

- **デフォルト版**: https://sakupan-syuzo.github.io/nittei/
- **職場用**: https://sakupan-syuzo.github.io/nittei-work/

## ✨ 機能

- ✅ **イベント作成**: 複数の日程候補を設定
- ✅ **出欠回答**: 参加可能/未定/不可の3択で回答
- ✅ **コメント機能**: 提案や意見を記入可能
- ✅ **回答状況の可視化**: 誰が何と答えたか一覧表示
- ✅ **日程別集計**: 各日程の○△×の人数を自動集計
- ✅ **管理機能**: パスワード保護でイベントの編集・削除
- ✅ **データ共有**: JSONBin.ioで複数デバイス・複数人で同じデータを共有
- ✅ **レスポンシブデザイン**: スマートフォン対応

## 📱 使い方（参加者向け）

### 1. イベントを確認

URLにアクセスすると、イベント一覧が表示されます。

### 2. 出欠を回答

1. イベントをクリック
2. 名前を入力
3. 各日程候補に対して「参加可能」「未定」「不可」を選択
4. 必要に応じてコメントを入力
5. 「回答を送信」ボタンをクリック

### 3. 回答状況を確認

イベント詳細ページで、他の参加者の回答状況と日程別集計を確認できます。

## 🛠️ セットアップ（自分用にカスタマイズする）

### 前提条件

- GitHubアカウント
- JSONBin.ioアカウント（無料）

### ステップ1: JSONBin.ioでアカウントを作成

1. [JSONBin.io](https://jsonbin.io) にアクセス
2. 「Sign Up」でアカウントを作成（Googleアカウントでログイン可能）

### ステップ2: Master Keyを取得

1. ダッシュボードの **X-MASTER-KEY** をコピー
   ```
   例: $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### ステップ3: BINを作成

1. ダッシュボードで **「Create a Bin」** をクリック
2. **Name**: `event-scheduler-data`（任意の名前）
3. **Content** に以下を入力:
   ```json
   {
     "events": []
   }
   ```
4. **Create** をクリック
5. 作成された **BIN ID** をコピー
   ```
   例: 6a46f880da38895dfe256075
   ```

### ステップ4: コードを設定

`app.js` の1〜4行目を編集：

```javascript
// JSONBin.io 設定
const JSONBIN_API_KEY = 'ここにMaster Keyを貼り付け';
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_BIN_ID = 'ここにBIN IDを貼り付け';
```

**例**:
```javascript
const JSONBIN_API_KEY = '$2a$10$fuyJjSPztFHlaKC4O/yQJ.wi1F1JwubQoqjmtOOPg1HiUHTClV9dS';
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_BIN_ID = '6a46f880da38895dfe256075';
```

### ステップ5: GitHub Pagesにデプロイ

#### 5-1. GitHubリポジトリを作成

1. GitHubで **New repository** をクリック
2. **Repository name**: `nittei`（任意の名前）
3. **Public** を選択
4. **Create repository** をクリック

#### 5-2. ファイルをアップロード

以下の3つのファイルをアップロード：
- `index.html`
- `style.css`
- `app.js`（設定済み）

#### 5-3. GitHub Pagesを有効化

1. **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main`, `/ (root)`
4. **Save**

#### 5-4. アクセス

1〜2分待ってから、以下のURLにアクセス:
```
https://あなたのユーザー名.github.io/リポジトリ名/
```

## 🔒 セキュリティについて

### ⚠️ 重要な注意事項

このアプリは**静的サイト**（サーバーレス）のため、以下の制限があります：

1. **API Keyが公開される**
   - GitHub Pagesで公開すると、JavaScriptのコードは誰でも見られます
   - API KeyやBIN IDも見られる可能性があります

2. **データの保護**
   - 悪意のあるユーザーがデータを削除・改ざんできる可能性があります

### 💡 対策と推奨事項

✅ **機密情報は入力しない**
- 個人のメールアドレス、電話番号などは避ける
- 社内イベントなど、公開されても問題ない用途で使用

✅ **バックアップを取る**
- 重要なイベントはスクリーンショットを保存
- JSONBin.ioのダッシュボードから手動バックアップ可能

✅ **管理パスワードを変更**
- `app.js` の12行目で変更可能:
  ```javascript
  const ADMIN_PASSWORD = 'open'; // ← 好きなパスワードに変更
  ```

## 🗂️ 用途別に複数のサイトを作成

職場用・プライベート用など、複数のサイトを作成できます。

### 方法1: フォルダをコピー

1. プロジェクトフォルダ全体をコピー（例：`nittei-work`）
2. `app.js` の設定を変更：
   ```javascript
   const JSONBIN_BIN_ID = '新しいBIN ID'; // 新規作成したBIN
   const FOLDER_ID = 'work'; // 識別用
   ```
3. 新しいGitHubリポジトリにアップロード

### 方法2: 同じリポジトリ内にフォルダを作成

1. リポジトリ内に `work` フォルダを作成
2. 3つのファイルをアップロード
3. `https://ユーザー名.github.io/nittei/work/` でアクセス

## 📋 管理機能

### パスワード

デフォルト: `open`

### 管理画面でできること

1. **イベント編集**: タイトル、説明、日程候補の変更
2. **イベント削除**: 不要なイベントの削除

### アクセス方法

1. トップページの **「管理」** ボタンをクリック
2. パスワードを入力
3. 編集・削除したいイベントを選択

## 🐛 トラブルシューティング

### イベントが表示されない

1. **ページをリロード**（F5キー）
2. **ブラウザのキャッシュをクリア**（Ctrl+Shift+R）
3. **Console**（F12）でエラーを確認

### 回答が反映されない

1. **ページをリロード**してから操作
2. 複数人が同時に操作している場合、最後に保存した人のデータが反映されます

### 「401 Unauthorized」エラー

- API Keyが間違っています
- JSONBin.ioのダッシュボードで正しいMaster Keyをコピーし直してください

### データが消えた

1. JSONBin.ioのダッシュボードで該当BINの履歴を確認
2. バックアップから復元

## 📄 ファイル構成

```
nittei/
├── index.html       # メインHTML
├── style.css        # スタイルシート
├── app.js           # JavaScriptロジック
├── README.md        # このファイル
└── api.php          # （未使用）サーバー版のバックエンド
```

## 🔧 技術スタック

- **フロントエンド**: Vanilla JavaScript（フレームワーク不使用）
- **スタイル**: CSS3（レスポンシブデザイン）
- **データストレージ**: JSONBin.io REST API
- **ホスティング**: GitHub Pages
- **バックアップ**: LocalStorage（フォールバック）

## 📊 JSONBin.io 無料プランの制限

- **リクエスト数**: 100,000 回/月
- **BIN数**: 無制限
- **ストレージ**: 制限なし

通常の使用（10〜20人の日程調整）なら、無料プランで十分です。

## 🤝 貢献

改善提案やバグ報告は、GitHubのIssuesでお願いします。

## 📝 ライセンス

MIT License

自由に使用・改変・再配布できます。

## 👨‍💻 開発者

このプロジェトは Claude Code と共同で開発されました。

---

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesを開いてください。

**楽しいイベント調整を！** 🎉
