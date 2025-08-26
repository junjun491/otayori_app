# app/controllers/classrooms/invitations_controller.rb
class Classrooms::InvitationsController < ApplicationController
  include JwtAuthenticatable

  before_action :authenticate_api!
  before_action :set_classroom,     except: [ :verify ]
  # ← verify は生徒が未認証で叩く。ここをスキップ
  skip_before_action :authenticate_api!, only: [ :verify ]

  # GET /classrooms/:classroom_id/invitations
  def index
    invitations = @classroom.invitations.order(created_at: :desc).limit(50)
    render json: { data: invitations.as_json(only: [ :id, :email, :token, :used, :expires_at, :created_at ]) }
  end

  # POST /classrooms/:classroom_id/invitations
  # body: { "email": "student@example.com" }
  def create
    p = params.require(:invitation).permit(:email, :expires_at)
    email = p[:email]
    raise ActionController::ParameterMissing, :email if email.blank?

    invitation = @classroom.invitations.create!(
      email: email,
      expires_at: 7.days.from_now
    )

    if real_send?
      # メイラーの呼び出し形を統一（with(...).invite_email.deliver_later 推奨）
      InvitationMailer.invite(invitation).deliver_later
    end

    render json: {
      data: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        signup_url: ::FrontendUrl.signup_student(invitation),
        expires_at: invitation.expires_at,
        mailed: real_send?
      }
    }, status: :created
  end

  def show
    inv = @classroom.invitations.find(params[:id])
    payload = inv.as_json(only: [ :id, :email, :used, :expires_at, :created_at ])
    if inv.usable?
      payload[:signup_url] = signup_url_for(inv)
    end
    response.set_header("Cache-Control", "no-store")
    render json: { data: payload }
  end

  # ★ verify は「未認証でもOK」の公開API想定
  #    → 本当は /signups/verify に置くのが綺麗（推奨）
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
    @classroom = current_teacher.classroom
  end

  def real_send?
    ActiveModel::Type::Boolean.new.cast(ENV.fetch("MAIL_REAL_SEND", "false"))
  end
end
