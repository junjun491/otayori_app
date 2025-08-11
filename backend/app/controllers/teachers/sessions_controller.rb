module Teachers
    class SessionsController < Devise::SessionsController
      respond_to :json
      skip_before_action :authenticate_teacher!, only: [ :create, :destroy ], raise: false

      private

      def respond_with(resource, _opts = {})
        render json: {
          status: { code: 200, message: "\u30ED\u30B0\u30A4\u30F3\u306B\u6210\u529F\u3057\u307E\u3057\u305F\u3002" },
          data: resource
        }, status: :ok
      end

      def respond_to_on_destroy
        if current_teacher
          render json: {
            status: 200,
            message: "\u30ED\u30B0\u30A2\u30A6\u30C8\u306B\u6210\u529F\u3057\u307E\u3057\u305F\u3002"
          }, status: :ok
        else
          render json: {
            status: 401,
            message: "\u30ED\u30B0\u30A2\u30A6\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002"
          }, status: :unauthorized
        end
      end
    end
end
