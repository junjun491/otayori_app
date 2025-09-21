# frozen_string_literal: true

class My::MessagesController < ApplicationController
  before_action :authenticate_student!

  # GET /my/messages
  def index
    render json: { items: [] }
  end

  # GET /my/messages/:id
  def show
    message = Message.find(params[:id])
    student = current_student

    # 権限チェック（同じ教室に所属しているか）
    unless Student.exists?(id: student.id, classroom_id: message.classroom_id)
      return head :forbidden
    end

    # 生徒向け delivery / response を取得（存在しない場合は nil のまま）
    delivery = MessageDelivery
      .includes(:message_response)
      .find_by(message_id: message.id, student_id: student.id)
    resp = delivery&.message_response

    render json: {
      id: message.id,
      classroom_id: message.classroom_id,
      title: message.title,
      # 今は content をテキストで返す（HTML があるならそちらを）
      content_html: nil,
      content_text: message.content.to_s,
      published_at: message.published_at&.iso8601,
      deadline: message.deadline&.to_s,
      delivery: {
        confirmed_at: delivery&.confirmed_at,
        responded_at: resp&.responded_at,
        status: (resp&.status.presence || "none"),
        form_data: resp&.form_data
      }
    }
  end

  # POST /my/messages/:id/confirmed
  def confirmed
    message = Message.find(params[:id])

    delivery = MessageDelivery.find_or_initialize_by(
      message_id: message.id,
      student_id: current_student.id # ログイン中の生徒を使う
    )

    # 初回のみ値を入れる（冪等）
    delivery.confirmed_at ||= Time.current
    delivery.save!

    render json: {
      id: message.id,
      delivery: {
        confirmed_at: delivery.confirmed_at
      }
    }
  end

  # PUT /my/messages/:id/response
  def upsert_response
    # 回答の新規/更新（冪等）
    head :no_content
  end
end
