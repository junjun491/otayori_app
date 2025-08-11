module Students
    class SessionsController < Devise::SessionsController
      respond_to :json
  
      private
  
      def respond_with(resource, _opts = {})
      render json: {
        status: { code: 200, message: 'ログインに成功しました。' },
        data: StudentSerializer.new(resource).serializable_hash[:data][:attributes]
      }, status: :ok
      end
  
      def respond_to_on_destroy
        if current_student
          render json: {
            status: 200,
            message: 'ログアウトに成功しました。'
          }, status: :ok
        else
          render json: {
            status: 401,
            message: 'ログアウトに失敗しました。'
          }, status: :unauthorized
        end
      end
    end
  end
  