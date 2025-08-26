module FrontendUrl
  module_function

  def base
    # frontend.yml の base_url → なければ APP_ORIGIN → それでもなければ localhost
    raw = Rails.application.config_for(:frontend)["base_url"] rescue nil
    raw ||= ENV["APP_ORIGIN"]
    (raw.presence || "http://localhost:3000").to_s.chomp("/")
  end

  def signup_student(invitation)
    "#{base}/signup/student?#{{
      token: invitation.token,
      classroom_id: invitation.classroom_id
    }.to_query}"
  end
end
