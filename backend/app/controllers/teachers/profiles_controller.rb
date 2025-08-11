module Teachers
  class ProfilesController < ApplicationController
    before_action :authenticate_teacher!

    def show
      render json: { data: current_teacher.slice(:id, :email, :name) }, status: :ok
    end
  end
end
