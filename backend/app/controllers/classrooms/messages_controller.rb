class Classrooms::MessagesController < ApplicationController
  before_action :authenticate_teacher!
  before_action :ensure_teacher!
  before_action :set_classroom
  before_action :set_message, only: [ :show, :publish, :disable ]

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

  # GET /classrooms/:classroom_id/messages/:id
  def show
    render json: { data: serialize_message(@message) }
  end

  # POST /classrooms/:classroom_id/messages/:id/publish
  def publish
    return render json: { error: "already_published" }, status: :unprocessable_entity unless @message.draft?

    p = params.require(:message).permit(:target_all, recipient_ids: [])
    target_all = ActiveModel::Type::Boolean.new.cast(p[:target_all])
    rids = target_all ? nil : p[:recipient_ids]
    rids = nil if rids.blank? # 未指定は全員

    @message.publish!(recipient_ids: rids)
    render json: { data: serialize_message(@message) }, status: :ok
  end

  # 任意: 無効化
  def disable
    @message.disable!
    render json: { data: serialize_message(@message) }, status: :ok
  end

  private

  def set_classroom
    @classroom = current_teacher.classroom
  end

  def ensure_teacher!
    head :forbidden unless current_teacher
  end

  def message_params
    params.require(:message).permit(:title, :content, :deadline, :target_all, :status)
  end

def serialize_message(msg)
  base = msg.as_json(
    only: %i[id title content status published_at deadline target_all classroom_id]
  )

  deliveries = msg.message_deliveries.includes(:student)  # ★追加

  base["recipient_count"] =
    msg.published? ? deliveries.size : msg.students.size  # ★改善（下で解説）

  base["deliveries"] = deliveries.map do |d|
    s = d.student
    {
      id: d.id,
      recipient_id: s&.id,
      recipient_name: s&.name,
      recipient_email: s&.email,
      confirmed_at: d.confirmed_at
    }
  end

  base
end

  private

  def set_message
    # /classrooms/:classroom_id/messages/:id の :id を使用
    @message = @classroom.messages.find_by(id: params[:id])
    return if @message

    render json: { error: "not_found" }, status: :not_found
  end
end
