class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers
  include Devise::Controllers::ScopedViews
    before_action :configure_permitted_parameters, if: :devise_controller?

    protected

    def configure_permitted_parameters
      # サインアップ時に name を許可
      devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
    end
end
