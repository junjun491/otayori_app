# frozen_string_literal: true

class My::MessagesController < ApplicationController
  before_action :authenticate_student!

  # GET /my/messages
  def index
    render json: { items: [] }
  end

  # GET /my/messages/:id
  def show
    render json: { id: params[:id] }
  end

  # POST /my/messages/:id/receipt
  def receipt
    # 既読処理（冪等でなくてもOK）
    head :no_content
  end

  # PUT /my/messages/:id/response
  def upsert_response
    # 回答の新規/更新（冪等）
    head :no_content
  end
end
