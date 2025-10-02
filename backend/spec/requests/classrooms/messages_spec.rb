require 'rails_helper'

RSpec.describe "Teachers::Messages API", type: :request do
  let(:teacher)   { create(:teacher) }
  let(:classroom) { create(:classroom, teacher:) }
  let(:headers)   { auth_headers_for(teacher) } # ← JWT 付与

  describe "GET /classrooms/:classroom_id/messages/:id" do
    it "returns 401 without auth" do
      msg = create(:message, classroom:)
      get "/classrooms/#{classroom.id}/messages/#{msg.id}", headers: { 'Accept' => 'application/json' }
      expect(response).to have_http_status(:unauthorized).or have_http_status(:forbidden)
    end

    it "returns message with deliveries when authed" do
      s1 = create(:student, classroom:)
      s2 = create(:student, classroom:)
      msg = create(:message, classroom:, status: :draft, target_all: true)
      msg.publish!(recipient_ids: nil)

      get "/classrooms/#{classroom.id}/messages/#{msg.id}", headers: headers
      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      data = json.fetch("data")
      expect(data["id"]).to eq(msg.id)
      expect(data["deliveries"].size).to eq(2)
      expect(data["recipient_count"]).to eq(2)
    end
  end

  describe "POST /classrooms/:classroom_id/messages" do
    it "creates draft message" do
      params = { message: { title: "t", content: "c", target_all: true, status: "draft" } }
      post "/classrooms/#{classroom.id}/messages", params:, headers: headers
      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body).fetch("data")
      expect(data["status"]).to eq("draft")
      expect(data["recipient_count"]).to eq(0) # draft は delivery なし想定
    end

    it "creates and publishes when status=published" do
      create(:student, classroom:)
      create(:student, classroom:)
      params = { message: { title: "t", content: "c", target_all: true, status: "published" } }
      post "/classrooms/#{classroom.id}/messages", params:, headers: headers
      expect(response).to have_http_status(:created)

      data = JSON.parse(response.body).fetch("data")
      expect(data["status"]).to eq("published")
      expect(data["recipient_count"]).to eq(2)
      expect(data["deliveries"].size).to eq(2)
    end
  end

  describe "POST /classrooms/:classroom_id/messages/:id/publish" do
    it "publishes to all when target_all:true" do
      s1 = create(:student, classroom:)
      s2 = create(:student, classroom:)
      msg = create(:message, classroom:, status: :draft, target_all: true)

      post "/classrooms/#{classroom.id}/messages/#{msg.id}/publish",
           params: { message: { target_all: true } }, headers: headers
      expect(response).to have_http_status(:ok)

      data = JSON.parse(response.body).fetch("data")
      expect(data["status"]).to eq("published")
      expect(data["recipient_count"]).to eq(2)
    end

    it "publishes to given student_ids" do
      s1 = create(:student, classroom:)
      s2 = create(:student, classroom:)
      msg = create(:message, classroom:, status: :draft, target_all: false)

      post "/classrooms/#{classroom.id}/messages/#{msg.id}/publish",
           params: { message: { target_all: false, recipient_ids: [ s1.id ] } }, headers: headers
      expect(response).to have_http_status(:ok)

      data = JSON.parse(response.body).fetch("data")
      expect(data["recipient_count"]).to eq(1)
    end

    it "rejects double publish" do
      msg = create(:message, classroom:, status: :draft, target_all: true)
      post "/classrooms/#{classroom.id}/messages/#{msg.id}/publish",
           params: { message: { target_all: true } }, headers: headers
      post "/classrooms/#{classroom.id}/messages/#{msg.id}/publish",
           params: { message: { target_all: true } }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
