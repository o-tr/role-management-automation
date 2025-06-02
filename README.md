# Role Management Automation

複数のプラットフォームにわたるロール管理を自動化するNext.jsアプリケーションです。Discord、VRChat、GitHubのロールとメンバーシップを統一的に管理し、条件に基づいた自動ロール付与を実現します。

## 主な機能

### 🔗 マルチプラットフォーム対応
- **Discord**: Botトークンを使用したサーバーロール管理
- **VRChat**: グループメンバーとロールの管理
- **GitHub**: OrganizationとTeamメンバーシップの管理

### 👥 ネームスペース管理
- 複数のプロジェクトやチームを独立したネームスペースで管理
- ネームスペースごとの権限とアクセス制御
- オーナー・管理者・メンバーの階層的な権限管理

### 🎯 タグベースの分類システム
- メンバーをタグで分類・管理
- 色分けによる視覚的な識別
- タグベースでの一括操作とフィルタリング

### ⚡ 自動ロール割り当て
- 条件ベースのマッピングルール設定
- タグの組み合わせに基づく自動ロール付与
- 複数プラットフォーム間でのロール同期

### 🔍 メンバー検索・解決機能
- ユーザー名やIDでのメンバー検索
- プラットフォーム間でのアカウント紐づけ
- 外部サービスアカウントの統合管理

### 📊 統合ダッシュボード
- 全プラットフォームのメンバー状況を一元表示
- ロール変更の履歴とログ
- 招待リンクの生成と管理

### 🔒 セキュリティ機能
- NextAuth.jsによる認証システム
- サービスアカウント別の認証情報管理
- 2FA対応（VRChat TOTP）

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **認証**: NextAuth.js with Discord Provider
- **データベース**: MySQL with Prisma ORM
- **UI**: Tailwind CSS + Radix UI
- **状態管理**: TanStack Query (React Query)
- **型安全性**: TypeScript + Zod
- **コード品質**: Biome (Formatter & Linter)

## アーキテクチャ

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   └── ns/[nsId]/         # ネームスペース別UI
├── lib/                   # 外部サービス統合
│   ├── discord/          # Discord API
│   ├── vrchat/           # VRChat API
│   └── github/           # GitHub API
├── components/           # 再利用可能なUIコンポーネント
├── types/               # TypeScript型定義
└── requests/            # API クライアント関数
```
