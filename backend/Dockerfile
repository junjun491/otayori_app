FROM ruby:3.2

# OSパッケージのインストール（Node.js, PostgreSQLクライアントなど）
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  nodejs \
  postgresql-client

# yarn は corepack 経由で入れる（Node 16+）
RUN corepack enable

# 作業ディレクトリを作成
WORKDIR /app

# GemfileとGemfile.lockだけ先にコピー（キャッシュ効かせる）
COPY ./Gemfile ./Gemfile.lock ./

# bundlerのインストール（バージョン固定も可）
RUN gem install bundler
RUN bundle install

# ソースコード全体をコピー
COPY . .

# ポート開放
EXPOSE 3001

# デフォルトコマンド（開発用）
CMD ["rails", "server", "-b", "0.0.0.0"]