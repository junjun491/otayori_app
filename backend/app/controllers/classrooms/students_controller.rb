# app/controllers/classrooms/students_controller.rb
module Classrooms
  class StudentsController < ApplicationController
    before_action :authenticate_teacher!
    before_action :set_classroom

    # GET /classrooms/:classroom_id/students
    def index
      students = @classroom.students.order(:id)
      render json: { data: students.as_json(only: [ :id, :name, :email ]) }
    end

    private

    def set_classroom
      @classroom = current_teacher.classroom
    end
  end
end
