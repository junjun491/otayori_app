class My::InboxController < ApplicationController
  before_action :authenticate_student!

  def index
    student = current_student

    deliveries = student
      .message_deliveries
      .includes(:message)
      .references(:message)
      .order(Arel.sql("COALESCE(messages.published_at, '1970-01-01') DESC"))

    items = deliveries.map do |d|
      m = d.message
      {
        message_id:   m&.id,
        classroom_id: m&.classroom_id,
        title:        m&.title,
        published_at: m&.published_at&.iso8601,
        deadline:     m&.deadline&.iso8601,
        read_at:      d.read_at&.iso8601
      }
    end

    render json: { items: items }
  end
end
