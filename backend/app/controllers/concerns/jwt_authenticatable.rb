# frozen_string_literal: true

module JwtAuthenticatable
    extend ActiveSupport::Concern

    included do
      attr_reader :current_teacher
      helper_method :current_teacher if respond_to?(:helper_method)
    end

    def authenticate_api!
      token = request.headers["Authorization"].to_s.split(" ").last
      return unauthorized!("missing token") if token.blank?

      begin
        payload = JwtIssuer.decode(token)
        id = payload["sub"].to_s.split(":").last
        @current_teacher = Teacher.find_by(id: id)
        unauthorized!("invalid user") unless @current_teacher
      rescue JWT::ExpiredSignature
        unauthorized!("expired")
      rescue JWT::DecodeError
        unauthorized!("invalid token")
      end
    end

    def unauthorized!(msg)
      render json: { errors: [ "unauthorized: #{msg}" ] }, status: :unauthorized
    end
end
