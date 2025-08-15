# app/controllers/classrooms/invitations_controller.rb
class Classrooms::InvitationsController < ApplicationController
    before_action :authenticate_teacher!
    before_action :set_classroom

    # GET /classrooms/:classroom_id/invitations
    def index
      invitations = @classroom.invitations.order(created_at: :desc).limit(50)
      render json: { data: invitations.as_json(only: [ :id, :email, :token, :used, :expires_at, :created_at ]) }
    end

    # POST /classrooms/:classroom_id/invitations
    # body: { "email": "student@example.com" }
    def create
      invitation = @classroom.invitations.create!(email: params.require(:email))

      if real_send?
        InvitationMailer.invite(invitation).deliver_later
      end

      render json: {
        data: {
          id: invitation.id,
          email: invitation.email,
          token: invitation.token,
          signup_url: signup_url_for(invitation),
          mailed: real_send?
        }
      }, status: :created
    end

    def show
      inv = @classroom.invitations.find(params[:id])
      payload = inv.as_json(only: [ :id, :email, :used, :expires_at, :created_at ])
      if inv.usable?
        base = Rails.application.config_for(:frontend)["base_url"]
        payload[:signup_url] = "#{base}/signup?token=#{inv.token}&classroom_id=#{inv.classroom_id}"
      end
      response.set_header("Cache-Control", "no-store")
      render json: { data: payload }
    end

    def verify
      inv = Invitation.find_by(token: params[:token], classroom_id: params[:classroom_id])
      valid = inv.present? && inv.usable?
      reason =
        if inv.nil? then "not_found"
        elsif inv.used then "used"
        elsif inv.expires_at&.past? then "expired"
        else nil end
      render json: { data: { valid:, reason: } }
    end

    private
    def set_classroom
      @classroom = current_teacher.classrooms.find(params[:classroom_id])
    end

    def real_send?
      ActiveModel::Type::Boolean.new.cast(ENV.fetch("MAIL_REAL_SEND", "false"))
    end

    def signup_url_for(inv)
      base = Rails.application.config_for(:frontend)["base_url"]
      "#{base}/signup?token=#{inv.token}&classroom_id=#{inv.classroom_id}"
    end
end
