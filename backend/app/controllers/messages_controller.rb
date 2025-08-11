class MessagesController < ApplicationController
    before_action :authenticate_teacher!
  
    # GET /messages
    def index
      messages = current_teacher.messages.order(created_at: :desc)
      render json: messages
    end
  
    # GET /messages/:id
    def show
      message = current_teacher.messages.find_by(id: params[:id])
      if message
        render json: message
      else
        render json: { error: 'Message not found' }, status: :not_found
      end
    end
  
    # POST /messages
    def create
        classroom = current_teacher.classroom
        return render json: { error: 'Classroom not found' }, status: :unprocessable_entity unless classroom
      
        message = classroom.messages.build(message_params.merge(teacher: current_teacher, status: :draft))
      
        if message.save
          # ✅ ここで全生徒に MessageDelivery を生成
          classroom.students.find_each do |student|
            MessageDelivery.create!(message: message, student: student)
          end
      
          render json: message, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end
  
    private
  
    def message_params
      params.require(:message).permit(:title, :content, :published_at, :deadline)
    end
  end
  