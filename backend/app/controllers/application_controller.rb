class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers
  include Devise::Controllers::ScopedViews
  include JwtAuthenticatable

  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "not_found" }, status: :not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render json: { error: "validation_error", details: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    # サインアップ時に name を許可
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
  end
end
