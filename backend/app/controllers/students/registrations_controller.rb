# app/controllers/students/registrations_controller.rb
class Students::RegistrationsController < Devise::RegistrationsController
    respond_to :json

    def create
      # 招待トークン検証
      inv = Invitation.lock.find_by(token: params[:token], classroom_id: params[:classroom_id])
      unless inv&.usable?
        return render json: { error: "invalid_invitation" }, status: :unprocessable_entity
      end

      build_resource(sign_up_params) # DeviseのStudent生成
      resource.classroom_id = inv.classroom_id

      ActiveRecord::Base.transaction do
        resource.save!
        inv.mark_used!
      end

      token = ::JwtIssuer.issue(resource.id) # 既存のIssuer仕様に合わせて
      response.set_header("Authorization", "Bearer #{token}")

      render json: { data: { id: resource.id, name: resource.name, email: resource.email } },
             status: :created
    rescue ActiveRecord::RecordInvalid => e
      clean_up_passwords resource
      render json: { errors: resource.errors.full_messages.presence || [ e.message ] },
             status: :unprocessable_entity
    end

    protected

    def resource_name
      :student
    end

    # 例：Studentに name/email/password がある前提
    def sign_up_params
      params.require(:student).permit(:name, :email, :password, :password_confirmation)
    end
end
