Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Json.new

  # パラメータで秘匿したいものは Rails 既定の filter_parameter_logging に依存
  # 追加するなら config/initializers/filter_parameter_logging.rb を編集

  # 追加でログに含めたい情報（相関IDなど）
  config.lograge.custom_options = lambda do |event|
    req = event.payload[:request]
    {
      request_id: event.payload[:request_id] || req&.request_id,
      remote_ip:  req&.ip,
      user_agent: req&.user_agent
      # ロール・ユーザーIDを入れたければここで安全に
      # user_id: Current.user&.id, role: Current.user&.role
    }.compact
  end
end
