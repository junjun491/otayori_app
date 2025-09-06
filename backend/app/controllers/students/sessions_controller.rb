module Students
  class SessionsController < Devise::SessionsController
    respond_to :json

    def create
      email = params.dig(:student, :email)
      password = params.dig(:student, :password)

      student = Student.find_for_database_authentication(email: email)
      unless student&.valid_password?(password)
        return render json: { errors: [ "Invalid email or password" ] }, status: :unauthorized
      end

      token = ::JwtIssuer.issue(student)
      response.set_header("Authorization", "Bearer #{token}")

      render json: {
        data: {
          id:    student.id,
          name:  student.name,
          email: student.email
        }
      }, status: :ok
    end

    def destroy
      render json: { message: "logged out" }, status: :ok
    end
  end
end
