class ClassroomsController < ApplicationController
    before_action :authenticate_teacher!

  def index
    classes = current_teacher.classroom
    render json: { data: classes.as_json(only: [ :id, :name ]) }
  end

  def show
    classroom = current_teacher.classroom
    if classroom
      render json: classroom
    else
      render json: { error: "Classroom not found" }, status: :not_found
    end
  end

  def create
    classroom = current_teacher.build_classroom(classroom_params)
    if classroom.save
      render json: classroom, status: :created
    else
      render json: { errors: classroom.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    classroom = current_teacher.classroom
    if classroom&.update(classroom_params)
      render json: classroom
    else
      render json: { errors: classroom&.errors&.full_messages || [ "Classroom not found" ] }, status: :unprocessable_entity
    end
  end

  def destroy
    classroom = current_teacher.classroom
    if classroom&.destroy
      head :no_content
    else
      render json: { error: "Classroom not found or could not be deleted" }, status: :unprocessable_entity
    end
  end

  private

  def classroom_params
    params.require(:classroom).permit(:name)
  end
end
