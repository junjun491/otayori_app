# frozen_string_literal: true

require "jwt"

class JwtIssuer
  ISS = "otayori_api"
  AUD = "otayori_frontend"

  def self.issue(subject_id, exp: 24.hours.from_now)
    payload = {
      sub: "teacher:#{subject_id}",
      iat: Time.now.to_i,
      exp: exp.to_i,
      iss: ISS,
      aud: AUD
    }
    JWT.encode(payload, secret_key, "HS256")
  end

  def self.decode(token)
    decoded, = JWT.decode(
      token, secret_key, true,
      { algorithm: "HS256", verify_iss: true, iss: ISS, verify_aud: true, aud: AUD }
    )
    decoded
  end

  def self.secret_key
    if Rails.env.development?
      Rails.application.secret_key_base
    else
      ENV["JWT_SECRET"] ||
        Rails.application.credentials.dig(:jwt, :secret) ||
        Rails.application.secret_key_base
    end
  end
end
