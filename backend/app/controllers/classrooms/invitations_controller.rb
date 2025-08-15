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
