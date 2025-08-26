class Messages::ResponsesController < ApplicationController
  before_action :authenticate_api!
  before_action :set_message

  # GET /messages/:message_id/responses
  def index
    if current_teacher
      return head :forbidden unless @message.teacher_id == current_teacher.id
      stats = {
        recipients: @message.message_deliveries.count,
        submitted: MessageResponse.joins(:message_delivery)
                    .where(message_deliveries: { message_id: @message.id }, status: :submitted).count
      }
      render json: { data: stats }
    elsif current_student
      delivery = @message.message_deliveries.find_by(student_id: current_student.id)
      return head :forbidden unless delivery
      resp = delivery.message_response
      render json: { data: resp&.as_json(only: [ :id, :status, :form_data, :responded_at ]) }
    else
      head :forbidden
    end
  end

  # POST /messages/:message_id/responses
  # { "form_data": {...}, "submit": true/false }
  def create
    return head :forbidden unless current_student
    delivery = @message.message_deliveries.find_by!(student_id: current_student.id)
    resp = delivery.message_response || delivery.build_message_response
    resp.save_form!(data: params.require(:form_data), submit: params[:submit])
    render json: { data: resp.as_json(only: [ :id, :status, :form_data, :responded_at ]) }, status: :created
  end

  private

  def set_message
    @message = Message.find(params[:message_id])
  end
end
