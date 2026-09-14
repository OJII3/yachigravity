# Antiyachiviy

`agy` (Google Antigravity CLI) を Discord の会話エージェントとして利用する bot。
Klein の Discord・アクセス制御・ログ・読み取り専用 Web UI を移植し、LLM との通信は
headless `stream-json` に統一している。

## 起動

Antigravity CLI の認証を一度インタラクティブに済ませてから、依存関係をインストールする。

```sh
nix develop
bun install
agy
```

設定と環境変数を用意する。

```sh
cp config/antiyachiviy.example.json config/antiyachiviy.json
cp .env.example .env
${EDITOR:-vi} .env
${EDITOR:-vi} config/antiyachiviy.json
```

`DISCORD_BOT_TOKEN` と Discord のアクセスルールを設定し、起動する。

```sh
bun run start
```

`agy` はチャネルごとに一つの長寿命 subprocess として起動される。stdin へ
`{"event":"user","message":{"content":"..."}}` を NDJSON で送り、stdout の
`result` event を待つことで、同じ会話を維持する。`llm.dangerouslySkipPermissions` を有効にした
場合だけ `--dangerously-skip-permissions` を付ける。これは Discord の入力からファイル書き込みや
コマンド実行まで自動承認するため、信頼できる環境でのみ有効にし、通常は Antigravity 側の
権限設定を用いること。

ユーザー向けの送信は `discord_send` MCP ツールで行う。headless モードでは MCP ツールも
権限設定の対象になるため、`~/.gemini/antigravity-cli/settings.json` の `permissions.allow` に
`mcp(antiyachiviy-discord/discord_send)` を追加するか、信頼できる環境でのみ
`llm.dangerouslySkipPermissions` を有効にすること。

デフォルトでは前回のチャネル会話を `--conversation` で再開する。次回起動時だけ新規にするには、
次のようにする。

```sh
bun run start -- --new
bun run start -- --resume
```

`--resume` がデフォルト。`ANTIYACHIVIY_CONFIG_PATH` で設定ファイルの場所を変更できる。
Antigravity のモデル・agent・reasoning effort は `llm` で指定できる。

## Web UI

設定の `features.webui.enabled` を `true` にすると、同じ Elysia サーバーでログと保存済み
Antigravity セッションを閲覧できる。デフォルトは `http://127.0.0.1:4310` で、書き込み操作はない。

```sh
bun run build
bun dist/antiyachiviy
```

ログは標準出力と `runtime.logDir`（デフォルト `.runtime/logs`）以下に、セッションは
`runtime.agentDir`（デフォルト `.runtime/antigravity`）以下に保存される。画像添付はセッション用の
画像ファイルとして保存され、そのパスだけがモデルへの stream input に含まれる。
