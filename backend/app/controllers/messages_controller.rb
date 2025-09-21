class MessagesController < ApplicationController
  before_action :authenticate_teacher!
  before_action :set_message

  def show
    if current_teacher
      return head :forbidden unless @message.teacher_id == current_teacher.id
    elsif current_student
      return head :forbidden unless @message.message_deliveries.exists?(student_id: current_student.id)
    else
      return head :forbidden
    end
    render json: { data: serialize_message(@message) }
  end

  def publish
    ensure_teacher_sender!
    @message.publish!(recipient_ids: params[:recipient_ids])
    render json: { data: serialize_message(@message) }
  end

  def disable
    ensure_teacher_sender!
    @message.disable!
    render json: { data: serialize_message(@message) }
  end

  def destroy
    ensure_teacher_sender!
    return render(json: { error: "not_deletable" }, status: :unprocessable_entity) unless @message.deletable?
    @message.destroy!
    head :no_content
  end

  private

  def set_message
    @message = Message.find(params[:id])
  end

  def ensure_teacher_sender!
    head :forbidden unless current_teacher && @message.teacher_id == current_teacher.id
  end

  def serialize_message(m)
    m.as_json(only: [ :id, :title, :content, :status, :published_at, :deadline, :target_all ])
     .merge(classroom_id: m.classroom_id,
            teacher_id: m.teacher_id,
            deliveries: m.message_deliveries.select(:id, :student_id, :confirmed_at))
  end
end
