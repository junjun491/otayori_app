# frozen_string_literal: true

module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    attr_reader :current_user, :current_teacher, :current_student
    helper_method :current_user, :current_teacher, :current_student if respond_to?(:helper_method)
  end

  # 例:
  #   before_action -> { authenticate_api! }                 # 誰でも(Teacher/Student)OK
  #   before_action -> { authenticate_teacher! }             # 教師限定
  #   before_action -> { authenticate_student! }             # 生徒限定
  #
  def authenticate_api!(role: nil)
    token = request.headers["Authorization"].to_s.split(" ").last
    return unauthorized!("missing token") if token.blank?

    begin
      payload = JwtIssuer.decode(token)
      sub     = payload["sub"].to_s # "teacher:123" / "student:45"

      user = resolve_user_from(sub)

      unauthorized!("invalid user") and return unless user

      case role
      when :teacher
        unauthorized!("forbidden (teacher only)") and return unless user.is_a?(Teacher)
      when :student
        unauthorized!("forbidden (student only)") and return unless user.is_a?(Student)
      end

      @current_teacher = user if user.is_a?(Teacher)
      @current_student = user if user.is_a?(Student)
      @current_user    = user

    rescue JWT::ExpiredSignature
      unauthorized!("expired")
    rescue JWT::DecodeError
      unauthorized!("invalid token")
    end
  end

  # ショートカット（before_action で使いやすく）
  def authenticate_teacher! = authenticate_api!(role: :teacher)
  def authenticate_student! = authenticate_api!(role: :student)

  private

  def resolve_user_from(sub)
    prefix, id_str = sub.include?(":") ? sub.split(":", 2) : [ nil, sub ]
    id = id_str.to_s.presence

    case prefix&.downcase
    when "teacher", "teachers"
      Teacher.find_by(id: id)
    when "student", "students"
      Student.find_by(id: id)
    else
      nil
    end
  end

  def unauthorized!(msg)
    render json: { errors: [ "unauthorized: #{msg}" ] }, status: :unauthorized
  end
end
