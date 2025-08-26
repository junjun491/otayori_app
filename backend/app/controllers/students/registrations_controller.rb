# app/controllers/students/registrations_controller.rb
class Students::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    inv = Invitation.lock.find_by(token: params[:token], classroom_id: params[:classroom_id])
    unless inv&.usable?
      return render json: { error: "invalid_invitation" }, status: :unprocessable_entity
    end

    build_resource(sign_up_params)
    resource.classroom_id = inv.classroom_id

    ActiveRecord::Base.transaction do
      resource.save!
      inv.mark_used!
    end

    # ★ JwtIssuer の署名方式に合わせる（id or userオブジェクト）
    token = ::JwtIssuer.issue(resource)
    response.set_header("Authorization", "Bearer #{token}")

    render json: { data: { id: resource.id, name: resource.name, email: resource.email } }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    clean_up_passwords resource
    render json: { errors: resource.errors.full_messages.presence || [ e.message ] }, status: :unprocessable_entity
  end

  protected
  def resource_name; :student; end
  def sign_up_params
    params.require(:student).permit(:name, :email, :password, :password_confirmation)
  end
end
