class Teachers::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)

    if resource.save
      # sign_in(resource) はセッション使用するためコメントアウト
      render json: { status: :ok, message: "\u767B\u9332\u6210\u529F", data: resource }
    else
      clean_up_passwords resource
      render json: { status: :error, message: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  protected

  def resource_name
    :teacher
  end

  def sign_up_params
    params.require(:teacher).permit(:name, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.require(:teacher).permit(:name, :email, :password, :password_confirmation, :current_password)
  end

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: { status: :ok, message: "\u767B\u9332\u6210\u529F", data: resource }
    else
      render json: { status: :error, message: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
