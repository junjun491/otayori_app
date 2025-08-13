module Teachers
  class SessionsController < Devise::SessionsController
    respond_to :json

    def create
      email = params.dig(:teacher, :email)
      password = params.dig(:teacher, :password)

      teacher = Teacher.find_for_database_authentication(email: email)
      unless teacher&.valid_password?(password)
        return render json: { errors: [ "Invalid email or password" ] }, status: :unauthorized
      end

      token = ::JwtIssuer.issue(teacher.id)
      response.set_header("Authorization", "Bearer #{token}")

      render json: {
        data: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email
        }
      }, status: :ok
    end

    def destroy
      render json: { message: "logged out" }, status: :ok
    end
  end
end
