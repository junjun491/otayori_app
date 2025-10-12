# 本番/ステージングで既定ON。ローカル検証時は RACK_ATTACK=1 でON。
Rack::Attack.enabled = Rails.env.production? || Rails.env.staging? || ENV["RACK_ATTACK"] == "1"

# キャッシュ（カウンタ）に Rails.cache を使う明示（デフォルトでも大体これ）
Rack::Attack.cache.store = Rails.cache

class Rack::Attack
  ### --- まずはサイレンス/許可系 ---

  # ヘルスチェックは常に許可＆ログ抑制したい
  safelist("allow-healthz") { |req| req.path == "/healthz" }

  # ローカルホスト(開発時の自分)は無条件許可したいときは ↓（任意）
  # safelist("allow-localhost") { |req| ["127.0.0.1", "::1"].include?(req.ip) }

  ### --- グローバルなレート制限 ---

  if Rack::Attack.enabled
    # 基本：IP単位で 1分あたり 300 リクエストまで
    throttle("req/ip", limit: (ENV["RATE_LIMIT_REQ_PER_MIN"] || 300).to_i, period: 60) do |req|
      req.ip
    end

    # ログイン試行を厳しめに：IP単位で 1分あたり 20 回まで
    LOGIN_PATHS = [ "/teachers/sign_in", "/students/sign_in" ].freeze
    throttle("logins/ip", limit: (ENV["RATE_LIMIT_LOGIN_PER_MIN"] || 20).to_i, period: 60) do |req|
      req.ip if req.post? && LOGIN_PATHS.any? { |p| req.path.start_with?(p) }
    end

    # 429 応答の共通フォーマット（JSON）
    self.throttled_response = lambda do |env|
      now = Time.now.utc
      match = env["rack.attack.match_data"] || {}
      retry_after = match[:period].to_i.nonzero? || 60

      headers = {
        "Content-Type" => "application/json; charset=utf-8",
        "Retry-After"  => retry_after.to_s
      }
      body = {
        error: "Too Many Requests",
        at: now.iso8601,
        rule: env["rack.attack.matched"],
        request_id: env["action_dispatch.request_id"]
      }.to_json

      [ 429, headers, [ body ] ]
    end
  end
end
