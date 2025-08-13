# app/controllers/teachers/registrations_controller.rb
class Teachers::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)

    if resource.save
      # ★ サインアップ成功時にJWT発行 → Authorizationヘッダへ
      token = ::JwtIssuer.issue(resource.id)
      response.set_header("Authorization", "Bearer #{token}")

      render json: {
        data: { id: resource.id, name: resource.name, email: resource.email }
      }, status: :created
    else
      clean_up_passwords resource
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  protected

  def resource_name
    :teacher
  end

  def sign_up_params
    params.require(:teacher).permit(:name, :email, :password, :password_confirmation)
  end
end
