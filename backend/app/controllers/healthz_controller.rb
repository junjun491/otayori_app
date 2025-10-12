class HealthzController < ActionController::API
  def show
    # 最小：起動確認だけ
    payload = { status: "ok", time: Time.current.iso8601 }

    # 発展：DBも軽く疎通（任意）
    begin
      ActiveRecord::Base.connection.execute("SELECT 1")
      payload[:db] = "ok"
    rescue => e
      payload[:db] = "ng"
      payload[:error] = e.class.name
      return render json: payload, status: :service_unavailable
    end

    render json: payload
  end
end
