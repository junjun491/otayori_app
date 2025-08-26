class Classrooms::MessagesController < ApplicationController
  before_action :authenticate_api!
  before_action :ensure_teacher!
  before_action :set_classroom

  # GET /classrooms/:classroom_id/messages
  def index
    msgs = @classroom.messages.recent
    render json: { data: msgs.as_json(only: [ :id, :title, :status, :published_at, :deadline, :target_all ]) }
  end

  # POST /classrooms/:classroom_id/messages
  # { "message": { "title":"...", "content":"...", "deadline":"2025-10-05", "target_all":true/false, "recipient_ids":[1,2], "status":"draft|published" } }
  def create
    msg = @classroom.messages.new(message_params.merge(teacher_id: current_teacher.id))
    msg.save!
    if msg.published?
      msg.publish!(recipient_ids: params[:message][:recipient_ids])
    end
    render json: { data: serialize_message(msg) }, status: :created
  end

  private

  def set_classroom
    @classroom = current_teacher.classrooms.find(params[:classroom_id])
  end

  def ensure_teacher!
    head :forbidden unless current_teacher
  end

  def message_params
    params.require(:message).permit(:title, :content, :deadline, :target_all, :status)
  end

  def serialize_message(m)
    m.as_json(only: [ :id, :title, :content, :status, :published_at, :deadline, :target_all ]).merge(
      classroom_id: m.classroom_id,
      recipient_count: m.message_deliveries.count
    )
  end
end
